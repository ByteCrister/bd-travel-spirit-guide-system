"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { FiFileText, FiStar, FiUsers } from "react-icons/fi";
import { KpisSkeleton } from "./skeletons/KpisSkeleton";
import { motion, Variants } from "framer-motion";

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export const Kpis: React.FC = () => {
    const { selectCompanyKpisFromActiveTours, loading } = useTourDetailStore()
    const kpis = selectCompanyKpisFromActiveTours();

    if (loading["tours"])
        return <KpisSkeleton />

    const kpiData = [
        {
            icon: FiUsers,
            title: "Total Tours",
            value: kpis.totalTours,
            subtitle: "Active list (cached)",
            gradient: "from-blue-500/10 to-cyan-500/10",
            iconColor: "text-blue-500"
        },
        {
            icon: FiFileText,
            title: "Published Tours",
            value: kpis.publishedTours,
            subtitle: "From active filter",
            gradient: "from-green-500/10 to-emerald-500/10",
            iconColor: "text-green-500"
        },
        {
            icon: FiStar,
            title: "Avg Rating",
            value: kpis.avgTourRating.toFixed(1),
            subtitle: "Published tours only",
            gradient: "from-amber-500/10 to-orange-500/10",
            iconColor: "text-amber-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {kpiData.map((kpi, index) => (
                <motion.div
                    key={kpi.title}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                    <Card className={`relative overflow-hidden border-border/50 bg-gradient-to-br ${kpi.gradient} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
                        
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {kpi.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg bg-background/50 ${kpi.iconColor}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="flex flex-col gap-1">
                                <motion.div 
                                    className="text-3xl font-bold tracking-tight"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                    {kpi.value}
                                </motion.div>
                                <p className="text-xs text-muted-foreground">
                                    {kpi.subtitle}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};