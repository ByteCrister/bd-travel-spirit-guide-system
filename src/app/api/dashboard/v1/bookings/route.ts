// app/api/dashboard/v1/bookings/route.ts
import { NextRequest } from 'next/server';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import BookingModel, { IBooking } from '@/models/tours/booking.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { Currency } from '@/constants/tour/tour.const';
import { BookingStatus, BOOKING_STATUS } from '@/constants/tour/tour-booking.const';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { BookingSummary } from '@/types/dashboard/dashboard.type';

// Set of allowed booking statuses (as strings for validation)
const allowedBookingStatuses: Set<string> = new Set(Object.values(BOOKING_STATUS));


async function getBookingsHandler(request: NextRequest): Promise<HandlerResult<BookingSummary[]>> {
    // 1. Authenticate and validate user ID
    const userIdString = await getUserIdFromSession();
    if (!userIdString || !Types.ObjectId.isValid(userIdString)) {
        throw new ApiError('Unauthorized: Invalid or missing user ID', 401);
    }
    const userId = new Types.ObjectId(userIdString);

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
        throw new ApiError('Access denied: only guides and assistants can access bookings', 403);
    }

    // 4. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const bookingStatusParam = searchParams.get('bookingStatus');
    const dateFromParam = searchParams.get('bookingsDateRangeFrom');
    const dateToParam = searchParams.get('bookingsDateRangeTo');

    // Validate status if provided
    if (bookingStatusParam && !allowedBookingStatuses.has(bookingStatusParam)) {
        throw new ApiError(
            `Invalid bookingStatus. Must be one of: ${Array.from(allowedBookingStatuses).join(', ')}`,
            400
        );
    }

    // 5. Fetch tours belonging to this company (not soft-deleted)
    const tours = await TourModel.find({
        companyId,
        deletedAt: null,
    })
        .select('_id title basePrice.currency')
        .lean();

    if (!tours.length) {
        // No tours → no bookings
        return { data: [] };
    }

    const tourIds = tours.map((tour) => tour._id);
    const tourCurrencyMap = new Map<string, Currency>(
        tours.map((tour) => [tour._id.toString(), tour.basePrice.currency])
    );

    // 6. Build booking filter with proper typing
    const bookingFilter: FilterQuery<IBooking> = {
        tour: { $in: tourIds },
        deletedAt: null,
    };

    if (bookingStatusParam) {
        // Safe cast because we validated it's one of the allowed values
        bookingFilter.status = bookingStatusParam as BookingStatus;
    }

    if (dateFromParam || dateToParam) {
        bookingFilter.bookedAt = {};
        if (dateFromParam) {
            const fromDate = new Date(dateFromParam);
            if (isNaN(fromDate.getTime())) {
                throw new ApiError('Invalid bookingsDateRangeFrom date', 400);
            }
            bookingFilter.bookedAt.$gte = fromDate;
        }
        if (dateToParam) {
            const toDate = new Date(dateToParam);
            if (isNaN(toDate.getTime())) {
                throw new ApiError('Invalid bookingsDateRangeTo date', 400);
            }
            toDate.setHours(23, 59, 59, 999);
            bookingFilter.bookedAt.$lte = toDate;
        }
    }

    // 7. Fetch bookings with population
    const bookings = await BookingModel.find(bookingFilter)
        .populate<{ traveler: { _id: Types.ObjectId; name: string; email: string } }>({
            path: 'traveler',
            select: 'name email',
        })
        .populate<{ tour: { _id: Types.ObjectId; title: string } }>({
            path: 'tour',
            select: 'title',
        })
        .lean();

    // 8. Transform to BookingSummary[]
    const summaries: BookingSummary[] = bookings.map((booking) => {
        const traveler = booking.traveler;
        const tour = booking.tour;
        const currency = tourCurrencyMap.get(tour?._id?.toString() ?? '') || 'BDT';

        return {
            _id: booking._id.toString(),
            bookingReference: booking.bookingReference,
            traveler: {
                _id: traveler?._id?.toString() ?? '',
                name: traveler?.name ?? 'Unknown',
                email: traveler?.email ?? '',
            },
            tour: {
                _id: tour?._id?.toString() ?? '',
                title: tour?.title ?? 'Unknown Tour',
            },
            totalParticipants: booking.totalParticipants,
            totalPaid: booking.totalPaid,
            currency,
            status: booking.status,
            paymentStatus: booking.payment.status,
            bookedAt: booking.bookedAt,
        };
    });

    return { data: summaries };
}

export const GET = withErrorHandler(getBookingsHandler);