// components/dashboard/StatsCards.tsx
import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { GuideAggregates } from "@/types/overview.types";
import { Star, Users, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCards({ aggregates }: { aggregates?: GuideAggregates }) {
    const a = aggregates ?? {
        totalAvgRating: 0,
        totalEmployees: 0,
        totalReports: 0,
        totalReviews: 0,
        totalFaqs: 0,
    };

    const items = [
        { 
            icon: Star, 
            label: "Avg Rating", 
            value: a.totalAvgRating,
            iconColor: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            hoverColor: "hover:bg-yellow-500/20",
            gradientFrom: "from-yellow-500",
            gradientTo: "to-orange-500"
        },
        { 
            icon: Users, 
            label: "Employees", 
            value: a.totalEmployees,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10",
            hoverColor: "hover:bg-blue-500/20",
            gradientFrom: "from-blue-500",
            gradientTo: "to-cyan-500"
        },
        { 
            icon: FileText, 
            label: "Reports", 
            value: a.totalReports,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-500/10",
            hoverColor: "hover:bg-purple-500/20",
            gradientFrom: "from-purple-500",
            gradientTo: "to-pink-500"
        },
        { 
            icon: MessageSquare, 
            label: "Reviews", 
            value: a.totalReviews,
            iconColor: "text-green-500",
            bgColor: "bg-green-500/10",
            hoverColor: "hover:bg-green-500/20",
            gradientFrom: "from-green-500",
            gradientTo: "to-emerald-500"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((it, index) => (
                <motion.div
                    key={it.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20 cursor-pointer">
                        <CardContent className="p-6 relative">
                            {/* Gradient overlay on hover */}
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                                it.gradientFrom,
                                it.gradientTo
                            )} />
                            
                            {/* Decorative corner accent */}
                            <div className={cn(
                                "absolute top-0 right-0 w-24 h-24 bg-gradient-to-br rounded-bl-full opacity-10",
                                it.gradientFrom,
                                it.gradientTo
                            )} />

                            <div className="flex items-center gap-4 relative z-10">
                                <motion.div 
                                    className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                                        it.bgColor,
                                        it.hoverColor
                                    )}
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                >
                                    <it.icon className={cn("size-7", it.iconColor)} />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                                        {it.label}
                                        <TrendingUp className="size-3 text-green-500" />
                                    </div>
                                    <div className="text-2xl font-bold">
                                        <CountUp 
                                            end={typeof it.value === "number" ? it.value : 0} 
                                            decimals={it.label === "Avg Rating" ? 1 : 0} 
                                            duration={2}
                                            separator=","
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
