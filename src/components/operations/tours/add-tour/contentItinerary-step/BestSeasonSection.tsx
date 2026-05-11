"use client";

import { useFormikContext } from "formik";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Chip,
    Checkbox,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import {
    SEASON,
} from "@/constants/tour/tour.const";
import { Sun, Calendar } from "lucide-react";

export default function BestSeasonSection() {
    const { values, setFieldValue } =
        useFormikContext<CreateTourDTO>();

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

    const chipVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.2,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 0.15,
            },
        },
    };

    const getSeasonColor = (season: string) => {
        const colors: Record<string, string> = {
            spring: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            summer: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            autumn: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
            winter: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        };
        return colors[season.toLowerCase()] || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    };

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                            borderColor: "primary.main",
                            boxShadow: "0 8px 24px rgba(255, 193, 7, 0.15)",
                            transform: "translateY(-2px)",
                        },
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: values.bestSeason && values.bestSeason.length > 0
                                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                                : "linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)",
                            opacity: values.bestSeason && values.bestSeason.length > 0 ? 1 : 0.3,
                        },
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2.5,
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)",
                            }}
                        >
                            <Sun className="w-5 h-5 text-white" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 0.5 }}>
                                Best Season *
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Select one or more ideal seasons
                            </Typography>
                        </Box>
                    </Box>
                    <FormControl
                        fullWidth
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                backgroundColor: "background.paper",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "action.hover",
                                },
                                "&.Mui-focused": {
                                    backgroundColor: "background.paper",
                                },
                            },
                        }}
                    >
                        <InputLabel
                            sx={{
                                fontWeight: 500,
                            }}
                        >
                            Best Season *
                        </InputLabel>
                        <Select
                            multiple
                            value={values.bestSeason}
                            label="Best Season *"
                            onChange={(e) => setFieldValue("bestSeason", e.target.value)}
                            renderValue={(selected) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, py: 0.5 }}>
                                    <AnimatePresence mode="popLayout">
                                        {selected.map((value) => (
                                            <motion.div
                                                key={value}
                                                variants={chipVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                            >
                                                <Chip
                                                    label={value}
                                                    size="small"
                                                    sx={{
                                                        background: getSeasonColor(value),
                                                        color: "white",
                                                        fontWeight: 600,
                                                        fontSize: "0.75rem",
                                                        height: 28,
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                        "&:hover": {
                                                            transform: "scale(1.05)",
                                                            transition: "transform 0.2s ease",
                                                        },
                                                    }}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </Box>
                            )}
                        >
                            {Object.values(SEASON).map((season) => (
                                <MenuItem
                                    key={season}
                                    value={season}
                                    sx={{
                                        borderRadius: 1.5,
                                        my: 0.5,
                                        "&:hover": {
                                            backgroundColor: "action.hover",
                                        },
                                    }}
                                >
                                    <Checkbox
                                        checked={values.bestSeason.includes(season)}
                                        sx={{
                                            color: "primary.main",
                                            "&.Mui-checked": {
                                                color: "primary.main",
                                            },
                                        }}
                                    />
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: getSeasonColor(season),
                                            }}
                                        />
                                        <Typography fontWeight={500}>
                                            {season.charAt(0).toUpperCase() + season.slice(1)}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {values.bestSeason && values.bestSeason.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 1.5,
                                    borderRadius: 2,
                                    background: "rgba(240, 147, 251, 0.08)",
                                    border: "1px solid",
                                    borderColor: "secondary.light",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Calendar className="w-4 h-4 text-secondary" />
                                <Typography variant="caption" color="secondary.main" fontWeight={500}>
                                    {values.bestSeason.length} season{values.bestSeason.length > 1 ? "s" : ""} selected
                                </Typography>
                            </Box>
                        </motion.div>
                    )}
                </Paper>
            </motion.div>
        </Grid>
    );
}