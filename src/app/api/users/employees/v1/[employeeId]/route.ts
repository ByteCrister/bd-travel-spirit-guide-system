// api/users/employees/v1/[employeeId]
import { NextRequest } from "next/server";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { ASSET_TYPE } from "@/constants/common/asset.const";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { resolveDocuments } from "@/lib/cloudinary/resolve.cloudinary";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { isCloudinaryUrl } from "@/lib/helpers/document-conversions";
import { withTransaction } from "@/lib/helpers/withTransaction";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import UserModel from "@/models/user.model";
import { UpdateEmployeePayload } from "@/types/employee/employee.types";
import { isValidObjectId, Types } from "mongoose";
import { USER_ROLE, UserRole } from "@/constants/current-user/user.const";
import ConnectDB from "@/config/db";
import { updateEmployeeServerSchema } from "@/utils/validators/employee/employee-server-payload.validator";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { PopulatedAssetLean } from "@/types/common/populated-asset.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { AUDIT_ACTION, logAuditForActor } from "@/lib/audit/audit-logger";

interface Params {
    params: Promise<{ employeeId: string }>
}

export type EmployeeLeanPopulated =
    Omit<IEmployee,
        | "user"
    > & {
        _id: Types.ObjectId;
        user: {
            _id: Types.ObjectId;
            name: string;
            avatar?: PopulatedAssetLean;
            role: UserRole;
        };
    };

// helper
function toDate(value?: string | Date | null): Date | undefined {
    if (!value) return undefined;

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
        throw new ApiError("Invalid date format", 400);
    }

    return date;
}

// Get full employee details
export const GET = withErrorHandler(async (req: NextRequest, { params }: Params) => {

    const decodedId = resolveMongoId((await params).employeeId);

    if (!decodedId || !Types.ObjectId.isValid(decodedId)) {
        throw new ApiError("Invalid employeeId", 400);
    }

    await ConnectDB()

    const employeeDto = await buildEmployeeDTO(new Types.ObjectId(decodedId));

    if (!employeeDto) {
        throw new ApiError("Employee not found", 404);
    }

    return {
        data: employeeDto,
        status: 200
    }

})

// update employee details
export const PUT = withErrorHandler(async (req: NextRequest, { params }: Params) => {

    const employeeId = resolveMongoId((await params).employeeId);
    const actorId = await getUserIdFromSession();
    if (!actorId) throw new ApiError("Unauthorized", 401);

    const body: UpdateEmployeePayload = await req.json();

    if (!employeeId || typeof employeeId !== "string") {
        throw new ApiError("Missing employeeId", 400);
    }

    if (!isValidObjectId(employeeId)) {
        throw new ApiError("Invalid employeeId format", 400);
    }

    // Run validation
    await updateEmployeeServerSchema.validate(body, { abortEarly: false });

    await ConnectDB()

    // 1. Fetch employee OUTSIDE transaction for upload checks
    const rawEmployeeOut = await EmployeeModel.findById(employeeId)
        .populate({
            path: "user",
            select: "name email role avatar",
            populate: { path: "avatar", model: AssetModel, select: "_id", populate: { path: "file", model: AssetFileModel, select: "publicUrl" } },
        })
        .lean()
        .exec();

    const employeeOut = rawEmployeeOut as unknown as EmployeeLeanPopulated;
    if (!employeeOut) throw new ApiError("Employee not found!", 404);
    if (employeeOut.user.role !== USER_ROLE.ASSISTANT) throw new ApiError("Employee is not a member of Guide Team!", 403);

    // 2. Perform Cloudinary uploads OUTSIDE transaction to avoid 60s timeout
    let newAvatarAssetId: Types.ObjectId | null = null;
    if (body.avatar && !isCloudinaryUrl(body.avatar)) {
        const assetIds = await uploadAssets(
            [{ base64: body.avatar, name: `${body.name}-avatar`, assetType: ASSET_TYPE.IMAGE }],
            null as any
        );
        newAvatarAssetId = assetIds[0];
    }

    let resolvedDocuments: { type: string; asset: Types.ObjectId }[] | null = null;
    let assetsToDelete: Types.ObjectId[] = [];
    if (body.documents) {
        const result = await resolveDocuments(
            body.documents,
            employeeOut.documents,
            ASSET_TYPE.DOCUMENT,
            null as any
        );
        resolvedDocuments = result.resolvedDocs;
        assetsToDelete = result.assetsToDelete;
    }

    // 3. Run atomic DB updates INSIDE transaction
    const updatedEmployeeId = await withTransaction(async (session) => {
        // Fetch fresh employee inside session
        const rawEmployee = await EmployeeModel.findById(employeeId).populate("user").session(session).lean().exec();
        const employee = rawEmployee as unknown as EmployeeLeanPopulated;
        if (!employee) throw new ApiError("Employee not found!", 404);

        // Base payload
        const payload: Partial<IEmployee> = {
            status: body.status,
            employmentType: body.employmentType,
            salary: body.salary,
            currency: body.currency,
            paymentMode: body.paymentMode,
            dateOfJoining: toDate(body.dateOfJoining),
            dateOfLeaving: toDate(body.dateOfLeaving),
            contactInfo: body.contactInfo,
            shifts: body.shifts,
            notes: body.notes,
        };

        // Handle avatar
        if (newAvatarAssetId) {
            // Cleanup old user avatar
            if (employee.user && (employee.user).avatar) {
                await cleanupAssets([(employee.user).avatar as Types.ObjectId], session);
            }
            // Update user avatar
            await UserModel.findByIdAndUpdate(employee.user._id, { avatar: newAvatarAssetId }, { session });
        }

        // Handle documents
        if (resolvedDocuments) {
            payload.documents = resolvedDocuments.map(d => ({
                type: d.type,
                asset: d.asset,
                uploadedAt: new Date(),
            }));

            if (assetsToDelete.length > 0) {
                await cleanupAssets(assetsToDelete, session);
            }
        }

        // Update user name if changed
        if (body.name.trim().toLowerCase() !== employee.user.name.trim().toLowerCase()) {
            await UserModel.findByIdAndUpdate(
                employee.user._id,
                { name: body.name },
                { session, new: true }
            );
        }

        // Update employee
        const updated = await EmployeeModel.findByIdAndUpdate(employeeId, payload, {
            new: true,
            runValidators: true,
            session,
        });

        if (!updated) throw new ApiError("Employee update failed!", 400);

        return updated._id;
    });

    const dto = await buildEmployeeDTO(updatedEmployeeId as Types.ObjectId);

    await logAuditForActor(actorId, {
        targetModel: "Employee",
        target: employeeId,
        action: AUDIT_ACTION.UPDATE,
        note: "Updated employee profile",
    });

    return {
        data: dto,
        status: 200,
    };
});