import { Types } from 'mongoose';
import { UserModel } from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import httpStatus from 'http-status';
import { USER_ROLE } from '@/constants/current-user/user.const';

export async function getAuthorizedTourIds(userId: string): Promise<Types.ObjectId[]> {
    const user = await UserModel.findById(userId).select('role').lean();
    if (!user) {
        throw new ApiError('User not found', httpStatus.UNAUTHORIZED);
    }

    let companyId: Types.ObjectId | undefined;

    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userId }).select('companyId').lean();
        if (!employee || !employee.companyId) {
            throw new ApiError('Employee record or company missing', httpStatus.FORBIDDEN);
        }
        companyId = employee.companyId;
    } else if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ 'owner.user': userId }).select('_id').lean();
        if (!guide) {
            throw new ApiError('Guide record missing', httpStatus.FORBIDDEN);
        }
        companyId = guide._id as Types.ObjectId;
    } else {
        throw new ApiError('Unauthorized role for FAQ management', httpStatus.FORBIDDEN);
    }

    const tours = await TourModel.find({ companyId }).select('_id').lean();
    return tours.map((tour) => tour._id as Types.ObjectId);
}
