"use client";

import { FieldArray, useFormikContext } from "formik";
import {
    TextField,
    Box,
    Typography,
    IconButton,
    Paper,
    Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import {
    Plus,
    Trash2,
    CheckCircle2,
} from "lucide-react";

export default function InclusionsSection() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

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

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.2,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <motion.div variants={itemVariants}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Inclusions
                    </Typography>
                </Box>
            </motion.div>
            <FieldArray name="inclusions">
                {({ push, remove }) => (
                    <Box>
                        <AnimatePresence mode="popLayout">
                            {values.inclusions?.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            mb: 2,
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            background: "rgba(255,255,255,0.5)",
                                        }}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid size={12}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Label *"
                                                    value={item.label}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            `inclusions[${index}].label`,
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
                                                    size="small"
                                                    label="Description"
                                                    multiline
                                                    rows={2}
                                                    value={item.description || ""}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            `inclusions[${index}].description`,
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
                                            <Grid size={12} sx={{ textAlign: "right" }}>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => remove(index)}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <Button
                            startIcon={<Plus className="w-4 h-4" />}
                            variant="outlined"
                            onClick={() => push({ label: "", description: "" })}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                            }}
                        >
                            Add Inclusion
                        </Button>
                    </Box>
                )}
            </FieldArray>
        </Grid>
    );
}