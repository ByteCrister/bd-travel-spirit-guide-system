"use client";

import { Field, FieldArray, getIn, useFormikContext } from "formik";
import {
    TextField,
    Grid,
    Box,
    Typography,
    IconButton,
    Paper,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Alert,
    FormHelperText,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour.types";
import { PAYMENT_METHOD } from "@/constants/tour.const";
import {
    FileText,
    XCircle,
    CreditCard,
    Clock,
    Plus,
    Trash2,
    AlertTriangle,
    Info,
    Shield,
    CheckCircle2,
} from "lucide-react";

export default function PoliciesStep() {
    const { values, errors, touched, setFieldValue, handleChange, handleBlur } = useFormikContext<CreateTourDTO>();

    // Helper function to get nested error messages
    const getFieldError = (fieldPath: string): string => {
        return getIn(errors, fieldPath) as string;
    };

    const isFieldTouched = (fieldPath: string): boolean => {
        return getIn(touched, fieldPath) as boolean;
    };

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
                                Policies
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Set cancellation, refund policies, and terms & conditions
                            </Typography>
                        </Box>
                    </Box>
                </motion.div>
            </Box>

            <Grid container spacing={3}>
                {/* Cancellation Policy */}
                <Grid size={{ xs: 12 }}>
                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <XCircle className="w-4 h-4 text-white" />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                Cancellation Policy
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
                                    <Checkbox
                                        checked={values.cancellationPolicy?.refundable || false}
                                        onChange={(e) =>
                                            setFieldValue("cancellationPolicy.refundable", e.target.checked)
                                        }
                                        color="primary"
                                        sx={{
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 28,
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            Refundable
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Allow customers to cancel and receive refunds
                                        </Typography>
                                    </Box>
                                }
                                sx={{ mb: 3 }}
                            />

                            <AnimatePresence>
                                {values.cancellationPolicy?.refundable && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Refund Rules (Based on days before departure)
                                                </Typography>
                                            </Box>
                                            <FieldArray name="cancellationPolicy.rules">
                                                {({ push, remove }) => (
                                                    <Box>
                                                        <TableContainer
                                                            component={Paper}
                                                            elevation={0}
                                                            sx={{
                                                                mb: 2,
                                                                borderRadius: 2,
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <Table size="small">
                                                                <TableHead>
                                                                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                                                                        <TableCell sx={{ fontWeight: 600 }}>Days Before</TableCell>
                                                                        <TableCell sx={{ fontWeight: 600 }}>Refund Percentage</TableCell>
                                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    <AnimatePresence mode="popLayout">
                                                                        {values.cancellationPolicy?.rules?.map(
                                                                            (rule, index) => (
                                                                                <TableRow
                                                                                    key={index}
                                                                                    component={motion.tr}
                                                                                    variants={cardVariants}
                                                                                    initial="hidden"
                                                                                    animate="visible"
                                                                                    exit="exit"
                                                                                    layout
                                                                                >
                                                                                    <TableCell>
                                                                                        <TextField
                                                                                            size="small"
                                                                                            type="number"
                                                                                            value={rule.daysBefore}
                                                                                            onChange={(e) =>
                                                                                                setFieldValue(
                                                                                                    `cancellationPolicy.rules[${index}].daysBefore`,
                                                                                                    parseInt(e.target.value)
                                                                                                )
                                                                                            }
                                                                                            InputProps={{
                                                                                                inputProps: { min: 0 },
                                                                                            }}
                                                                                            fullWidth
                                                                                            sx={{
                                                                                                "& .MuiOutlinedInput-root": {
                                                                                                    borderRadius: 1.5,
                                                                                                },
                                                                                            }}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <TextField
                                                                                            size="small"
                                                                                            type="number"
                                                                                            value={rule.refundPercent}
                                                                                            onChange={(e) =>
                                                                                                setFieldValue(
                                                                                                    `cancellationPolicy.rules[${index}].refundPercent`,
                                                                                                    parseInt(e.target.value)
                                                                                                )
                                                                                            }
                                                                                            InputProps={{
                                                                                                inputProps: { min: 0, max: 100 },
                                                                                                endAdornment: (
                                                                                                    <Typography variant="caption" sx={{ mr: 1 }}>
                                                                                                        %
                                                                                                    </Typography>
                                                                                                ),
                                                                                            }}
                                                                                            fullWidth
                                                                                            sx={{
                                                                                                "& .MuiOutlinedInput-root": {
                                                                                                    borderRadius: 1.5,
                                                                                                },
                                                                                            }}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            onClick={() => remove(index)}
                                                                                            color="error"
                                                                                            sx={{
                                                                                                borderRadius: 1.5,
                                                                                                "&:hover": {
                                                                                                    backgroundColor: "error.light",
                                                                                                    color: "error.dark",
                                                                                                },
                                                                                            }}
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </IconButton>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )
                                                                        )}
                                                                    </AnimatePresence>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                        <Button
                                                            startIcon={<Plus className="w-4 h-4" />}
                                                            variant="outlined"
                                                            onClick={() =>
                                                                push({ daysBefore: 0, refundPercent: 0 })
                                                            }
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: "none",
                                                            }}
                                                        >
                                                            Add Refund Rule
                                                        </Button>
                                                    </Box>
                                                )}
                                            </FieldArray>
                                        </Box>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {!values.cancellationPolicy?.refundable && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert
                                            severity="warning"
                                            icon={<AlertTriangle className="w-5 h-5" />}
                                            sx={{
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "warning.light",
                                                "& .MuiAlert-icon": {
                                                    color: "warning.main",
                                                },
                                            }}
                                        >
                                            <Typography variant="body2">
                                                Non-refundable tours cannot be cancelled for a refund under any circumstances.
                                                Consider this carefully as it affects customer satisfaction.
                                            </Typography>
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Paper>
                    </motion.div>
                </Grid>

                {/* Refund Policy */}
                <Grid size={12}>
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
                                <CreditCard className="w-4 h-4 text-white" />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                Refund Policy *
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
                                <Grid size={12}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Refund Methods *
                                        </Typography>
                                    </Box>
                                    <FormGroup row sx={{ gap: 1 }}>
                                        {Object.values(PAYMENT_METHOD).map((method) => (
                                            <Chip
                                                key={method}
                                                label={method}
                                                onClick={() => {
                                                    const currentMethods = values.refundPolicy?.method || [];
                                                    const newMethods = !currentMethods.includes(method)
                                                        ? [...currentMethods, method]
                                                        : currentMethods.filter((m) => m !== method);
                                                    setFieldValue("refundPolicy.method", newMethods);
                                                }}
                                                color={values.refundPolicy?.method?.includes(method) ? "primary" : "default"}
                                                sx={{
                                                    cursor: "pointer",
                                                    borderRadius: 2,
                                                    fontWeight: 500,
                                                    ...(values.refundPolicy?.method?.includes(method) && {
                                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                        color: "white",
                                                    }),
                                                }}
                                            />
                                        ))}
                                    </FormGroup>
                                    {isFieldTouched("refundPolicy.method") && getFieldError("refundPolicy.method") && (
                                        <FormHelperText error sx={{ mt: 1 }}>
                                            {getFieldError("refundPolicy.method")}
                                        </FormHelperText>
                                    )}
                                </Grid>

                                <Grid size={12}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                                        <Clock className="w-4 h-4 text-primary" />
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Processing Days *
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="refundPolicy.processingDays"
                                        value={values.refundPolicy?.processingDays || 0}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        label="Processing Days *"
                                        variant="outlined"
                                        InputProps={{ inputProps: { min: 0, max: 60 } }}
                                        helperText="Number of business days to process refunds (max 60)"
                                        error={
                                            isFieldTouched("refundPolicy.processingDays") &&
                                            !!getFieldError("refundPolicy.processingDays")
                                        }
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

                {/* Terms & Conditions */}
                <Grid size={{ xs: 12 }}>
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
                                <FileText className="w-4 h-4 text-white" />
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                Terms & Conditions
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
                            <Field
                                as={TextField}
                                fullWidth
                                name="terms"
                                label="Terms & Conditions"
                                variant="outlined"
                                multiline
                                rows={8}
                                placeholder={`Enter terms and conditions for this tour...

Example:
1. All participants must have valid travel insurance.
2. The tour operator reserves the right to modify the itinerary due to weather conditions or unforeseen circumstances.
3. Participants must follow the guide's instructions at all times.
4. Minimum age requirement: 12 years (unless otherwise specified).
5. Force majeure: In case of natural disasters, political unrest, or other unforeseen events, the tour may be cancelled or postponed.
6. Health requirements: Participants must disclose any medical conditions before the tour.

You can use markdown formatting for better readability.`}
                                helperText="Use clear and comprehensive terms to avoid misunderstandings"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 1.5,
                                    },
                                }}
                            />
                        </Paper>
                    </motion.div>
                </Grid>

                {/* Policy Information */}
                <Grid size={{ xs: 12 }}>
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
                                Policy Guidelines
                            </Typography>
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                    Cancellation policies must comply with local consumer protection laws
                                </Typography>
                                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                    Refund processing days should be realistic and achievable
                                </Typography>
                                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                    Clearly state all terms to avoid disputes
                                </Typography>
                                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                    Consider offering flexible cancellation options to attract more bookings
                                </Typography>
                                <Typography component="li" variant="body2">
                                    Policies will be displayed prominently on the tour booking page
                                </Typography>
                            </Box>
                        </Alert>
                    </motion.div>
                </Grid>
            </Grid>
        </motion.div>
    );
}