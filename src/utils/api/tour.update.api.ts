import {
    UpdateTourBasicInfoDTO,
    UpdateTourBangladeshFieldsDTO,
    UpdateTourContentItineraryDTO,
    UpdateTourLogisticsDTO,
    UpdateTourPricingDTO,
    UpdateTourComplianceDTO,
    UpdateTourPoliciesDTO,
    TourDetailDTO,
    DepartureDTO,
} from '@/types/tour.types';
import api from '../axios/axios';
import { useCompanyDashboardStore } from '@/store/company-detail.store';
import { ApiResponse } from '@/types/api.types';

// Helper function to update store after successful API call
const updateStoreAfterSuccess = (tourId: string, tourData: Partial<TourDetailDTO>) => {
    const store = useCompanyDashboardStore.getState();
    store.updateTourLocal(tourId, tourData);
    store.invalidateCache?.('tours');
};

class TourUpdateService {
    private baseUrl = '/operations/tours/v1';

    // Modular update methods
    async updateBasicInfo(tourId: string, data: UpdateTourBasicInfoDTO) {
        const response = await api.patch<ApiResponse<UpdateTourBasicInfoDTO>>(`${this.baseUrl}/${tourId}/basic-info`, data);
        if (!response.data || !response.data.data)
            throw new Error("Invalid response body.")

        updateStoreAfterSuccess(tourId, response.data.data)
        return response.data;
    }

    async updateBangladeshFields(tourId: string, data: UpdateTourBangladeshFieldsDTO) {
        const response = await api.patch<ApiResponse<UpdateTourBangladeshFieldsDTO>>(`${this.baseUrl}/${tourId}/bangladesh-fields`, data);
        if (!response.data || !response.data.data)
            throw new Error("Invalid response body.")

        updateStoreAfterSuccess(tourId, response.data.data)
        return response.data;
    }

    async updateContentItinerary(tourId: string, data: UpdateTourContentItineraryDTO) {
        const response = await api.patch<ApiResponse<UpdateTourContentItineraryDTO>>(`${this.baseUrl}/${tourId}/content-itinerary`, data);
        if (!response.data || !response.data.data)
            throw new Error("Invalid response body.")

        updateStoreAfterSuccess(tourId, response.data.data)
        return response.data;
    }

    async updateLogistics(tourId: string, data: UpdateTourLogisticsDTO) {
        const response = await api.patch<ApiResponse<UpdateTourLogisticsDTO>>(`${this.baseUrl}/${tourId}/logistics`, data);
        if (!response.data || !response.data.data)
            throw new Error("Invalid response body.")

        updateStoreAfterSuccess(tourId, response.data.data)
        return response.data;
    }

    async updatePricing(tourId: string, data: UpdateTourPricingDTO) {
        const response = await api.patch<
            ApiResponse<
                Omit<UpdateTourPricingDTO, "departures"> & {
                    departures: DepartureDTO[]
                }
            >
        >(`${this.baseUrl}/${tourId}/pricing`, data);
        if (!response.data || !response.data.data)
            throw new Error("Invalid response body.")

        updateStoreAfterSuccess(tourId, response.data.data)
        return response.data;
    }

    async updateCompliance(tourId: string, data: UpdateTourComplianceDTO) {
        const response = await api.patch<ApiResponse<UpdateTourComplianceDTO>>(`${this.baseUrl}/${tourId}/compliance`, data);
        if (!response.data || !response.data.data)
            throw new Error("Invalid response body.")

        updateStoreAfterSuccess(tourId, response.data.data)
        return response.data;
    }

    async updatePolicies(tourId: string, data: UpdateTourPoliciesDTO) {
        const response = await api.patch<ApiResponse<UpdateTourPoliciesDTO>>(`${this.baseUrl}/${tourId}/policies`, data);
        if (!response.data || !response.data.data)
            throw new Error("Invalid response body.")

        updateStoreAfterSuccess(tourId, response.data.data)
        return response.data;
    }
}

export const tourUpdateService = new TourUpdateService();