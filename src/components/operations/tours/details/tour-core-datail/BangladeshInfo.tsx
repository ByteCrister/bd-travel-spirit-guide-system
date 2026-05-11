"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUDIENCE_TYPE, AudienceType, TRAVEL_TYPE, TravelType } from "@/constants/tour/tour.const";
import { TourDetailDTO } from "@/types/tour/tour.types";
import { Briefcase, Building, Castle, CheckCircle, Coffee, Compass, Globe, Heart, Map, MapPin, Mountain, Package, Shield, User, Users, Waves, XCircle, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface BangladeshInfoProps {
    tour: TourDetailDTO;
}

const BangladeshInfo = ({ tour }: BangladeshInfoProps) => {
    const getAudienceIcon = (audience: AudienceType) => {
        switch (audience) {
            case AUDIENCE_TYPE.COUPLES: return <Heart className="h-4 w-4" />
            case AUDIENCE_TYPE.FAMILIES: return <Users className="h-4 w-4" />
            case AUDIENCE_TYPE.SOLO: return <User className="h-4 w-4" />
            case AUDIENCE_TYPE.BUSINESS: return <Building className="h-4 w-4" />
            default: return <Users className="h-4 w-4" />
        }
    }

    const getTravelTypeIcon = (type: TravelType) => {
        switch (type) {
            case TRAVEL_TYPE.BEACHES:
                return <Waves className="h-4 w-4" />
            case TRAVEL_TYPE.FOOD_DRINK:
                return <Coffee className="h-4 w-4" />
            case TRAVEL_TYPE.CULTURE_HISTORY:
                return <Castle className="h-4 w-4" />
            case TRAVEL_TYPE.ADVENTURE_SEEKERS:
                return <Mountain className="h-4 w-4" />
            case TRAVEL_TYPE.COUPLES:
                return <Heart className="h-4 w-4" />
            case TRAVEL_TYPE.GROUP_OF_FRIENDS:
                return <Users className="h-4 w-4" />
            case TRAVEL_TYPE.SOLO:
                return <User className="h-4 w-4" />
            case TRAVEL_TYPE.FAMILIES:
                return <Users className="h-4 w-4" />
            case TRAVEL_TYPE.BUSINESS:
                return <Briefcase className="h-4 w-4" />
            case TRAVEL_TYPE.DESTINATION_GUIDE:
                return <Map className="h-4 w-4" />
            default:
                return <Compass className="h-4 w-4" />
        }
    }

    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Globe className="h-5 w-5 text-primary" />
                    </div>
                    Bangladesh Specific Information
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location & Tour Type */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="p-5 bg-muted/30 rounded-xl border">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Location
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <span className="text-sm text-muted-foreground">Division:</span>
                                    <span className="font-semibold">{tour.division}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <span className="text-sm text-muted-foreground">District:</span>
                                    <span className="font-semibold">{tour.district}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-muted/30 rounded-xl border">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Tour Type & Audience
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <span className="text-sm text-muted-foreground">Tour Type:</span>
                                    <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 border-primary/20">
                                        {getTravelTypeIcon(tour.tourType)}
                                        {tour.tourType}
                                    </Badge>
                                </div>
                                {tour.audience && tour.audience.length > 0 && (
                                    <div className="p-3 bg-background rounded-lg border">
                                        <div className="text-sm text-muted-foreground mb-2">Audience:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.audience.map((aud) => (
                                                <Badge key={aud} variant="secondary" className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                                    {getAudienceIcon(aud)}
                                                    {aud}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Inclusions & Emergency Contacts */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="p-5 bg-muted/30 rounded-xl border">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Inclusions
                            </h4>
                            <div className="space-y-3">
                                <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${tour.guideIncluded ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                                    {tour.guideIncluded ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className="font-medium">Guide Included</span>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${tour.transportIncluded ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                                    {tour.transportIncluded ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    )}
                                    <span className="font-medium">Transport Included</span>
                                </div>
                                {tour.accommodationType && tour.accommodationType.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground mb-2">Accommodation Types:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.accommodationType.map((type) => (
                                                <Badge key={type} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5 bg-muted/30 rounded-xl border">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                Emergency Contacts
                            </h4>
                            {tour.emergencyContacts ? (
                                <div className="space-y-3">
                                    {tour.emergencyContacts.policeNumber && (
                                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-900">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                <span className="text-sm font-medium">Police:</span>
                                            </div>
                                            <a href={`tel:${tour.emergencyContacts.policeNumber}`} className="font-bold text-red-700 dark:text-red-300 hover:underline">
                                                {tour.emergencyContacts.policeNumber}
                                            </a>
                                        </div>
                                    )}
                                    {tour.emergencyContacts.ambulanceNumber && (
                                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-900">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                <span className="text-sm font-medium">Ambulance:</span>
                                            </div>
                                            <a href={`tel:${tour.emergencyContacts.ambulanceNumber}`} className="font-bold text-red-700 dark:text-red-300 hover:underline">
                                                {tour.emergencyContacts.ambulanceNumber}
                                            </a>
                                        </div>
                                    )}
                                    {tour.emergencyContacts.localEmergency && (
                                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-900">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                <span className="text-sm font-medium">Local Emergency:</span>
                                            </div>
                                            <a href={`tel:${tour.emergencyContacts.localEmergency}`} className="font-bold text-red-700 dark:text-red-300 hover:underline">
                                                {tour.emergencyContacts.localEmergency}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">No emergency contacts provided</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

export default BangladeshInfo;
