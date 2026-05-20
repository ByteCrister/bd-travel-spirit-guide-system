import { create } from 'zustand';
import type {
    FAQActivationApiResponse,
    FAQReorderApiResponse,
    FAQListApiResponse,
    FAQVotesApiResponse,
    FAQStatsApiResponse,
    FAQStoreState,
    FAQFilterParams,
    FAQVoteFilterParams,
} from '@/types/tour/faqs.types';
import api from '@/utils/axios/axios';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';

const URL_AFTER_API = `/mock/support/tour-faq`;

const CACHE_TTL_MS = 5 * 60 * 1000;

function isCacheFresh(entry: { lastFetched: number }): boolean {
    return Date.now() - entry.lastFetched < CACHE_TTL_MS;
}

export const useFAQStore = create<FAQStoreState>()((set, get) => ({
    /* ================================================================ */
    /*  Initial State                                                   */
    /* ================================================================ */
    allFAQs: {
        data: [],
        pagination: null,
        lastFetched: 0,
        isLoading: false,
        error: null,
    },
    faqVotes: {},
    stats: null,
    statsLoading: false,
    statsError: null,

    /* ================================================================ */
    /*  fetchFAQs  (with filters / pagination)                          */
    /* ================================================================ */
    fetchFAQs: async (params?: FAQFilterParams) => {
        const current = get().allFAQs;

        // Only use cache if no custom filters and cache is fresh
        if (!params && isCacheFresh(current)) {
            return;
        }

        set({
            allFAQs: {
                ...current,
                isLoading: true,
                error: null,
            },
        });

        try {
            const { data } = await api.get<FAQListApiResponse>(URL_AFTER_API, { params });

            if (!data.success) {
                throw new Error(data.message ?? 'Failed to fetch FAQs');
            }

            const { faqs, pagination } = data.data;
            set({
                allFAQs: {
                    data: faqs,
                    pagination,
                    lastFetched: Date.now(),
                    isLoading: false,
                    error: null,
                },
            });
        } catch (err) {
            const message = extractErrorMessage(err);
            showToast.error(message);
            set({
                allFAQs: {
                    ...current,
                    isLoading: false,
                    error: message,
                },
            });
        }
    },

    /* ================================================================ */
    /*  toggleFAQActive (optimistic – unchanged)                        */
    /* ================================================================ */
    toggleFAQActive: async (faqId: string) => {
        const { allFAQs } = get();
        const originalFAQs = allFAQs.data;
        const faqIndex = originalFAQs.findIndex((f) => f._id === faqId);

        if (faqIndex === -1) {
            showToast.error('FAQ not found in cache');
            return;
        }

        const optimisticFAQs = originalFAQs.map((faq, idx) =>
            idx === faqIndex ? { ...faq, isActive: !faq.isActive } : faq
        );

        set({
            allFAQs: {
                ...allFAQs,
                data: optimisticFAQs,
            },
        });

        try {
            const { data } = await api.put<FAQActivationApiResponse>(
                `${URL_AFTER_API}/${faqId}/activation`
            );

            if (data.error) {
                throw new Error(data.error);
            }

            set({
                allFAQs: {
                    ...get().allFAQs,
                    data: get().allFAQs.data.map((faq) =>
                        faq._id === faqId ? data.data! : faq
                    ),
                },
            });
            showToast.success('FAQ activation updated');
        } catch (err) {
            const message = extractErrorMessage(err);
            showToast.error(message);
            set({
                allFAQs: {
                    ...get().allFAQs,
                    data: originalFAQs,
                },
            });
        }
    },

    /* ================================================================ */
    /*  updateFAQOrder (optimistic – unchanged)                         */
    /* ================================================================ */
    updateFAQOrder: async (faqId: string, newOrder: number) => {
        const { allFAQs } = get();
        const originalFAQs = allFAQs.data;
        const faqIndex = originalFAQs.findIndex((f) => f._id === faqId);

        if (faqIndex === -1) {
            showToast.error('FAQ not found in cache');
            return;
        }

        const optimisticFAQs = originalFAQs.map((faq, idx) =>
            idx === faqIndex ? { ...faq, order: newOrder } : faq
        );

        set({
            allFAQs: {
                ...allFAQs,
                data: optimisticFAQs,
            },
        });

        try {
            const { data } = await api.put<FAQReorderApiResponse>(
                `${URL_AFTER_API}/${faqId}/order`,
                { newOrder }
            );

            if (data.error) {
                throw new Error(data.error);
            }

            const { tourId, faqs: updatedTourFAQs } = data.data!;
            const currentFAQs = get().allFAQs.data;
            const mergedFAQs = currentFAQs.map((faq) => {
                if (
                    faq.tour === tourId ||
                    (typeof faq.tour !== 'string' && faq.tour._id === tourId)
                ) {
                    const updated = updatedTourFAQs.find((uf) => uf._id === faq._id);
                    return updated ?? faq;
                }
                return faq;
            });

            set({
                allFAQs: {
                    ...get().allFAQs,
                    data: mergedFAQs,
                    lastFetched: Date.now(),
                },
            });
            showToast.success('FAQ order updated');
        } catch (err) {
            const message = extractErrorMessage(err);
            showToast.error(message);
            set({
                allFAQs: {
                    ...get().allFAQs,
                    data: originalFAQs,
                },
            });
        }
    },

    /* ================================================================ */
    /*  fetchFAQVotes (paginated)                                       */
    /* ================================================================ */
    fetchFAQVotes: async (faqId: string, params?: FAQVoteFilterParams) => {
        const current = get().faqVotes[faqId];
        set({
            faqVotes: {
                ...get().faqVotes,
                [faqId]: {
                    votes: current?.votes ?? [],
                    pagination: current?.pagination ?? { page: 1, perPage: 10, total: 0, totalPages: 0 },
                    isLoading: true,
                    error: null,
                },
            },
        });

        try {
            const { data } = await api.get<FAQVotesApiResponse>(
                `${URL_AFTER_API}/${faqId}/votes`,
                { params }
            );

            if (!data.success) {
                throw new Error(data.message ?? 'Failed to fetch votes');
            }

            const { votes, pagination } = data.data;
            set({
                faqVotes: {
                    ...get().faqVotes,
                    [faqId]: {
                        votes,
                        pagination,
                        isLoading: false,
                        error: null,
                    },
                },
            });
        } catch (err) {
            const message = extractErrorMessage(err);
            showToast.error(message);
            set({
                faqVotes: {
                    ...get().faqVotes,
                    [faqId]: {
                        votes: current?.votes ?? [],
                        pagination: current?.pagination ?? { page: 1, perPage: 10, total: 0, totalPages: 0 },
                        isLoading: false,
                        error: message,
                    },
                },
            });
        }
    },

    /* ================================================================ */
    /*  fetchFAQStats                                                   */
    /* ================================================================ */
    fetchFAQStats: async () => {
        set({ statsLoading: true, statsError: null });

        try {
            const { data } = await api.get<FAQStatsApiResponse>(`${URL_AFTER_API}/stats`);
            if (data.error) {
                throw new Error(data.error);
            }
            set({ stats: data.data!, statsLoading: false });
        } catch (err) {
            const message = extractErrorMessage(err);
            showToast.error(message);
            set({ statsLoading: false, statsError: message });
        }
    },
}));