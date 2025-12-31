"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";

const TourTableSkeleton: React.FC = () => {
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
                    {[...Array(5)].map((_, rowIndex) => (
                        <motion.tr
                            key={rowIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rowIndex * 0.1, duration: 0.3 }}
                            className="border-border/50"
                        >
                            <TableCell className="w-12">
                                <div className="h-8 w-8 bg-muted-foreground/20 rounded animate-pulse" />
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    <div className="h-5 w-48 bg-muted-foreground/20 rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="h-6 w-20 bg-muted-foreground/20 rounded-full animate-pulse" />
                            </TableCell>

                            <TableCell>
                                <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                            </TableCell>

                            <TableCell>
                                <div className="h-6 w-16 bg-muted-foreground/20 rounded-full animate-pulse" />
                            </TableCell>

                            <TableCell>
                                <div className="h-4 w-16 bg-muted-foreground/20 rounded animate-pulse" />
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-12 bg-muted-foreground/20 rounded animate-pulse" />
                                    <div className="h-3 w-8 bg-muted-foreground/20 rounded animate-pulse" />
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="h-4 w-8 bg-muted-foreground/20 rounded animate-pulse" />
                            </TableCell>

                            <TableCell>
                                <div className="h-4 w-8 bg-muted-foreground/20 rounded animate-pulse" />
                            </TableCell>

                            <TableCell>
                                <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                            </TableCell>
                        </motion.tr>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TourTableSkeleton;