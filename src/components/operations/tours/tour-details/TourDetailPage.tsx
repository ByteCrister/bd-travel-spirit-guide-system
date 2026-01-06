"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { tourDetailErrorKey, tourDetailLoadingKey, useCompanyDashboardStore } from "@/store/company-detail.store";
import { AlertCircle, ArrowLeft, Edit, Shield, LayoutDashboard, MapPin, Calendar, Package, DollarSign, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TourBasicInfo from "./TourBasicInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BangladeshInfo from "./BangladeshInfo";
import InclusionsExclusions from "./InclusionsExclusions";
import PricingInfo from "./PricingInfo";
import LogisticsInfo from "./LogisticsInfo";
import ComplianceInfo from "./ComplianceInfo";
import ComputedInfo from "./ComputedInfo";
import ItineraryInfo from "./ItineraryInfo";
import DestinationsInfo from "./DestinationsInfo";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MODERATION_STATUS } from "@/constants/tour.const";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import TourDetailLoading from "./loading-skeletons/TourDetailLoading";

interface TourDetailPageProps {
    tourId: string;
}

export default function TourDetailPage({ tourId }: TourDetailPageProps) {

    const router = useRouter();
    const { fetchTourDetail, tourDetails, loading, error } = useCompanyDashboardStore()
    const tour = tourDetails[tourId]


    useEffect(() => {
        fetchTourDetail(tourId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourId])

    const loadingKey = tourDetailLoadingKey(tourId)
    const errorKey = tourDetailErrorKey(tourId)

    if (loading[loadingKey]) {
        return (
            <TourDetailLoading />
        )
    }

    if (error[errorKey] || !tour) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading Tour</AlertTitle>
                        <AlertDescription>
                            {error[errorKey] || 'Tour not found'}
                        </AlertDescription>
                    </Alert>
                    <Button onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header with back button */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between mb-8"
            >
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-lg hover:bg-accent transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Tour Details
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">Tour ID: {tourId}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/operations/tours/${tourId}/update-tour`)}
                        className="rounded-lg"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tour
                    </Button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="space-y-8">
                {/* Basic Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <TourBasicInfo tour={tour} />
                </motion.div>

                {/* Tabs for detailed sections */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2 bg-muted/50 p-1 rounded-lg">
                            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="itinerary" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Itinerary</span>
                            </TabsTrigger>
                            <TabsTrigger value="destinations" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Destinations</span>
                            </TabsTrigger>
                            <TabsTrigger value="logistics" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Package className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Logistics</span>
                            </TabsTrigger>
                            <TabsTrigger value="compliance" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <FileCheck className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Compliance</span>
                            </TabsTrigger>
                            <TabsTrigger value="pricing" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Pricing</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <BangladeshInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <InclusionsExclusions tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <PricingInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                <LogisticsInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                            >
                                <ComplianceInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.5 }}
                            >
                                <ComputedInfo tour={tour} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="itinerary" className="space-y-6 mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ItineraryInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <InclusionsExclusions tour={tour} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="destinations" className="space-y-6 mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <DestinationsInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <ComplianceInfo tour={tour} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="logistics" className="space-y-6 mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <LogisticsInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <ComplianceInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <InclusionsExclusions tour={tour} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="compliance" className="space-y-6 mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ComplianceInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <BangladeshInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <LogisticsInfo tour={tour} />
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="pricing" className="space-y-6 mt-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <PricingInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <ComputedInfo tour={tour} />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <InclusionsExclusions tour={tour} />
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* Moderation & System Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Card className="border-2 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="h-5 w-5 text-primary" />
                                Moderation & System Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-base flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        Moderation Details
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                            <span className="text-muted-foreground font-medium">Status:</span>
                                            <Badge className={
                                                tour.moderationStatus === MODERATION_STATUS.APPROVED ? "bg-green-500 hover:bg-green-600" :
                                                    tour.moderationStatus === MODERATION_STATUS.PENDING ? "bg-yellow-500 hover:bg-yellow-600" :
                                                        tour.moderationStatus === MODERATION_STATUS.DENIED ? "bg-red-500 hover:bg-red-600" :
                                                            "bg-gray-500 hover:bg-gray-600"
                                            }>
                                                {tour.moderationStatus}
                                            </Badge>
                                        </div>
                                        {tour.rejectionReason && (
                                            <div className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                                                <span className="text-muted-foreground font-medium">Rejection Reason:</span>
                                                <span className="font-medium text-right max-w-xs">{tour.rejectionReason}</span>
                                            </div>
                                        )}
                                        {tour.completedAt && (
                                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                <span className="text-muted-foreground font-medium">Completed At:</span>
                                                <span>{new Date(tour.completedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {tour.reApprovalRequestedAt && (
                                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                <span className="text-muted-foreground font-medium">Re-approval Requested:</span>
                                                <span>{new Date(tour.reApprovalRequestedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-base flex items-center gap-2">
                                        <LayoutDashboard className="h-4 w-4 text-primary" />
                                        System Information
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                            <span className="text-muted-foreground font-medium">Tags:</span>
                                            <div className="flex gap-1 flex-wrap justify-end max-w-xs">
                                                {tour.tags && tour.tags.length > 0 ? (
                                                    tour.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">No tags</span>
                                                )}
                                            </div>
                                        </div>
                                        {tour.deletedAt && (
                                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                                                <span className="text-muted-foreground font-medium">Deleted At:</span>
                                                <span className="font-medium text-red-600 dark:text-red-400">
                                                    {new Date(tour.deletedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                            <span className="text-muted-foreground font-medium">SEO Title:</span>
                                            <span className="max-w-xs truncate text-right">{tour.seo?.metaTitle || 'Not set'}</span>
                                        </div>
                                        <div className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                                            <span className="text-muted-foreground font-medium">SEO Description:</span>
                                            <span className="max-w-xs text-right text-xs line-clamp-2">
                                                {tour.seo?.metaDescription || 'Not set'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground bg-muted/30 pt-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Last updated: {new Date(tour.updatedAt).toLocaleString()}
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}