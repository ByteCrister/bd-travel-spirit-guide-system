// utils/api/tour.api.ts
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import {
    CreateTourDTO,
    UpdateTourHeroImageDTO,
    UpdateTourGalleryDTO,
    UpdateTourBasicInfoDTO,
    UpdateTourBangladeshFieldsDTO,
    UpdateTourContentItineraryDTO,
    UpdateTourLogisticsDTO,
    UpdateTourPricingDTO,
    UpdateTourComplianceDTO,
    UpdateTourPoliciesDTO,
    AddDepartureDTO,
    UpdateDepartureDTO,
    UpdateDepartureSeatsDTO,
    // RequestReapprovalDTO,
    TourDetailDTO,
} from "@/types/tour.types";
import { useCompanyDashboardStore } from "@/store/company-detail.store";
import { showToast } from "@/components/global/showToast";
import { TourStatus } from "@/constants/tour.const";
import { ApiResponse } from "@/types/api.types";

// const BASE_URL = "/mock/operations/tours";
const BASE_URL = "/operations/tours/v1";

// Helper function to update store after successful API call
const updateStoreAfterSuccess = (tourId: string, tourData: TourDetailDTO) => {
    const store = useCompanyDashboardStore.getState();
    store.updateTourLocal(tourId, tourData);
};

// =============== CREATE TOUR ===============
export const createTourApi = async (data: CreateTourDTO): Promise<TourDetailDTO> => {
    try {
        const res = await api.post<ApiResponse<TourDetailDTO>>(
            `${BASE_URL}`,
            data
        );

        if (!res.data || !res.data.data) {
            throw new Error("Invalid response body")
        }

        // Update store
        const store = useCompanyDashboardStore.getState();
        store.updateTourLocal(res.data.data.id, res.data.data);
        store.invalidateCache?.('tours');

        return res.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        throw new Error(message);
    }
};

// =============== IMAGE UPDATE FUNCTIONS ===============
export const updateTourHeroImageApi = async (
    tourId: string,
    data: UpdateTourHeroImageDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/hero-image`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Hero image updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update hero image: ${message}`);
        throw new Error(message);
    }
};

export const updateTourGalleryApi = async (
    tourId: string,
    data: UpdateTourGalleryDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/gallery`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Gallery updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update gallery: ${message}`);
        throw new Error(message);
    }
};

// =============== MODULAR UPDATE FUNCTIONS ===============
export const updateTourBasicInfoApi = async (
    tourId: string,
    data: UpdateTourBasicInfoDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/basic-info`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Basic information updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update basic info: ${message}`);
        throw new Error(message);
    }
};

export const updateTourBangladeshFieldsApi = async (
    tourId: string,
    data: UpdateTourBangladeshFieldsDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/bangladesh-fields`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Bangladesh fields updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update Bangladesh fields: ${message}`);
        throw new Error(message);
    }
};

export const updateTourContentItineraryApi = async (
    tourId: string,
    data: UpdateTourContentItineraryDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/content-itinerary`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Content & itinerary updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update content & itinerary: ${message}`);
        throw new Error(message);
    }
};

export const updateTourLogisticsApi = async (
    tourId: string,
    data: UpdateTourLogisticsDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/logistics`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Logistics updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update logistics: ${message}`);
        throw new Error(message);
    }
};

export const updateTourPricingApi = async (
    tourId: string,
    data: UpdateTourPricingDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/pricing`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Pricing updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update pricing: ${message}`);
        throw new Error(message);
    }
};

export const updateTourComplianceApi = async (
    tourId: string,
    data: UpdateTourComplianceDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/compliance`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Compliance information updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update compliance: ${message}`);
        throw new Error(message);
    }
};

export const updateTourPoliciesApi = async (
    tourId: string,
    data: UpdateTourPoliciesDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/policies`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Policies updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update policies: ${message}`);
        throw new Error(message);
    }
};

// =============== STATUS & FEATURE UPDATES ===============
export const updateTourStatusApi = async (
    tourId: string,
    status: TourStatus
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/status`,
            { status }
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success(`Tour status updated to ${status}!`);
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update tour status: ${message}`);
        throw new Error(message);
    }
};

export const updateTourFeaturedApi = async (
    tourId: string,
    featured: boolean
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/featured`,
            { featured }
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        const status = featured ? "featured" : "unfeatured";
        showToast.success(`Tour ${status} successfully!`);
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update featured status: ${message}`);
        throw new Error(message);
    }
};

// =============== DEPARTURE MANAGEMENT ===============
export const addTourDepartureApi = async (
    tourId: string,
    data: AddDepartureDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.post<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/departures`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Departure added successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to add departure: ${message}`);
        throw new Error(message);
    }
};

export const updateTourDepartureApi = async (
    tourId: string,
    departureId: string,
    data: UpdateDepartureDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/departures/${departureId}`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Departure updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update departure: ${message}`);
        throw new Error(message);
    }
};

export const updateTourDepartureSeatsApi = async (
    tourId: string,
    departureId: string,
    data: UpdateDepartureSeatsDTO
): Promise<TourDetailDTO> => {
    try {
        const response = await api.patch<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/departures/${departureId}/seats`,
            data
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Departure seats updated successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to update departure seats: ${message}`);
        throw new Error(message);
    }
};

export const removeTourDepartureApi = async (
    tourId: string,
    departureId: string
): Promise<TourDetailDTO> => {
    try {
        const response = await api.delete<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/departures/${departureId}`
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Departure removed successfully!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to remove departure: ${message}`);
        throw new Error(message);
    }
};

// =============== MODERATION ACTIONS ===============
export const submitTourForApprovalApi = async (
    tourId: string
): Promise<TourDetailDTO> => {
    try {
        const response = await api.post<{ data: TourDetailDTO }>(
            `${BASE_URL}/tours/${tourId}/submit`
        );

        updateStoreAfterSuccess(tourId, response.data.data);
        showToast.success("Tour submitted for approval!");
        return response.data.data;
    } catch (error: unknown) {
        const message = extractErrorMessage(error);
        showToast.error(`Failed to submit for approval: ${message}`);
        throw new Error(message);
    }
};

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