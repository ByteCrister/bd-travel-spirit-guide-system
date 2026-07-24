import { create } from "zustand";
import { TourHistoryDTO } from "@/types/tour/tour-history.types";

interface TourHistoryState {
    data: TourHistoryDTO | null;
    isLoading: boolean;
    error: string | null;

    fetchHistory: (tourId: string) => Promise<void>;
    clear: () => void;
}

export const useTourHistoryStore = create<TourHistoryState>((set) => ({
    data: null,
    isLoading: false,
    error: null,

    fetchHistory: async (tourId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/operations/tours/v1/${tourId}/history`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to fetch tour history");
            }

            const json = await res.json();
            set({ data: json.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    clear: () => set({ data: null, error: null, isLoading: false }),
}));
