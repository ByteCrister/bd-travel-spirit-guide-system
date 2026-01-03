"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourDetailDTO } from "@/types/tour.types";
import { FileText, DollarSign, Users, TrendingUp, CheckCircle2, XCircle, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ComputedInfoProps {
    tour: TourDetailDTO;
}

const ComputedInfo = ({ tour }: ComputedInfoProps) => {
    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    Computed Information
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price Summary */}
                    {tour.priceSummary && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-200 dark:border-green-900"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h4 className="font-bold text-lg">Price Summary</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-background rounded-lg border">
                                    <div className="text-sm text-muted-foreground mb-1">Price Range</div>
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {tour.priceSummary.minAmount.toLocaleString()} - {tour.priceSummary.maxAmount.toLocaleString()} {tour.priceSummary.currency}
                                    </div>
                                </div>
                                {tour.priceSummary.discountedAmount && (
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border-2 border-yellow-300 dark:border-yellow-800"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Percent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Discounted Price</div>
                                        </div>
                                        <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                                            {tour.priceSummary.discountedAmount.toLocaleString()} {tour.priceSummary.currency}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Booking Summary */}
                    {tour.bookingSummary && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-900"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h4 className="font-bold text-lg">Booking Summary</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                        <div className="text-xs text-muted-foreground mb-1">Total</div>
                                        <div className="text-lg font-bold">{tour.bookingSummary.totalSeats}</div>
                                    </div>
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                        <div className="text-xs text-muted-foreground mb-1">Booked</div>
                                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{tour.bookingSummary.bookedSeats}</div>
                                    </div>
                                    <div className="text-center p-3 bg-background rounded-lg border">
                                        <div className="text-xs text-muted-foreground mb-1">Available</div>
                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{tour.bookingSummary.availableSeats}</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Occupancy</span>
                                        <span className="font-semibold">{tour.bookingSummary.occupancyPercentage}%</span>
                                    </div>
                                    <Progress 
                                        value={tour.bookingSummary.occupancyPercentage} 
                                        className="h-2"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <Badge 
                                        variant={tour.bookingSummary.isFull ? "destructive" : "default"}
                                        className={tour.bookingSummary.isFull ? "bg-red-500" : "bg-green-500"}
                                    >
                                        {tour.bookingSummary.isFull ? "Full" : "Available"}
                                    </Badge>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Status Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className={`p-5 rounded-xl border-2 ${tour.isUpcoming ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' : 'bg-muted/50 border-muted'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {tour.isUpcoming ? (
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</div>
                            </div>
                            <div className={`text-2xl font-bold ${tour.isUpcoming ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground'}`}>
                                {tour.isUpcoming ? "Yes" : "No"}
                            </div>
                        </div>
                        
                        <div className={`p-5 rounded-xl border-2 ${tour.isExpired ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-muted/50 border-muted'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {tour.isExpired ? (
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                )}
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Expired</div>
                            </div>
                            <div className={`text-2xl font-bold ${tour.isExpired ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                                {tour.isExpired ? "Yes" : "No"}
                            </div>
                        </div>
                        
                        <div className={`p-5 rounded-xl border-2 ${tour.hasActiveDiscount ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900' : 'bg-muted/50 border-muted'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {tour.hasActiveDiscount ? (
                                    <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Discount</div>
                            </div>
                            <div className={`text-2xl font-bold ${tour.hasActiveDiscount ? 'text-yellow-700 dark:text-yellow-300' : 'text-muted-foreground'}`}>
                                {tour.hasActiveDiscount ? "Yes" : "No"}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ComputedInfo;
