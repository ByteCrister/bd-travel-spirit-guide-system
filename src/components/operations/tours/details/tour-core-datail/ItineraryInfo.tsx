"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRANSPORT_MODE, TransportMode } from "@/constants/tour.const";
import { TourDetailDTO } from "@/types/tour.types"
import { Bus, Calendar, Car, Compass, Home, Navigation, Plane, Ship, Train, Utensils, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface ItineraryInfoProps {
    tour: TourDetailDTO;
}

const ItineraryInfo = ({ tour }: ItineraryInfoProps) => {
    const getTransportIcon = (mode?: TransportMode) => {
        switch (mode) {
            case TRANSPORT_MODE.BUS: return <Bus className="h-4 w-4" />
            case TRANSPORT_MODE.TRAIN: return <Train className="h-4 w-4" />
            case TRANSPORT_MODE.DOMESTIC_FLIGHT: return <Plane className="h-4 w-4" />
            case TRANSPORT_MODE.BOAT: return <Ship className="h-4 w-4" />
            case TRANSPORT_MODE.PRIVATE_CAR: return <Car className="h-4 w-4" />
            default: return <Navigation className="h-4 w-4" />
        }
    }

    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Itinerary
                    <Badge variant="secondary" className="ml-2">
                        {tour.itinerary?.length || 0} days
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {tour.itinerary && tour.itinerary.length > 0 ? (
                    <div className="space-y-6">
                        {tour.itinerary.map((day, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="relative"
                            >
                                {/* Timeline Line */}
                                {index < tour.itinerary!.length - 1 && (
                                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/20" />
                                )}
                                
                                <div className="flex gap-4">
                                    {/* Timeline Dot */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-4 border-background shadow-lg z-10">
                                            <span className="font-bold text-white text-sm">{day.day}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-6">
                                        <div className="bg-gradient-to-br from-background to-muted/20 rounded-xl border-2 p-6 hover:shadow-lg transition-all duration-300">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-bold text-xl">{day.title}</h4>
                                                <Badge variant="outline" className="bg-primary/10 border-primary/20">
                                                    Day {day.day}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed mb-4">{day.description}</p>

                                            <Separator className="my-4" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {day.accommodation && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border"
                                                    >
                                                        <Home className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="font-semibold text-sm text-muted-foreground mb-1">Accommodation</div>
                                                            <div className="font-medium">{day.accommodation}</div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {day.mealsProvided && day.mealsProvided.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.25 }}
                                                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border"
                                                    >
                                                        <Utensils className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-sm text-muted-foreground mb-2">Meals Provided</div>
                                                            <div className="flex gap-1 flex-wrap">
                                                                {day.mealsProvided.map((meal) => (
                                                                    <Badge key={meal} variant="secondary" className="text-xs bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                                                                        {meal}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {day.travelMode && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border"
                                                    >
                                                        <div className="text-primary flex-shrink-0 mt-0.5">
                                                            {getTransportIcon(day.travelMode)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-sm text-muted-foreground mb-1">Transport</div>
                                                            <div className="font-medium text-sm">{day.travelMode}</div>
                                                            {(day.travelDistance || day.estimatedTime) && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {day.travelDistance && <span>{day.travelDistance}</span>}
                                                                    {day.travelDistance && day.estimatedTime && <span> • </span>}
                                                                    {day.estimatedTime && <span>{day.estimatedTime}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {day.activities && day.activities.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.35 }}
                                                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border md:col-span-2"
                                                    >
                                                        <Compass className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-sm text-muted-foreground mb-2">Activities</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {day.activities.map((activity, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {activity}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {day.importantNotes && day.importantNotes.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-300 dark:border-yellow-800 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                        <div className="font-semibold text-yellow-800 dark:text-yellow-200">Important Notes:</div>
                                                    </div>
                                                    <ul className="list-disc list-inside text-sm space-y-1 text-yellow-900 dark:text-yellow-100">
                                                        {day.importantNotes.map((note, idx) => (
                                                            <li key={idx}>{note}</li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="p-4 bg-muted/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Calendar className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No itinerary available</p>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}

export default ItineraryInfo;
