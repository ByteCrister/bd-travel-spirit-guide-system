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
    AUDIENCE_TYPE,
} from "@/constants/tour.const";

import {
    Users,
} from "lucide-react";

export default function AudienceSection() {
    const { values, errors, touched, setFieldValue } =
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


    return (
        <Grid size={12}>
            <motion.div variants={itemVariants}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Users className="w-4 h-4 text-white" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Target Audience
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
                    {Object.values(AUDIENCE_TYPE).map((audience) => (
                        <Chip
                            key={audience}
                            label={audience}
                            onClick={() => {
                                const next = !(values.audience?.includes(audience))
                                    ? [...(values.audience || []), audience]
                                    : (values.audience || []).filter(
                                        (a) => a !== audience
                                    );
                                setFieldValue("audience", next);
                            }}
                            color={values.audience?.includes(audience) ? "primary" : "default"}
                            sx={{
                                cursor: "pointer",
                                borderRadius: 2,
                                ...(values.audience?.includes(audience) && {
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