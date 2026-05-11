// utils/api/tour.api.ts
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import {
    // RequestReapprovalDTO,
    TourDetailDTO,
} from "@/types/tour/tour.types";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { showToast } from "@/components/global/showToast";

// const BASE_URL = "/mock/operations/tours";
const BASE_URL = "/operations/tours/v1";

// Helper function to update store after successful API call
const updateStoreAfterSuccess = (tourId: string, tourData: TourDetailDTO) => {
    const store = useTourDetailStore.getState();
    store.updateTourLocal(tourId, tourData);
};

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


// =============== TERMINATE, DELETE & RESTORE OPERATIONS ===============
export const terminateTourApi = async (
    tourId: string,
    reason: string,
): Promise<TourDetailDTO> => {
    try {
        const response = await api.post<{ data: TourDetailDTO }>(
            `${BASE_URL}/${tourId}/moderation-status/terminate`,
            { reason }
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

export const archiveTourApi = async (
    tourId: string
): Promise<TourDetailDTO> => {
    try {
        const response = await api.delete<{ data: TourDetailDTO }>(
            `${BASE_URL}/${tourId}/moderation-status/archive`
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

export const restoreTourApi = async (
    tourId: string
): Promise<TourDetailDTO> => {
    try {
        const response = await api.post<{ data: TourDetailDTO }>(
            `${BASE_URL}/${tourId}/moderation-status/restore`
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