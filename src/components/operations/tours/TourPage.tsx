"use client";

import { useTourDetailStore } from "@/store/tour-detail.store";
import { useEffect } from "react";
import { Kpis } from "./Kpis";
import { Filters } from "./Filters";
import { TourTable } from "./TourTable";
import TourListPagination from "./TourListPagination";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const items = [{ label: "Home", href: "/" }, { label: "Tours", href: "/operations/tours" }];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export default function ToursPage() {
    const router = useRouter();
    const {
        fetchTours,
        listCache,
        activeCacheKey,
        params: p,
    } = useTourDetailStore();
    const params = p.tours;

    useEffect(() => {
        fetchTours();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeKey = activeCacheKey.tours;
    const currentList = activeKey ? listCache.tours[activeKey] : undefined;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto py-6 px-4">
                {/* Header with Breadcrumbs and Add Tour Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                    >
                        <Breadcrumbs items={items} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={() => router.push("/operations/tours/add-tour")}
                            variant="outline"
                            className="group border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 bg-card/30 backdrop-blur-sm text-foreground shadow-sm hover:shadow-md transition-all duration-300 px-6 py-6 h-auto rounded-xl w-full sm:w-auto"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors">
                                    <PlusCircle className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-base">Add Tour</span>
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground/80">
                                        Create new tour package
                                    </span>
                                </div>
                                <ArrowRight className="ml-2 h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Button>
                    </motion.div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    <motion.div variants={itemVariants}>
                        <Kpis />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-xl shadow-lg">
                            <Filters />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <TourTable list={currentList} />
                            </div>
                            <div className="px-6 pb-6 border-t border-border/50 pt-4">
                                <TourListPagination pagination={params.pagination} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}