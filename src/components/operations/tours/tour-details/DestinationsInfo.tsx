"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TourDetailDTO } from "@/types/tour.types"
import {
    MapPin,
    Navigation,
    Clock,
    DollarSign,
    Star,
    Building,
    Globe,
    ExternalLink,
    Award,
    Lightbulb,
    Map,
    Sparkles,
    Image as ImageIcon
} from "lucide-react"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface DestinationsInfoProps {
    tour: TourDetailDTO;
}

const DestinationsInfo = ({ tour }: DestinationsInfoProps) => {
    return (
        <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <span>Destinations</span>
                        <Badge variant="secondary" className="ml-3">
                            {tour.destinations?.length || 0}
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {tour.destinations && tour.destinations.length > 0 ? (
                    <div className="space-y-8">
                        {tour.destinations.map((destination, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="border-2 rounded-xl p-6 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Destination Header with Coordinates */}
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <MapPin className="h-4 w-4 text-primary" />
                                            </div>
                                            <h4 className="font-bold text-xl">Destination {index + 1}</h4>
                                        </div>
                                        {destination.coordinates && (
                                            <div className="flex items-center gap-2 mt-2 ml-11">
                                                <Map className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {destination.coordinates.lat.toFixed(6)}, {destination.coordinates.lng.toFixed(6)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {destination.coordinates && (
                                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                            <Navigation className="h-3 w-3" />
                                            GPS Enabled
                                        </Badge>
                                    )}
                                </div>

                                <Separator className="my-4" />

                                {/* Description */}
                                {destination.description && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-6"
                                    >
                                        <p className="text-muted-foreground leading-relaxed p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                                            {destination.description}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Highlights */}
                                {destination.highlights && destination.highlights.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mb-6"
                                    >
                                        <div className="font-semibold mb-3 flex items-center gap-2 text-base">
                                            <Sparkles className="h-4 w-4 text-yellow-500" />
                                            Highlights
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {destination.highlights.map((highlight, idx) => (
                                                <Badge 
                                                    key={idx} 
                                                    variant="secondary" 
                                                    className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-900"
                                                >
                                                    <Award className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                                                    {highlight}
                                                </Badge>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Attractions & Activities Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Attractions Section */}
                                    {destination.attractions && destination.attractions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="space-y-4"
                                        >
                                            <div className="font-semibold mb-3 flex items-center gap-2 text-base">
                                                <Building className="h-4 w-4 text-primary" />
                                                Attractions
                                                <Badge variant="outline" className="ml-2">
                                                    {destination.attractions.length}
                                                </Badge>
                                            </div>
                                            <div className="space-y-3">
                                                {destination.attractions.map((attraction, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                                        className="text-sm p-4 border-2 rounded-lg bg-card hover:shadow-md transition-all duration-200 space-y-3"
                                                    >
                                                        <div className="font-semibold flex items-center justify-between text-base">
                                                            <span>{attraction.title}</span>
                                                            {attraction.coordinates && (
                                                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>

                                                        {attraction.description && (
                                                            <p className="text-muted-foreground text-xs leading-relaxed">
                                                                {attraction.description}
                                                            </p>
                                                        )}

                                                        {/* Attraction Details Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t">
                                                            {attraction.bestFor && (
                                                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                                    <Award className="h-3 w-3 text-primary flex-shrink-0" />
                                                                    <div>
                                                                        <div className="text-muted-foreground">Best for:</div>
                                                                        <div className="font-medium">{attraction.bestFor}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {attraction.insiderTip && (
                                                                <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                                                                    <Lightbulb className="h-3 w-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <div className="text-muted-foreground text-xs">Insider Tip:</div>
                                                                        <div className="font-medium text-xs">{attraction.insiderTip}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {attraction.address && (
                                                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                                    <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                                                                    <div className="truncate">
                                                                        <div className="text-muted-foreground text-xs">Address:</div>
                                                                        <div className="font-medium text-xs truncate">{attraction.address}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {attraction.openingHours && (
                                                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                                    <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                                                                    <div>
                                                                        <div className="text-muted-foreground text-xs">Hours:</div>
                                                                        <div className="font-medium text-xs">{attraction.openingHours}</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Attraction Images */}
                                                        {attraction.imageIds && attraction.imageIds.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t">
                                                                <div className="text-xs font-medium mb-2 flex items-center gap-1">
                                                                    <ImageIcon className="h-3 w-3 text-primary" />
                                                                    Images ({attraction.imageIds.length})
                                                                </div>
                                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                                    {attraction.imageIds.map((image, imgIdx) => (
                                                                        <motion.div
                                                                            key={image.id}
                                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            transition={{ delay: 0.1 + imgIdx * 0.05 }}
                                                                            className="relative w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden border-2 border-muted hover:border-primary transition-colors group cursor-pointer"
                                                                        >
                                                                            <Image
                                                                                src={image.url}
                                                                                alt={`${attraction.title} image ${imgIdx + 1}`}
                                                                                fill
                                                                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                                                                sizes="80px"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Activities Section */}
                                    {destination.activities && destination.activities.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="space-y-4"
                                        >
                                            <div className="font-semibold mb-3 flex items-center gap-2 text-base">
                                                <Globe className="h-4 w-4 text-primary" />
                                                Activities
                                                <Badge variant="outline" className="ml-2">
                                                    {destination.activities.length}
                                                </Badge>
                                            </div>
                                            <div className="space-y-3">
                                                {destination.activities.map((activity, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                                        className="text-sm p-4 border-2 rounded-lg bg-card hover:shadow-md transition-all duration-200 space-y-3"
                                                    >
                                                        <div className="font-semibold flex items-center justify-between text-base">
                                                            <span>{activity.title}</span>
                                                            {activity.url && (
                                                                <a
                                                                    href={activity.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:text-primary/80 transition-colors"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Activity Details Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t">
                                                            {activity.provider && (
                                                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                                    <Building className="h-3 w-3 text-primary flex-shrink-0" />
                                                                    <div>
                                                                        <div className="text-muted-foreground">Provider:</div>
                                                                        <div className="font-medium truncate">{activity.provider}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activity.duration && (
                                                                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                                                    <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                                                                    <div>
                                                                        <div className="text-muted-foreground">Duration:</div>
                                                                        <div className="font-medium">{activity.duration}</div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activity.price && (
                                                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                                                                    <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                                    <div>
                                                                        <div className="text-muted-foreground">Price:</div>
                                                                        <div className="font-semibold text-green-700 dark:text-green-300">
                                                                            {activity.price.amount} {activity.price.currency}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activity.rating && (
                                                                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                                                                    <Star className="h-3 w-3 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400 flex-shrink-0" />
                                                                    <div>
                                                                        <div className="text-muted-foreground">Rating:</div>
                                                                        <div className="font-semibold text-yellow-700 dark:text-yellow-300">
                                                                            {activity.rating.toFixed(1)}/5
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Destination Images */}
                                {destination.imageIds && destination.imageIds.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="mt-6 pt-6 border-t"
                                    >
                                        <div className="font-semibold mb-3 flex items-center gap-2 text-base">
                                            <ImageIcon className="h-4 w-4 text-primary" />
                                            Destination Images
                                            <Badge variant="outline">
                                                {destination.imageIds.length}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {destination.imageIds.map((image, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.7 + idx * 0.05 }}
                                                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-muted hover:border-primary transition-all duration-300 group cursor-pointer"
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt={`Destination ${index + 1} image ${idx + 1}`}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                                        sizes="(max-width: 768px) 50vw, 25vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Image {idx + 1}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Summary Stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-6 pt-6 border-t"
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-900">
                                            <div className="font-bold text-2xl text-blue-700 dark:text-blue-300">
                                                {destination.attractions?.length || 0}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">Attractions</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-900">
                                            <div className="font-bold text-2xl text-purple-700 dark:text-purple-300">
                                                {destination.activities?.length || 0}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">Activities</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-900">
                                            <div className="font-bold text-2xl text-yellow-700 dark:text-yellow-300">
                                                {destination.highlights?.length || 0}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">Highlights</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-900">
                                            <div className="font-bold text-2xl text-green-700 dark:text-green-300">
                                                {destination.imageIds?.length || 0}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">Images</div>
                                        </div>
                                    </div>
                                </motion.div>
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
                            <MapPin className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No destinations available</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Destinations for this tour will appear here once added
                        </p>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}

export default DestinationsInfo
