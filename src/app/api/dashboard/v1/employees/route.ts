// app/api/dashboard/v1/employees/route.ts
import { NextRequest } from 'next/server';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel, { IEmployee } from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { EMPLOYEE_STATUS, EmployeeStatus } from '@/constants/employee/employee.const';
import { Currency } from '@/constants/tour/tour.const';
import ConnectDB from '@/config/db';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { EmployeeSummary } from '@/types/dashboard/dashboard.type';

// Allowed status values derived from enum
const allowedStatuses: Set<string> = new Set(Object.values(EMPLOYEE_STATUS));

async function getEmployeesHandler(request: NextRequest): Promise<HandlerResult<EmployeeSummary[]>> {
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
        throw new ApiError('Access denied: only guides and assistants can access employees', 403);
    }

    // 4. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const employeeStatusParam = searchParams.get('employeeStatus');
    const dateFromParam = searchParams.get('employeesDateRangeFrom');
    const dateToParam = searchParams.get('employeesDateRangeTo');

    // Validate status if provided
    if (employeeStatusParam && !allowedStatuses.has(employeeStatusParam)) {
        throw new ApiError(
            `Invalid employeeStatus. Must be one of: ${Array.from(allowedStatuses).join(', ')}`,
            400
        );
    }

    // 5. Build filter for employees of this company (not soft-deleted)
    const filter: FilterQuery<IEmployee> = {
        companyId,
        deletedAt: null,          // exclude soft-deleted employees
    };

    if (employeeStatusParam) {
        filter.status = employeeStatusParam as EmployeeStatus;
    }

    if (dateFromParam || dateToParam) {
        filter.dateOfJoining = {};
        if (dateFromParam) {
            const fromDate = new Date(dateFromParam);
            if (isNaN(fromDate.getTime())) {
                throw new ApiError('Invalid employeesDateRangeFrom date', 400);
            }
            filter.dateOfJoining.$gte = fromDate;
        }
        if (dateToParam) {
            const toDate = new Date(dateToParam);
            if (isNaN(toDate.getTime())) {
                throw new ApiError('Invalid employeesDateRangeTo date', 400);
            }
            toDate.setHours(23, 59, 59, 999);
            filter.dateOfJoining.$lte = toDate;
        }
    }

    // 6. Fetch employees with user population
    const employees = await EmployeeModel.find(filter)
        .populate<{ user: { _id: Types.ObjectId; name: string; email: string } }>({
            path: 'user',
            select: 'name email',
        })
        .select('status employmentType salary currency dateOfJoining')
        .lean();

    // 7. Transform to EmployeeSummary[]
    const summaries: EmployeeSummary[] = employees.map((emp) => ({
        _id: emp._id.toString(),
        user: {
            _id: emp.user._id.toString(),
            name: emp.user.name,
            email: emp.user.email,
        },
        status: emp.status as EmployeeStatus,
        employmentType: emp.employmentType,
        salary: emp.salary,
        currency: emp.currency as Currency,
        dateOfJoining: emp.dateOfJoining,
    }));

    return { data: summaries };
}

export const GET = withErrorHandler(getEmployeesHandler);