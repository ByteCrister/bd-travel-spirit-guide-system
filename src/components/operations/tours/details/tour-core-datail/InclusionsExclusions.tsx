"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourDetailDTO } from "@/types/tour/tour.types";
import { CheckCircle, Package, XCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface InclusionsExclusionsProps {
    tour: TourDetailDTO;
}

const InclusionsExclusions = ({ tour }: InclusionsExclusionsProps) => {
    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500/10 via-red-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    What&apos;s Included & Excluded
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Inclusions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-200 dark:border-green-900"
                    >
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            Inclusions
                        </h4>
                        {tour.inclusions && tour.inclusions.length > 0 ? (
                            <ul className="space-y-3">
                                {tour.inclusions.map((inc, idx) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                        className="flex items-start gap-3 p-3 bg-background rounded-lg border border-green-200 dark:border-green-900 hover:shadow-md transition-shadow"
                                    >
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-base">{inc.label}</div>
                                            {inc.description && (
                                                <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                    {inc.description}
                                                </div>
                                            )}
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 bg-background rounded-lg border text-center">
                                <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No inclusions specified</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Exclusions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-xl border-2 border-red-200 dark:border-red-900"
                    >
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            Exclusions
                        </h4>
                        {tour.exclusions && tour.exclusions.length > 0 ? (
                            <ul className="space-y-3">
                                {tour.exclusions.map((exc, idx) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                        className="flex items-start gap-3 p-3 bg-background rounded-lg border border-red-200 dark:border-red-900 hover:shadow-md transition-shadow"
                                    >
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-base">{exc.label}</div>
                                            {exc.description && (
                                                <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                    {exc.description}
                                                </div>
                                            )}
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 bg-background rounded-lg border text-center">
                                <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No exclusions specified</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

export default InclusionsExclusions;
