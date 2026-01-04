"use client";

import { useFormikContext } from "formik";
import {
    Box,
    Typography,
    Paper,
    Chip,
    FormGroup,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { CreateTourDTO } from "@/types/tour.types";
import {
    TOUR_CATEGORIES,
} from "@/constants/tour.const";
import {
    Tag
} from "lucide-react";

export default function CategoriesSection() {
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


    return (
        <Grid size={12}>
            <motion.div variants={itemVariants}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Tag className="w-4 h-4 text-white" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Content Categories
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
                <FormGroup row sx={{ gap: 1 }}>
                    {Object.values(TOUR_CATEGORIES).map((category) => (
                        <Chip
                            key={category}
                            label={category.replace("_", " ")}
                            onClick={() => {
                                const next = !(values.categories?.includes(category))
                                    ? [...(values.categories || []), category]
                                    : (values.categories || []).filter(
                                        (c) => c !== category
                                    );
                                setFieldValue("categories", next);
                            }}
                            color={values.categories?.includes(category) ? "primary" : "default"}
                            sx={{
                                cursor: "pointer",
                                borderRadius: 2,
                                ...(values.categories?.includes(category) && {
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                }),
                            }}
                        />
                    ))}
                </FormGroup>
            </Paper>
        </Grid>
    )
}