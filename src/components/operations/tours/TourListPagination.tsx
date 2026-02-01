"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
    pagination: {
        page: number;
        limit: number;
        sort?: string;
        order?: "asc" | "desc";
    };
};

const TourListPagination: React.FC<Props> = ({ pagination }) => {
    const {
        fetchTours,
        listCache,
        activeCacheKey
    } = useTourDetailStore();
    const activeKey = activeCacheKey.tours;

    const current = activeKey
        ? listCache.tours[activeKey]
        : undefined;

    const page = pagination?.page ?? 1;
    const pages = current?.pages ?? 1;
    const total = current?.total ?? 0;

    const goto = (p: number) => {
        fetchTours({ page: p, limit: pagination.limit }).catch(() => { });
    };

    // Calculate range of items being displayed
    const startItem = (page - 1) * pagination.limit + 1;
    const endItem = Math.min(page * pagination.limit, total);

    // Generate page numbers to display (max 7 buttons including first and last)
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, page - delta);
            i <= Math.min(pages - 1, page + delta);
            i++
        ) {
            range.push(i);
        }

        if (page - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (page + delta < pages - 1) {
            rangeWithDots.push('...', pages);
        } else if (pages > 1) {
            rangeWithDots.push(pages);
        }

        return rangeWithDots;
    };

    const pageNumbers = pages > 1 ? getPageNumbers() : [1];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
            {/* Info Section */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">
                        {total === 0 ? (
                            "No items"
                        ) : (
                            <>
                                <span className="text-foreground">{startItem}</span>
                                {" - "}
                                <span className="text-foreground">{endItem}</span>
                                {" of "}
                                <span className="text-foreground">{total}</span>
                            </>
                        )}
                    </span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">
                    Page <span className="font-medium text-foreground">{page}</span> of{" "}
                    <span className="font-medium text-foreground">{pages}</span>
                </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                {/* First Page Button */}
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => goto(1)}
                    className="h-9 w-9 disabled:opacity-50 hover:bg-primary/10 hover:text-primary transition-all"
                    title="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page Button */}
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => goto(page - 1)}
                    className="h-9 w-9 disabled:opacity-50 hover:bg-primary/10 hover:text-primary transition-all"
                    title="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Number Buttons */}
                <div className="hidden sm:flex items-center gap-1 mx-1">
                    {pageNumbers.map((pageNum, index) => {
                        if (pageNum === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 text-muted-foreground"
                                >
                                    ...
                                </span>
                            );
                        }

                        const isActive = pageNum === page;
                        return (
                            <motion.div
                                key={pageNum}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant={isActive ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => goto(pageNum as number)}
                                    className={`h-9 w-9 transition-all ${
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "hover:bg-primary/10 hover:text-primary"
                                    }`}
                                >
                                    {pageNum}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Next Page Button */}
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page >= pages}
                    onClick={() => goto(page + 1)}
                    className="h-9 w-9 disabled:opacity-50 hover:bg-primary/10 hover:text-primary transition-all"
                    title="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page Button */}
                <Button
                    variant="outline"
                    size="icon"
                    disabled={page >= pages}
                    onClick={() => goto(pages)}
                    className="h-9 w-9 disabled:opacity-50 hover:bg-primary/10 hover:text-primary transition-all"
                    title="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

export default TourListPagination;