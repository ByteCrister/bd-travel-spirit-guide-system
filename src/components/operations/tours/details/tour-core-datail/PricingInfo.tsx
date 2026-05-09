"use client";

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PAYMENT_METHOD, PaymentMethod, TOUR_DISCOUNT_TYPE } from "@/constants/tour.const"
import { TourDetailDTO } from "@/types/tour.types"
import { Banknote, Clock, CreditCard, Wallet, Tag, Calendar, TrendingDown } from "lucide-react"
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

interface PricingInfoProps {
    tour: TourDetailDTO;
}

const PricingInfo = ({ tour }: PricingInfoProps) => {
    const getPaymentIcon = (method: PaymentMethod) => {
        switch (method) {
            case PAYMENT_METHOD.BKASH: return <CreditCard className="h-4 w-4" />
            case PAYMENT_METHOD.NAGAD: return <CreditCard className="h-4 w-4" />
            case PAYMENT_METHOD.CARD: return <CreditCard className="h-4 w-4" />
            case PAYMENT_METHOD.STRIPE: return <CreditCard className="h-4 w-4" />
            case PAYMENT_METHOD.CASH: return <Banknote className="h-4 w-4" />
            case PAYMENT_METHOD.BANK_TRANSFER: return <Wallet className="h-4 w-4" />
            default: return <CreditCard className="h-4 w-4" />
        }
    }

    const formatDiscountValue = (type: string, value: number) => {
        if (type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT) {
            return `${value} ${tour.basePrice.currency} off`;
        }
        return `${value}% off`;
    };

    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FaBangladeshiTakaSign className="h-5 w-5 text-primary" />
                    </div>
                    Pricing & Commerce
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Base Price & Duration */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-900"
                    >
                        <div>
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <FaBangladeshiTakaSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Base Price
                            </h4>
                            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                                {tour.basePrice.amount.toLocaleString()} {tour.basePrice.currency}
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Duration
                            </h4>
                            <div className="flex items-center gap-2 text-lg">
                                <Badge variant="secondary" className="text-base px-3 py-1">
                                    {tour.duration?.days} days
                                </Badge>
                                {tour.duration?.nights && (
                                    <>
                                        <span className="text-muted-foreground">•</span>
                                        <Badge variant="secondary" className="text-base px-3 py-1">
                                            {tour.duration.nights} nights
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Discounts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-4 p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-900"
                    >
                        <div>
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                Discounts
                            </h4>
                            {tour.discounts && tour.discounts.length > 0 ? (
                                <div className="space-y-3">
                                    {tour.discounts.map((discount, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 + index * 0.1 }}
                                            className="flex justify-between items-center p-4 bg-background rounded-lg border-2 border-yellow-300 dark:border-yellow-800 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex-1">
                                                <div className="font-semibold text-base mb-1">
                                                    {discount.discount}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Tag className="h-3 w-3" />
                                                    {formatDiscountValue(discount.type, discount.value)}
                                                </div>
                                            </div>
                                            {discount.code && (
                                                <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 font-mono">
                                                    {discount.code}
                                                </Badge>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-background rounded-lg border text-center">
                                    <p className="text-sm text-muted-foreground">No active discounts</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Payment Methods & Departures */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-900"
                    >
                        <div>
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Payment Methods
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {tour.paymentMethods && tour.paymentMethods.length > 0 ? (
                                    tour.paymentMethods.map((method) => (
                                        <Badge key={method} variant="outline" className="flex items-center gap-1 bg-background border-blue-200 dark:border-blue-900">
                                            {getPaymentIcon(method)}
                                            {method}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No payment methods specified</p>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Departures
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center p-2 bg-background rounded-lg border">
                                    <span className="text-muted-foreground">Total Departures:</span>
                                    <Badge variant="secondary">
                                        {tour.departures?.length || 0}
                                    </Badge>
                                </div>
                                {tour.nextDeparture && (
                                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
                                        <span className="text-muted-foreground font-medium">Next Departure:</span>
                                        <span className="font-bold text-green-700 dark:text-green-300">
                                            {new Date(tour.nextDeparture).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PricingInfo;
