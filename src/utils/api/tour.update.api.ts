// app/operations/tours/[tourId]/update-tour/services/tourUpdateService.ts
import {
    UpdateTourBasicInfoDTO,
    UpdateTourBangladeshFieldsDTO,
    UpdateTourContentItineraryDTO,
    UpdateTourLogisticsDTO,
    UpdateTourPricingDTO,
    UpdateTourComplianceDTO,
    UpdateTourPoliciesDTO,
    UpdateTourHeroImageDTO,
    UpdateTourGalleryDTO,
    UpdateDestinationImgDTO,
} from '@/types/tour.types';

class TourUpdateService {
    private baseUrl = '/api/tours';

    // Modular update methods
    async updateBasicInfo(tourId: string, data: UpdateTourBasicInfoDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/basic-info`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateBangladeshFields(tourId: string, data: UpdateTourBangladeshFieldsDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/bangladesh-fields`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateContentItinerary(tourId: string, data: UpdateTourContentItineraryDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/content-itinerary`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateLogistics(tourId: string, data: UpdateTourLogisticsDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/logistics`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updatePricing(tourId: string, data: UpdateTourPricingDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/pricing`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateCompliance(tourId: string, data: UpdateTourComplianceDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/compliance`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updatePolicies(tourId: string, data: UpdateTourPoliciesDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/policies`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    // Image-specific updates
    async updateHeroImage(tourId: string, data: UpdateTourHeroImageDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/hero-image`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateGallery(tourId: string, data: UpdateTourGalleryDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/gallery`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateDestinationImages(tourId: string, data: UpdateDestinationImgDTO) {
        const response = await fetch(`${this.baseUrl}/${tourId}/destination-images`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }
}

export const tourUpdateService = new TourUpdateService();