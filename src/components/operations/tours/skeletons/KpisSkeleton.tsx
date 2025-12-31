"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export const KpisSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
                        
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                            <div className="p-2 rounded-lg bg-background/50">
                                <div className="h-5 w-5 bg-muted-foreground/20 rounded animate-pulse" />
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <div className="h-8 w-20 bg-muted-foreground/20 rounded animate-pulse" />
                                <div className="h-3 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};