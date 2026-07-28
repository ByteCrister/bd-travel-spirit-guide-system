// app/faqs/TourFaqsPage.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFAQStore } from '@/store/faq-store';
import { FAQFilterParams } from '@/types/tour/faqs.types';
import { FaqStatsSkeleton } from './skeleton/FaqStatsSkeleton';
import { FaqStats } from './FaqStats';
import { FaqFilters } from './FaqFilters';
import { FaqTableSkeleton } from './skeleton/FaqTableSkeleton';
import { FaqTable } from './FaqTable';
import { FaqPagination } from './FaqPagination';
import { HelpCircle } from 'lucide-react';
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

export default function TourFaqsManagementPage() {
    const { fetchFAQs, fetchFAQStats, allFAQs, stats, statsLoading } = useFAQStore();

    const [filters, setFilters] = useState<FAQFilterParams>({
        page: 1,
        limit: 10,
        search: '',
        status: undefined,
        sortBy: 'order',
        sortOrder: 'asc',
    });

    const loadFAQs = useCallback(async () => {
        await fetchFAQs(filters);
    }, [filters, fetchFAQs]);

    useEffect(() => {
        loadFAQs();
        fetchFAQStats();
    }, [loadFAQs, fetchFAQStats]);

    const handleFilterChange = (newFilters: Partial<FAQFilterParams>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1,
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleRefresh = () => {
        loadFAQs();
        fetchFAQStats();
    };

    const isLoading = allFAQs.isLoading;
    const faqs = allFAQs.data;
    const pagination = allFAQs.pagination;

    return (
        <div className="min-h-screen bg-[#E7E5E4] p-2 sm:p-3 lg:p-5">
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'FAQs', href: '/support/faqs' },
                ]}
                className="mb-4"
            />

            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mx-auto max-w-[1600px] space-y-8"
            >
                {/* ── Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            {/* Neumorphic icon pill — raised */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E7E5E4] ">
                                <HelpCircle className="h-5 w-5 text-[#006666]" strokeWidth={2} />
                            </div>

                            <h1 className="font-['Space_Mono'] text-2xl font-bold tracking-tight text-[#1E2938] sm:text-3xl lg:text-4xl">
                                Tour FAQs
                            </h1>
                        </div>

                        <p className="pl-14 font-['JetBrains_Mono'] text-xs font-normal tracking-wide text-[#1E2938]/50">
                            Manage frequently asked questions across all tours
                        </p>
                    </div>

                    {/* Raised neumorphic badge — page meta */}
                    <div className="self-start rounded-xl bg-[#E7E5E4] px-4 py-2  sm:self-auto">
                        <span className="font-['JetBrains_Mono'] text-xs font-medium text-[#006666]">
                            FAQ Management
                        </span>
                    </div>
                </div>

                {/* ── Divider rule ── */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1E2938]/10 to-transparent" />

                {/* ── Stats ── */}
                <section aria-label="FAQ Statistics">
                    {statsLoading ? (
                        <FaqStatsSkeleton />
                    ) : (
                        stats && <FaqStats stats={stats} onRefresh={handleRefresh} />
                    )}
                </section>

                {/* ── Filters — inset neumorphic well ── */}
                <section
                    aria-label="Filters"
                    className="rounded-2xl bg-[#E7E5E4] p-5 "
                >
                    <p className="mb-3 font-['JetBrains_Mono'] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1E2938]/40">
                        Filter &amp; Sort
                    </p>
                    <FaqFilters filters={filters} onFilterChange={handleFilterChange} />
                </section>

                {/* ── Table — raised card ── */}
                <section
                    aria-label="FAQ List"
                    className="overflow-x-auto rounded-2xl bg-[#E7E5E4] "
                >
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-6"
                            >
                                <FaqTableSkeleton rows={filters.limit || 10} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="table"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                                <FaqTable faqs={faqs} onRefresh={handleRefresh} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* ── Pagination ── */}
                {pagination && pagination.totalPages > 1 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center pt-2"
                    >
                        {/* Inset pill for pagination context */}
                        <div className="rounded-2xl bg-[#E7E5E4] px-6 py-3 ">
                            <FaqPagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}