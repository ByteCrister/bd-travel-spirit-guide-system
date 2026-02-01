"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRANSPORT_MODE, TransportMode } from "@/constants/tour.const";
import { TourDetailDTO } from "@/types/tour.types";
import { AlertCircle, Bus, Car, CheckCircle, Home, Luggage, Navigation, Plane, Ship, Train, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface LogisticsInfoProps {
    tour: TourDetailDTO;
}

const LogisticsInfo = ({ tour }: LogisticsInfoProps) => {
    const getTransportIcon = (mode: TransportMode) => {
        switch (mode) {
            case TRANSPORT_MODE.BUS: return <Bus className="h-4 w-4" />
            case TRANSPORT_MODE.TRAIN: return <Train className="h-4 w-4" />
            case TRANSPORT_MODE.DOMESTIC_FLIGHT: return <Plane className="h-4 w-4" />
            case TRANSPORT_MODE.BOAT: return <Ship className="h-4 w-4" />
            case TRANSPORT_MODE.PRIVATE_CAR: return <Car className="h-4 w-4" />
            case TRANSPORT_MODE.RIDE_SHARE: return <Car className="h-4 w-4" />
            default: return <Navigation className="h-4 w-4" />
        }
    }

    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Navigation className="h-5 w-5 text-primary" />
                    </div>
                    Logistics
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Location */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4 p-5 bg-muted/30 rounded-xl border"
                    >
                        <div>
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Home className="h-5 w-5 text-primary" />
                                Main Location
                            </h4>
                            {tour.mainLocation ? (
                                <div className="space-y-3">
                                    {tour.mainLocation.address && (
                                        <div className="p-3 bg-background rounded-lg border">
                                            <div className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                Address:
                                            </div>
                                            <div className="text-sm space-y-1">
                                                {tour.mainLocation.address.line1 && <div>{tour.mainLocation.address.line1}</div>}
                                                {tour.mainLocation.address.line2 && <div>{tour.mainLocation.address.line2}</div>}
                                                {tour.mainLocation.address.city && <div>{tour.mainLocation.address.city}</div>}
                                                {tour.mainLocation.address.district && <div>{tour.mainLocation.address.district}</div>}
                                            </div>
                                        </div>
                                    )}
                                    {tour.mainLocation.coordinates && (
                                        <div className="p-3 bg-background rounded-lg border">
                                            <div className="font-semibold text-sm text-muted-foreground mb-1">Coordinates:</div>
                                            <div className="text-sm font-mono text-muted-foreground">
                                                {tour.mainLocation.coordinates.lat.toFixed(6)}, {tour.mainLocation.coordinates.lng.toFixed(6)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">No main location specified</p>
                            )}
                        </div>

                        {tour.meetingPoint && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2 text-sm">Meeting Point</h4>
                                <p className="text-sm text-muted-foreground p-3 bg-background rounded-lg border">{tour.meetingPoint}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Transport & Pickup */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-4 p-5 bg-muted/30 rounded-xl border"
                    >
                        <div>
                            <h4 className="font-bold text-lg mb-4">Transport Modes</h4>
                            {tour.transportModes && tour.transportModes.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {tour.transportModes.map((mode, idx) => (
                                        <Badge key={idx} variant="outline" className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                            {getTransportIcon(mode)}
                                            {mode}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">No transport modes specified</p>
                            )}
                        </div>

                        {tour.pickupOptions && tour.pickupOptions.length > 0 && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-3 text-sm">Pickup Options</h4>
                                <div className="space-y-2">
                                    {tour.pickupOptions.slice(0, 3).map((option, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + idx * 0.05 }}
                                            className="text-sm p-3 bg-background rounded-lg border hover:shadow-md transition-shadow"
                                        >
                                            <div className="font-semibold flex items-center gap-2 mb-1">
                                                <MapPin className="h-3 w-3 text-primary" />
                                                {option.city}
                                            </div>
                                            {option.price && (
                                                <div className="text-muted-foreground text-xs">
                                                    {option.price} {option.currency}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                    {tour.pickupOptions.length > 3 && (
                                        <div className="text-sm text-muted-foreground p-2 text-center bg-muted/50 rounded-lg">
                                            +{tour.pickupOptions.length - 3} more options
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Packing List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="space-y-4 p-5 bg-muted/30 rounded-xl border"
                    >
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Luggage className="h-5 w-5 text-primary" />
                            Packing List
                        </h4>
                        {tour.packingList && tour.packingList.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {tour.packingList.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + idx * 0.03 }}
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                            item.required 
                                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' 
                                                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {item.required ? (
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                            )}
                                            <span className={`text-sm ${item.required ? "font-semibold" : ""}`}>{item.item}</span>
                                        </div>
                                        {item.notes && (
                                            <Badge variant="outline" className="text-xs ml-2">
                                                Note
                                            </Badge>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">No packing list provided</p>
                        )}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    )
}

export default LogisticsInfo;
