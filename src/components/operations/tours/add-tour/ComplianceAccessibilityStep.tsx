"use client";

import { useFormikContext } from "formik";
import {
    TextField,
    Grid,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    FormControlLabel,
    Checkbox,
    Switch,
    Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { CreateTourDTO } from "@/types/tour.types";
import { AGE_SUITABILITY } from "@/constants/tour.const";
import {
    Shield,
    Users,
    Accessibility,
    Baby,
    Dog,
    FileText,
    Info,
    CheckCircle2,
} from "lucide-react";

export default function ComplianceAccessibilityStep() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

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
                            <Shield className="w-6 h-6 text-white" />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                Compliance & Accessibility
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Set compliance requirements and accessibility features
                            </Typography>
                        </Box>
                    </Box>
                </motion.div>
            </Box>

            <Grid container spacing={3}>
                {/* Age Suitability */}
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
                                <Users className="w-4 h-4 text-white" />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                Age Suitability *
                            </Typography>
                        </Box>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: touched.ageSuitability && errors.ageSuitability ? "error.main" : "divider",
                                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                },
                            }}
                        >
                            <FormControl
                                fullWidth
                                error={touched.ageSuitability && !!errors.ageSuitability}
                            >
                                <InputLabel sx={{ fontWeight: 500 }}>Age Suitability *</InputLabel>
                                <Select
                                    value={values.ageSuitability || ""}
                                    onChange={(e) =>
                                        setFieldValue("ageSuitability", e.target.value)
                                    }
                                    label="Age Suitability *"
                                    sx={{
                                        borderRadius: 1.5,
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 1.5,
                                        },
                                    }}
                                >
                                    {Object.values(AGE_SUITABILITY).map((suitability) => (
                                        <MenuItem
                                            key={suitability}
                                            value={suitability}
                                            sx={{
                                                borderRadius: 1.5,
                                                "&:hover": {
                                                    backgroundColor: "action.hover",
                                                },
                                            }}
                                        >
                                            {suitability.charAt(0).toUpperCase() + suitability.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Paper>
                    </motion.div>
                </Grid>

                {/* License Required */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FileText className="w-4 h-4 text-white" />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                License Required
                            </Typography>
                        </Box>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                },
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={values.licenseRequired || false}
                                        onChange={(e) =>
                                            setFieldValue("licenseRequired", e.target.checked)
                                        }
                                        color="primary"
                                        sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked": {
                                                color: "primary.main",
                                            },
                                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                backgroundColor: "primary.main",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            License Required
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Check if special permits or licenses are needed
                                        </Typography>
                                    </Box>
                                }
                                labelPlacement="end"
                                sx={{ m: 0 }}
                            />
                        </Paper>
                    </motion.div>
                </Grid>

                {/* Accessibility Features */}
                <Grid size={12}>
                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                Accessibility Features
                            </Typography>
                        </Box>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                },
                            }}
                        >
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: "center",
                                                height: "100%",
                                                borderRadius: 2,
                                                border: "2px solid",
                                                borderColor: values.accessibility?.wheelchair
                                                    ? "primary.main"
                                                    : "divider",
                                                background: values.accessibility?.wheelchair
                                                    ? "rgba(102, 126, 234, 0.08)"
                                                    : "rgba(255,255,255,0.5)",
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    borderColor: "primary.main",
                                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                                                },
                                            }}
                                            onClick={() =>
                                                setFieldValue(
                                                    "accessibility.wheelchair",
                                                    !values.accessibility?.wheelchair
                                                )
                                            }
                                        >
                                            <Box
                                                sx={{
                                                    mb: 2,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        background: values.accessibility?.wheelchair
                                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                            : "rgba(102, 126, 234, 0.1)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Accessibility
                                                        className={`w-6 h-6 ${values.accessibility?.wheelchair ? "text-white" : "text-primary"}`}
                                                    />
                                                </Box>
                                            </Box>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.accessibility?.wheelchair || false}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                "accessibility.wheelchair",
                                                                e.target.checked
                                                            )
                                                        }
                                                        color="primary"
                                                        sx={{
                                                            display: "none",
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            Wheelchair Accessible
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            Suitable for wheelchair users
                                                        </Typography>
                                                    </Box>
                                                }
                                                labelPlacement="bottom"
                                                sx={{ m: 0 }}
                                            />
                                        </Paper>
                                    </motion.div>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: "center",
                                                height: "100%",
                                                borderRadius: 2,
                                                border: "2px solid",
                                                borderColor: values.accessibility?.familyFriendly
                                                    ? "primary.main"
                                                    : "divider",
                                                background: values.accessibility?.familyFriendly
                                                    ? "rgba(102, 126, 234, 0.08)"
                                                    : "rgba(255,255,255,0.5)",
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    borderColor: "primary.main",
                                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                                                },
                                            }}
                                            onClick={() =>
                                                setFieldValue(
                                                    "accessibility.familyFriendly",
                                                    !values.accessibility?.familyFriendly
                                                )
                                            }
                                        >
                                            <Box
                                                sx={{
                                                    mb: 2,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        background: values.accessibility?.familyFriendly
                                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                            : "rgba(102, 126, 234, 0.1)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Baby
                                                        className={`w-6 h-6 ${values.accessibility?.familyFriendly ? "text-white" : "text-primary"}`}
                                                    />
                                                </Box>
                                            </Box>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.accessibility?.familyFriendly || false}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                "accessibility.familyFriendly",
                                                                e.target.checked
                                                            )
                                                        }
                                                        color="primary"
                                                        sx={{
                                                            display: "none",
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            Family Friendly
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            Suitable for families with children
                                                        </Typography>
                                                    </Box>
                                                }
                                                labelPlacement="bottom"
                                                sx={{ m: 0 }}
                                            />
                                        </Paper>
                                    </motion.div>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                textAlign: "center",
                                                height: "100%",
                                                borderRadius: 2,
                                                border: "2px solid",
                                                borderColor: values.accessibility?.petFriendly
                                                    ? "primary.main"
                                                    : "divider",
                                                background: values.accessibility?.petFriendly
                                                    ? "rgba(102, 126, 234, 0.08)"
                                                    : "rgba(255,255,255,0.5)",
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    borderColor: "primary.main",
                                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                                                },
                                            }}
                                            onClick={() =>
                                                setFieldValue(
                                                    "accessibility.petFriendly",
                                                    !values.accessibility?.petFriendly
                                                )
                                            }
                                        >
                                            <Box
                                                sx={{
                                                    mb: 2,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        background: values.accessibility?.petFriendly
                                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                            : "rgba(102, 126, 234, 0.1)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Dog
                                                        className={`w-6 h-6 ${values.accessibility?.petFriendly ? "text-white" : "text-primary"}`}
                                                    />
                                                </Box>
                                            </Box>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.accessibility?.petFriendly || false}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                "accessibility.petFriendly",
                                                                e.target.checked
                                                            )
                                                        }
                                                        color="primary"
                                                        sx={{
                                                            display: "none",
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            Pet Friendly
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            Allows pets to accompany
                                                        </Typography>
                                                    </Box>
                                                }
                                                labelPlacement="bottom"
                                                sx={{ m: 0 }}
                                            />
                                        </Paper>
                                    </motion.div>
                                </Grid>

                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Accessibility Notes"
                                        variant="outlined"
                                        value={values.accessibility?.notes || ""}
                                        onChange={(e) =>
                                            setFieldValue("accessibility.notes", e.target.value)
                                        }
                                        placeholder="Provide additional details about accessibility features, limitations, or requirements..."
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 1.5,
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </motion.div>
                </Grid>

                {/* Information Alert */}
                <Grid size={12}>
                    <motion.div variants={itemVariants}>
                        <Alert
                            severity="info"
                            icon={<Info className="w-5 h-5" />}
                            sx={{
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "info.light",
                                "& .MuiAlert-icon": {
                                    color: "info.main",
                                },
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Compliance Information
                            </Typography>
                            <Typography variant="body2">
                                Ensure all accessibility information is accurate. Misrepresentation may result in tour suspension.
                                Consider factors like physical requirements, medical conditions, and special needs when setting these values.
                            </Typography>
                        </Alert>
                    </motion.div>
                </Grid>
            </Grid>
        </motion.div>
    );
}