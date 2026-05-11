import UserModel from "@/models/user.model";
import { IBaseUser } from "@/types/current-user.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import EmployeeModel from "@/models/employees/employees.model";
import GuideModel from "@/models/guide/guide.model";

export const GET = withErrorHandler(async () => {
    await ConnectDB();

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // ── Aggregation pipeline ────────────────────────────────────
    const [result] = await UserModel.aggregate([
        // 1. Find the current user and restrict roles
        {
            $match: {
                _id: new Types.ObjectId(userId),
                role: { $in: [USER_ROLE.GUIDE, USER_ROLE.ASSISTANT] },
            },
        },
        // 2. Look for an employee record linked to this user
        {
            $lookup: {
                from: getCollectionName(EmployeeModel), // "employees"
                localField: "_id",
                foreignField: "user",
                as: "employee",
            },
        },
        // 3. Unwind with preserveNullAndEmptyArrays for guides
        {
            $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays: true,
            },
        },
        // 4. Look up the guide (company) for the employee
        {
            $lookup: {
                from: getCollectionName(GuideModel),   // "guides"
                let: { companyId: "$employee.companyId" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$companyId"] } } },
                    { $match: { deletedAt: null } },          // ignore soft‑deleted guides
                ],
                as: "guide",
            },
        },
        // 5. Unwind the guide array (again, preserve nulls)
        {
            $unwind: {
                path: "$guide",
                preserveNullAndEmptyArrays: true,
            },
        },
        // 6. Project the final shape
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
                owner_id: {
                    $cond: {
                        if: { $eq: ["$role", USER_ROLE.GUIDE] },
                        then: "$_id",
                        else: { $ifNull: ["$guide.owner.user", null] },
                    },
                },
            },
        },
    ]);

    if (!result) {
        throw new ApiError("User not found", 404);
    }

    // Extra validation: if assistant but no employee/guide found → error
    if (
        result.role === USER_ROLE.ASSISTANT &&
        !result.owner_id
    ) {
        throw new ApiError(
            "Employee record is incomplete – no linked company (guide) found",
            404
        );
    }

    // Build the original IBaseUser object
    const baseUser: IBaseUser = {
        _id: result._id.toString(),
        name: result.name,
        owner_id: result.owner_id?.toString(),
        email: result.email,
        role: result.role as IBaseUser["role"],
        createdAt: result.createdAt?.toISOString(),
        updatedAt: result.updatedAt?.toISOString(),
    };

    return {
        data: baseUser,
        status: 200,
    };
});