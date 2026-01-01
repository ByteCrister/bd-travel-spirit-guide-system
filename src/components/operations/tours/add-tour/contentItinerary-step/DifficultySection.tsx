"use client";

import { Field, useFormikContext } from "formik";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { CreateTourDTO } from "@/types/tour.types";
import {
    DIFFICULTY_LEVEL,
} from "@/constants/tour.const";
import { Mountain, TrendingUp } from "lucide-react";

export default function DifficultySection() {
    const { values, errors, touched } =
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

    const getDifficultyColor = (level: string) => {
        const colors: Record<string, string> = {
            easy: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            moderate: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            hard: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
            extreme: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        };
        return colors[level.toLowerCase()] || colors.moderate;
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
                        borderColor: touched.difficulty && errors.difficulty ? "error.main" : "divider",
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                            borderColor: "primary.main",
                            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                            transform: "translateY(-2px)",
                        },
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: values.difficulty
                                ? getDifficultyColor(values.difficulty)
                                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            opacity: values.difficulty ? 1 : 0.3,
                        },
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2.5,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                            }}
                        >
                            <Mountain className="w-5 h-5 text-white" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 0.5 }}>
                                Difficulty Level *
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Select the physical challenge level
                            </Typography>
                        </Box>
                    </Box>
                    <FormControl
                        fullWidth
                        error={touched.difficulty && !!errors.difficulty}
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
                            Difficulty Level *
                        </InputLabel>
                        <Field as={Select} name="difficulty" label="Difficulty Level *">
                            {Object.values(DIFFICULTY_LEVEL).map((level) => (
                                <MenuItem
                                    key={level}
                                    value={level}
                                    sx={{
                                        borderRadius: 1.5,
                                        my: 0.5,
                                        "&:hover": {
                                            backgroundColor: "action.hover",
                                        },
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: getDifficultyColor(level),
                                            }}
                                        />
                                        <Typography fontWeight={500}>
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Field>
                    </FormControl>
                    {values.difficulty && (
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
                                    background: "rgba(102, 126, 234, 0.08)",
                                    border: "1px solid",
                                    borderColor: "primary.light",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <Typography variant="caption" color="primary.main" fontWeight={500}>
                                    Selected: {values.difficulty.charAt(0).toUpperCase() + values.difficulty.slice(1)}
                                </Typography>
                            </Box>
                        </motion.div>
                    )}
                </Paper>
            </motion.div>
        </Grid>
    );
}