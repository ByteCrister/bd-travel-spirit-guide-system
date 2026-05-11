"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourDetailDTO } from "@/types/tour/tour.types";
import { CheckCircle, Shield, XCircle, Calendar, FileText, AlertTriangle, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface ComplianceInfoProps {
    tour: TourDetailDTO;
}

const ComplianceInfo = ({ tour }: ComplianceInfoProps) => {
    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    Compliance & Accessibility
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Compliance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4 p-5 bg-muted/30 rounded-xl border"
                    >
                        <div>
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Basic Compliance
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <span className="text-sm text-muted-foreground">Difficulty Level:</span>
                                    <Badge variant="outline" className="font-semibold">{tour.difficulty}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <span className="text-sm text-muted-foreground">Age Suitability:</span>
                                    <span className="font-semibold">{tour.ageSuitability}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <span className="text-sm text-muted-foreground">License Required:</span>
                                    <Badge variant={tour.licenseRequired ? "destructive" : "default"} className={tour.licenseRequired ? "bg-red-500" : "bg-green-500"}>
                                        {tour.licenseRequired ? "Yes" : "No"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Best Seasons
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {tour.bestSeason && tour.bestSeason.length > 0 ? (
                                    tour.bestSeason.map((season) => (
                                        <Badge key={season} variant="secondary" className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                            {season}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No seasons specified</span>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Accessibility */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-4 p-5 bg-muted/30 rounded-xl border"
                    >
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Accessibility
                        </h4>
                        {tour.accessibility ? (
                            <div className="space-y-3">
                                <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${tour.accessibility.wheelchair ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                                    {tour.accessibility.wheelchair ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className="font-medium">Wheelchair Accessible</span>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${tour.accessibility.familyFriendly ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                                    {tour.accessibility.familyFriendly ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className="font-medium">Family Friendly</span>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${tour.accessibility.petFriendly ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                                    {tour.accessibility.petFriendly ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className="font-medium">Pet Friendly</span>
                                </div>
                                {tour.accessibility.notes && (
                                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-200 dark:border-yellow-900 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            <span className="text-sm font-semibold">Notes</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{tour.accessibility.notes}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">No accessibility information</p>
                        )}
                    </motion.div>

                    {/* Policies */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="space-y-4 p-5 bg-muted/30 rounded-xl border"
                    >
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Policies
                        </h4>
                        <div className="space-y-3">
                            {tour.cancellationPolicy && (
                                <div className="p-4 bg-background rounded-lg border-2 border-blue-200 dark:border-blue-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <div className="font-semibold">Cancellation Policy</div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={tour.cancellationPolicy.refundable ? "default" : "destructive"} className={tour.cancellationPolicy.refundable ? "bg-green-500" : "bg-red-500"}>
                                            {tour.cancellationPolicy.refundable ? "Refundable" : "Non-refundable"}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            {tour.refundPolicy && (
                                <div className="p-4 bg-background rounded-lg border-2 border-green-200 dark:border-green-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        <div className="font-semibold">Refund Policy</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        Processing: <span className="font-semibold">{tour.refundPolicy.processingDays} days</span>
                                    </div>
                                </div>
                            )}
                            {tour.terms && (
                                <div className="p-4 bg-background rounded-lg border-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <div className="font-semibold">Terms & Conditions</div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                                        {tour.terms}
                                    </p>
                                </div>
                            )}
                            {!tour.cancellationPolicy && !tour.refundPolicy && !tour.terms && (
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">No policies specified</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ComplianceInfo;
