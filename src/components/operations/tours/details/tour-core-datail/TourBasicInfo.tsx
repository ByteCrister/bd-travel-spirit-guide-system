"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour/tour.const";
import { TourDetailDTO } from "@/types/tour/tour.types"
import { Building, Calendar, Eye, Heart, Share2, Star, Tag, Image as ImageIcon, Sparkles, TrendingUp, User, Clock } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface TourBasicInfoProps {
    tour: TourDetailDTO;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case TOUR_STATUS.ACTIVE: return "bg-green-500"
        case TOUR_STATUS.SUBMITTED: return "bg-blue-500"
        case TOUR_STATUS.DRAFT: return "bg-gray-500"
        case TOUR_STATUS.COMPLETED: return "bg-purple-500"
        case TOUR_STATUS.TERMINATED: return "bg-red-500"
        case TOUR_STATUS.ARCHIVED: return "bg-gray-300"
        default: return "bg-gray-200"
    }
}

const getModerationColor = (status: string) => {
    switch (status) {
        case MODERATION_STATUS.APPROVED: return "bg-green-500"
        case MODERATION_STATUS.PENDING: return "bg-yellow-500"
        case MODERATION_STATUS.DENIED: return "bg-red-500"
        case MODERATION_STATUS.SUSPENDED: return "bg-orange-500"
        default: return "bg-gray-200"
    }
}

const TourBasicInfo = ({ tour }: TourBasicInfoProps) => {

    return (
        <Card className="border-2 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-3xl font-bold flex items-center gap-3 mb-3">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {tour.title}
                            </motion.span>
                            {tour.featured && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                                        <Sparkles className="h-3 w-3" />
                                        Featured
                                    </Badge>
                                </motion.div>
                            )}
                        </CardTitle>
                        <CardDescription className="text-base mt-2 leading-relaxed">
                            {tour.summary}
                        </CardDescription>
                        <div className="mt-3">
                            <Badge variant="outline" className="text-xs font-mono bg-muted/50">
                                {tour.slug}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge className={`${getStatusColor(tour.status)} text-white shadow-sm`}>
                            {tour.status}
                        </Badge>
                        <Badge className={`${getModerationColor(tour.moderationStatus)} text-white shadow-sm`}>
                            {tour.moderationStatus}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Hero Image Section */}
                {tour.heroImage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <ImageIcon className="h-4 w-4 text-primary" />
                            Hero Image
                        </div>
                        <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden border-2 shadow-lg group">
                            <Image
                                src={tour.heroImage}
                                alt={`${tour.title} hero image`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
                )}

                {/* Gallery Images Section */}
                {tour.gallery && tour.gallery.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <ImageIcon className="h-4 w-4 text-primary" />
                                Gallery Images
                                <Badge variant="secondary" className="ml-2">
                                    {tour.gallery.length}
                                </Badge>
                            </div>
                            {tour.gallery.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                    +{tour.gallery.length - 4} more
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {tour.gallery.slice(0, 4).map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                    className="relative aspect-square rounded-xl overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                >
                                    <Image
                                        src={image}
                                        alt={`${tour.title} gallery image ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                    {index === 3 && (tour.gallery ?? []).length > 4 && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                                            <span className="text-white font-bold text-lg">
                                                +{(tour.gallery ?? []).length - 4}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <Separator className="my-6" />

                {/* Main Information Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Company & Author Info */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Organization
                        </h4>
                        <div className="space-y-4">
                            {/* Company Information */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Building className="h-3 w-3" />
                                    <span>Company</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium text-right">{tour.companyInfo?.name || 'N/A'}</span>
                                    </div>
                                    {tour.companyInfo?.createdAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Created:</span>
                                            <span className="text-xs text-right">
                                                {new Date(tour.companyInfo.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Author Information */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>Author</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium text-right">{tour.authorInfo?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="text-right">{tour.authorInfo?.email || 'N/A'}</span>
                                    </div>
                                    {tour.authorInfo?.avatarUrl && (
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="text-muted-foreground">Avatar:</span>
                                            <div className="relative">
                                                <Image
                                                    src={tour.authorInfo.avatarUrl}
                                                    alt={tour.authorInfo.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Categories Section */}
                            {tour.categories && tour.categories.length > 0 && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Categories:</span>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {tour.categories.map((cat) => (
                                            <Badge key={cat} variant="outline" className="text-xs">
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Date Information */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Timeline
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Created:</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {new Date(tour.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Updated:</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {new Date(tour.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            {tour.publishedAt && (
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Published:</span>
                                    </div>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                        {new Date(tour.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {tour.completedAt && (
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Completed:</span>
                                    </div>
                                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                        {new Date(tour.completedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Engagement
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Views:</span>
                                </div>
                                <span className="text-sm font-semibold">{tour.viewCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Wishlists:</span>
                                </div>
                                <span className="text-sm font-semibold">{tour.wishlistCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Share2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Shares:</span>
                                </div>
                                <span className="text-sm font-semibold">{tour.shareCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-muted-foreground">Likes:</span>
                                </div>
                                <span className="text-sm font-semibold">{tour.likeCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm text-muted-foreground">Rating:</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold">{tour.ratings?.average?.toFixed(1) || '0.0'}</span>
                                    <span className="text-xs text-muted-foreground">({tour.ratings?.count || 0})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    )
}

export default TourBasicInfo;