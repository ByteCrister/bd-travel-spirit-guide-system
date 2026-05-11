"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, TrendingUp, Eye, Heart, Share2, Calendar, Clock } from "lucide-react";
import { TourListItemDTO } from "@/types/tour/tour.types";
import { useTourDetailStore } from "@/store/tour-detail.store";
import TourTableSkeleton from "./skeletons/TourTableSkeleton";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

type Props = {
    list?: {
        items: TourListItemDTO[];
        total: number;
        page: number;
        pages: number;
    } | null;
};

export const TourTable: React.FC<Props> = ({ list }) => {
    const router = useRouter();
    const { loading } = useTourDetailStore();
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    if (loading['tours']) {
        return <TourTableSkeleton />;
    }

    if (!list || list.items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tours found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
            </motion.div>
        );
    }

    const toggleRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'moderate': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="overflow-auto rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-12" />
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Division</TableHead>
                        <TableHead className="font-semibold">Difficulty</TableHead>
                        <TableHead className="font-semibold">Price</TableHead>
                        <TableHead className="font-semibold">Ratings</TableHead>
                        <TableHead className="font-semibold">Wishlist</TableHead>
                        <TableHead className="font-semibold">Views</TableHead>
                        <TableHead className="font-semibold">Published</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {list.items.map((t, index) => {
                        const isExpanded = expandedRows.has(t.id);

                        return (
                            <React.Fragment key={t.id}>
                                <motion.tr
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className="cursor-pointer hover:bg-muted/50 transition-all duration-200 border-border/50 group"
                                    onClick={() => router.push(`/operations/tours/${encodeId(t.id)}`)}
                                >
                                    <TableCell className="w-12">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 group-hover:bg-primary/10 transition-colors"
                                            onClick={(e) => toggleRow(t.id, e)}
                                        >
                                            <ChevronDown
                                                className={`h-4 w-4 transition-all duration-300 ${isExpanded ? "rotate-180 text-primary" : "text-muted-foreground"
                                                    }`}
                                            />
                                        </Button>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {t.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {t.slug}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline" className="font-medium">
                                            {t.tourType}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">
                                        {t.division}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={`${getDifficultyColor(t.difficulty)} border`}
                                        >
                                            {t.difficulty}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-semibold text-foreground">
                                                {t.basePrice.amount}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {t.basePrice.currency}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {t.ratings ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3 text-amber-500" />
                                                    <span className="font-medium">
                                                        {t.ratings.average.toFixed(1)}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    ({t.ratings.count})
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Heart className="h-3 w-3" />
                                            <span>{t.wishlistCount}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Eye className="h-3 w-3" />
                                            <span>{t.viewCount}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {t.publishedAt ? (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(t.publishedAt).toLocaleDateString()}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                </motion.tr>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.tr
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-0"
                                        >
                                            <TableCell colSpan={11} className="p-0 border-0">
                                                <motion.div
                                                    initial={{ y: -10 }}
                                                    animate={{ y: 0 }}
                                                    className="bg-gradient-to-br from-muted/50 to-muted/30 border-y border-border/50"
                                                >
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
                                                        <InfoCard
                                                            icon={MapPin}
                                                            label="District"
                                                            value={t.district}
                                                        />
                                                        <InfoCard
                                                            icon={TrendingUp}
                                                            label="Status"
                                                            value={t.status}
                                                        />
                                                        <InfoCard
                                                            label="Moderation"
                                                            value={t.moderationStatus}
                                                        />
                                                        <InfoCard
                                                            label="Featured"
                                                            value={t.featured ? "Yes" : "No"}
                                                        />
                                                        <InfoCard
                                                            icon={Clock}
                                                            label="Duration"
                                                            value={t.duration ? `${t.duration.days} days` : "—"}
                                                        />
                                                        <InfoCard
                                                            icon={Calendar}
                                                            label="Next Departure"
                                                            value={t.nextDeparture ?? "—"}
                                                        />
                                                        <InfoCard
                                                            icon={Heart}
                                                            label="Likes"
                                                            value={t.likeCount}
                                                        />
                                                        <InfoCard
                                                            icon={Share2}
                                                            label="Shares"
                                                            value={t.shareCount}
                                                        />
                                                        <InfoCard
                                                            label="Occupancy"
                                                            value={t.occupancyPercentage ? `${t.occupancyPercentage}%` : "—"}
                                                        />
                                                        <InfoCard
                                                            label="Created"
                                                            value={new Date(t.createdAt).toLocaleDateString()}
                                                        />
                                                        <InfoCard
                                                            label="Updated"
                                                            value={new Date(t.updatedAt).toLocaleDateString()}
                                                        />
                                                    </div>
                                                </motion.div>
                                            </TableCell>
                                        </motion.tr>
                                    )}
                                </AnimatePresence>
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

const InfoCard = ({
    icon: Icon,
    label,
    value
}: {
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    value: React.ReactNode;
}) => (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-2">
            {Icon && <Icon className="h-3 w-3 text-primary" />}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
            </span>
        </div>
        <div className="font-semibold text-foreground">{value}</div>
    </div>
);