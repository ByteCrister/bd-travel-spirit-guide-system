// utils/api/tour.api.ts
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import {
    // RequestReapprovalDTO,
    TourDetailDTO,
} from "@/types/tour.types";
import { useCompanyDashboardStore } from "@/store/company-detail.store";
import { showToast } from "@/components/global/showToast";

// const BASE_URL = "/mock/operations/tours";
const BASE_URL = "/operations/tours/v1";

// Helper function to update store after successful API call
const updateStoreAfterSuccess = (tourId: string, tourData: TourDetailDTO) => {
    const store = useCompanyDashboardStore.getState();
    store.updateTourLocal(tourId, tourData);
};

// =============== MODERATION ACTIONS ===============

// export const requestTourReapprovalApi = async (
//     tourId: string,
//     data?: RequestReapprovalDTO
// ): Promise<TourDetailDTO> => {
//     try {
//         const response = await api.post<{ data: TourDetailDTO }>(
//             `${BASE_URL}/tours/${tourId}/request-reapproval`,
//             data
//         );

//         updateStoreAfterSuccess(tourId, response.data.data);
//         showToast.success("Re-approval requested successfully!");
//         return response.data.data;
//     } catch (error: unknown) {
//         const message = extractErrorMessage(error);
//         showToast.error(`Failed to request re-approval: ${message}`);
//         throw new Error(message);
//     }
// };

export const publishTourApi = async (
    tourId: string
): Promise<TourDetailDTO> => {
    try {
        const response = await api.post<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/publish`
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Tour published successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to publish tour: ${message}`);
        throw new Error(message);
    }
};

export const archiveTourApi = async (
    tourId: string
): Promise<TourDetailDTO> => {
    try {
        const response = await api.post<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/archive`
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Tour archived successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to archive tour: ${message}`);
        throw new Error(message);
    }
};

// =============== DELETE & RESTORE OPERATIONS ===============
export const deleteTourApi = async (
    tourId: string
): Promise<void> => {
    try {
        await api.delete(`${BASE_URL}/tours/${tourId}`);

        // Remove from store
        const store = useCompanyDashboardStore.getState();
        store.removeTourLocal(tourId);
        store.invalidateCache?.('tours');

        showToast.success("Tour deleted successfully!");
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to delete tour: ${message}`);
        throw new Error(message);
    }
};

export const restoreTourApi = async (
    tourId: string
): Promise<TourDetailDTO> => {
    try {
        const response = await api.post<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/restore`
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Tour restored successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to restore tour: ${message}`);
        throw new Error(message);
    }
};