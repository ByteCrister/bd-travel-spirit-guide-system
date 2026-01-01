"use client";

import {
    Box,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import {
    Sparkles,
} from "lucide-react";
import DifficultySection from "./DifficultySection";
import BestSeasonSection from "./BestSeasonSection";
import DestinationsSection from "./DestinationsSection";
import ItinerarySection from "./ItinerarySection";
import InclusionsSection from "./InclusionsSection";
import ExclusionsSection from "./ExclusionsSection";
import AudienceSection from "./AudienceSection";
import CategoriesSection from "./CategoriesSection";
import TranslationsSection from "./TranslationsSection";

export default function ContentItineraryStep() {

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Box sx={{ mb: 4 }}>
                <motion.div variants={itemVariants}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Sparkles className="w-6 h-6 text-white" />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                Content & Itinerary
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Define your tour&apos;s destinations, itinerary, and categorization
                            </Typography>
                        </Box>
                    </Box>
                </motion.div>
            </Box>

            <Grid container spacing={3}>
                {/* Difficulty */}
               <DifficultySection />

                {/* Best Season */}
               <BestSeasonSection />

                {/* Destinations */}
               <DestinationsSection />

                {/* Itinerary - Full Implementation */}
               <ItinerarySection />

                {/* Inclusions */}
               <InclusionsSection />

                {/* Exclusions */}
               <ExclusionsSection />

                {/* Audience */}
                <AudienceSection />

                {/* Categories */}
               <CategoriesSection />

                {/* Translations */}
               <TranslationsSection />
            </Grid>
        </motion.div>
    );
}