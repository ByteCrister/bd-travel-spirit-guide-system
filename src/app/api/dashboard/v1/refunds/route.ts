// app/api/dashboard/v1/refunds/route.ts
import { NextRequest } from 'next/server';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import BookingModel, { IBooking } from '@/models/tours/booking.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { BOOKING_PAYMENT_STATUS, BookingPaymentStatus } from '@/constants/tour/tour-booking.const';
import { Currency } from '@/constants/tour/tour.const';
import ConnectDB from '@/config/db';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { RefundSummary } from '@/types/dashboard/dashboard.type';

// Type for a booking with populated tour (only currency needed)
type PopulatedBooking = {
    _id: Types.ObjectId;
    bookingReference: string;
    totalPaid: number;
    cancellation: {
        cancelledAt: Date;
        refundAmount?: number;
        refundStatus?: BookingPaymentStatus;
    };
    tour: { basePrice: { currency: Currency } };
};

async function getRefundsHandler(request: NextRequest): Promise<HandlerResult<RefundSummary[]>> {
    // 1. Authenticate and validate user ID
    const userIdString = await getUserIdFromSession();
    if (!userIdString || !Types.ObjectId.isValid(userIdString)) {
        throw new ApiError('Unauthorized: Invalid or missing user ID', 401);
    }
    const userId = new Types.ObjectId(userIdString);

    await ConnectDB();

    // 2. Fetch user role
    const user = await UserModel.findById(userId).select('role').lean();
    if (!user) {
        throw new ApiError('User not found', 404);
    }

    // 3. Resolve companyId based on role
    let companyId: Types.ObjectId | null = null;

    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userId })
            .select('companyId')
            .lean();
        if (!employee || !employee.companyId) {
            throw new ApiError('Employee record not found or missing company association', 403);
        }
        companyId = employee.companyId;
    } else if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ 'owner.user': userId })
            .select('_id')
            .lean();
        if (!guide) {
            throw new ApiError('Guide profile not found', 403);
        }
        companyId = guide._id as Types.ObjectId;
    } else {
        throw new ApiError('Access denied: only guides and assistants can access refunds', 403);
    }

    // 4. Parse date range parameters
    const searchParams = request.nextUrl.searchParams;
    const dateFromParam = searchParams.get('refundsDateRangeFrom');
    const dateToParam = searchParams.get('refundsDateRangeTo');

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (dateFromParam) {
        fromDate = new Date(dateFromParam);
        if (isNaN(fromDate.getTime())) {
            throw new ApiError('Invalid refundsDateRangeFrom date', 400);
        }
    }
    if (dateToParam) {
        toDate = new Date(dateToParam);
        if (isNaN(toDate.getTime())) {
            throw new ApiError('Invalid refundsDateRangeTo date', 400);
        }
        toDate.setHours(23, 59, 59, 999);
    }

    // 5. Fetch tours belonging to this company (not soft-deleted)
    const tours = await TourModel.find({
        companyId,
        deletedAt: null,
    })
        .select('_id')
        .lean();

    if (!tours.length) {
        return { data: [] };
    }

    const tourIds = tours.map(tour => tour._id);

    // 6. Build booking filter for cancelled bookings with refund data
    const filter: FilterQuery<IBooking> = {
        tour: { $in: tourIds },
        deletedAt: null,
        cancellation: { $exists: true, $ne: null }, // only cancelled bookings
        'cancellation.refundAmount': { $exists: true, $ne: null }, // must have a refund amount
    };

    if (fromDate || toDate) {
        filter['cancellation.cancelledAt'] = {};
        if (fromDate) filter['cancellation.cancelledAt'].$gte = fromDate;
        if (toDate) filter['cancellation.cancelledAt'].$lte = toDate;
    }

    // 7. Fetch bookings with tour populated (to get currency)
    const bookings = (await BookingModel.find(filter)
        .populate<{ tour: { basePrice: { currency: Currency } } }>({
            path: 'tour',
            select: 'basePrice.currency',
        })
        .lean()) as unknown as PopulatedBooking[];

    // 8. Transform to RefundSummary[]
    const summaries: RefundSummary[] = bookings.map(booking => {
        const currency = booking.tour?.basePrice?.currency || 'BDT';
        const refundAmount = booking.cancellation.refundAmount ?? 0;
        const refundStatus = booking.cancellation.refundStatus ?? BOOKING_PAYMENT_STATUS.PENDING;

        return {
            _id: booking._id.toString(),
            booking: booking.bookingReference,
            amount: refundAmount,
            currency,
            status: refundStatus,
            requestedAt: booking.cancellation.cancelledAt,
            processedAt: undefined, // no dedicated field in schema; could be derived from payment history if needed
        };
    });

    return { data: summaries };
}

export const GET = withErrorHandler(getRefundsHandler);