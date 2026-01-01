"use client";

import { useFormikContext } from "formik";
import {
    TextField,
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour.types";
import { useState } from "react";
import {
    Globe,
} from "lucide-react";

export default function TranslationsSection() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();
    const [tabValue, setTabValue] = useState(0);

    // Animation variants
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
        <Grid size={12}>
            <motion.div variants={itemVariants}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Globe className="w-4 h-4 text-white" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Translations
                    </Typography>
                </Box>
            </motion.div>
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    background: "rgba(255,255,255,0.5)",
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{
                        mb: 2,
                        "& .MuiTab-root": {
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 500,
                        },
                    }}
                >
                    <Tab label="English (EN)" />
                    <Tab label="Bengali (BN)" />
                </Tabs>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tabValue}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Box sx={{ pt: 1 }}>
                            {tabValue === 0 && (
                                <Grid container spacing={2.5}>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="English Title"
                                            size="small"
                                            value={values.translations?.en?.title || ""}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "translations.en.title",
                                                    e.target.value
                                                )
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="English Summary"
                                            multiline
                                            rows={3}
                                            size="small"
                                            value={values.translations?.en?.summary || ""}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "translations.en.summary",
                                                    e.target.value
                                                )
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="English Description"
                                            multiline
                                            rows={5}
                                            size="small"
                                            value={values.translations?.en?.description || ""}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "translations.en.description",
                                                    e.target.value
                                                )
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                            {tabValue === 1 && (
                                <Grid container spacing={2.5}>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Bengali Title (বাংলা)"
                                            size="small"
                                            value={values.translations?.bn?.title || ""}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "translations.bn.title",
                                                    e.target.value
                                                )
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Bengali Summary (সারাংশ)"
                                            multiline
                                            rows={3}
                                            size="small"
                                            value={values.translations?.bn?.summary || ""}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "translations.bn.summary",
                                                    e.target.value
                                                )
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Bengali Description (বর্ণনা)"
                                            multiline
                                            rows={5}
                                            size="small"
                                            value={values.translations?.bn?.description || ""}
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "translations.bn.description",
                                                    e.target.value
                                                )
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    </motion.div>
                </AnimatePresence>
            </Paper>
        </Grid>
    )
}