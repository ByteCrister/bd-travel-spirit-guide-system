// /operations/tours/add-tour/components/PricingCommerceStep.tsx
"use client";

import { Field, FieldArray, useFormikContext, getIn } from "formik";
import {
    TextField,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormGroup,
    Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CreateTourDTO } from "@/types/tour.types";
import {
    CURRENCY,
    PAYMENT_METHOD,
    TOUR_DISCOUNT,
} from "@/constants/tour.const";
import { useState } from "react";
import {
    DollarSign,
    Plus,
    Trash2,
    MapPin,
    Calendar,
    Clock,
    CreditCard,
    Plane,
    TrendingDown,
} from "lucide-react";
import { MapPickerDialog } from "@/components/global/MapPickerDialog";

export default function PricingCommerceStep() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

    // State for MapPickerDialog
    const [mapPickerOpen, setMapPickerOpen] = useState(false);
    const [editingDepartureIndex, setEditingDepartureIndex] = useState<number | null>(null);

    // Helper function to safely get error messages
    const getError = (fieldName: string) => {
        const error = getIn(errors, fieldName);
        const touch = getIn(touched, fieldName);
        return touch && error ? error : undefined;
    };

    // Handle map selection
    const handleMapSelect = (lat: number, lng: number) => {
        if (editingDepartureIndex !== null) {
            setFieldValue(`departures[${editingDepartureIndex}].meetingCoordinates`, {
                lat,
                lng,
            });
        }
    };

    // Open map picker for a specific departure
    const openMapPicker = (index: number) => {
        setEditingDepartureIndex(index);
        setMapPickerOpen(true);
    };

    // Close map picker
    const closeMapPicker = () => {
        setMapPickerOpen(false);
        setEditingDepartureIndex(null);
    };

    // Get initial position for map picker
    const getInitialPosition = (): [number, number] | undefined => {
        if (editingDepartureIndex === null) return undefined;

        const departure = values.departures?.[editingDepartureIndex];
        if (departure?.meetingCoordinates) {
            return [
                departure.meetingCoordinates.lat,
                departure.meetingCoordinates.lng
            ];
        }
        return undefined;
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                                <DollarSign className="w-6 h-6 text-white" />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                    Pricing & Commerce
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Configure pricing, discounts, and payment options
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>
                </Box>

                <Grid container spacing={3}>
                    {/* Base Price */}
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
                                    <DollarSign className="w-4 h-4 text-white" />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Base Price *
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
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            type="number"
                                            name="basePrice.amount"
                                            label="Amount"
                                            error={Boolean(
                                                touched.basePrice?.amount &&
                                                errors.basePrice?.amount
                                            )}
                                            helperText={
                                                touched.basePrice?.amount &&
                                                errors.basePrice?.amount
                                            }
                                            InputProps={{ inputProps: { min: 0 } }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ fontWeight: 500 }}>Currency *</InputLabel>
                                            <Field
                                                as={Select}
                                                name="basePrice.currency"
                                                label="Currency *"
                                                sx={{
                                                    borderRadius: 1.5,
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                    },
                                                }}
                                            >
                                                {Object.values(CURRENCY).map((currency) => (
                                                    <MenuItem
                                                        key={currency}
                                                        value={currency}
                                                        sx={{
                                                            borderRadius: 1.5,
                                                            "&:hover": {
                                                                backgroundColor: "action.hover",
                                                            },
                                                        }}
                                                    >
                                                        {currency}
                                                    </MenuItem>
                                                ))}
                                            </Field>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </motion.div>
                    </Grid>

                    {/* Discounts */}
                    <Grid size={12}>
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
                                    <TrendingDown className="w-4 h-4 text-white" />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Discounts
                                </Typography>
                            </Box>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <FieldArray name="discounts">
                                {({ push, remove }) => (
                                    <Box>
                                        <AnimatePresence mode="popLayout">
                                            {values.discounts?.map((discount, index) => (
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
                                                            borderRadius: 3,
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                                                            transition: "all 0.3s ease",
                                                            "&:hover": {
                                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                                borderColor: "primary.main",
                                                            },
                                                        }}
                                                    >
                                                        <Grid container spacing={2} alignItems="center">
                                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                                <FormControl fullWidth size="small">
                                                                    <InputLabel sx={{ fontWeight: 500 }}>Type</InputLabel>
                                                                    <Select
                                                                        value={discount.type}
                                                                        label="Type"
                                                                        onChange={(e) =>
                                                                            setFieldValue(
                                                                                `discounts[${index}].type`,
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        sx={{
                                                                            borderRadius: 1.5,
                                                                            "& .MuiOutlinedInput-root": {
                                                                                borderRadius: 1.5,
                                                                            },
                                                                        }}
                                                                    >
                                                                        {Object.values(TOUR_DISCOUNT).map((type) => (
                                                                            <MenuItem
                                                                                key={type}
                                                                                value={type}
                                                                                sx={{
                                                                                    borderRadius: 1.5,
                                                                                    "&:hover": {
                                                                                        backgroundColor: "action.hover",
                                                                                    },
                                                                                }}
                                                                            >
                                                                                {type}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>

                                                            <Grid size={{ xs: 12, sm: 2 }}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    type="number"
                                                                    label="Value %"
                                                                    value={discount.value}
                                                                    onChange={(e) =>
                                                                        setFieldValue(
                                                                            `discounts[${index}].value`,
                                                                            parseFloat(e.target.value)
                                                                        )
                                                                    }
                                                                    InputProps={{
                                                                        inputProps: { min: 0, max: 100, step: 0.1 },
                                                                    }}
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": {
                                                                            borderRadius: 1.5,
                                                                        },
                                                                    }}
                                                                />
                                                            </Grid>

                                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    label="Code"
                                                                    value={discount.code || ""}
                                                                    onChange={(e) =>
                                                                        setFieldValue(
                                                                            `discounts[${index}].code`,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        discount.type !== TOUR_DISCOUNT.PROMO
                                                                    }
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": {
                                                                            borderRadius: 1.5,
                                                                        },
                                                                    }}
                                                                />
                                                            </Grid>

                                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                                <DatePicker
                                                                    label="Valid From"
                                                                    value={
                                                                        discount.validFrom
                                                                            ? new Date(discount.validFrom)
                                                                            : null
                                                                    }
                                                                    onChange={(date) =>
                                                                        setFieldValue(
                                                                            `discounts[${index}].validFrom`,
                                                                            date
                                                                        )
                                                                    }
                                                                    slotProps={{
                                                                        textField: {
                                                                            size: "small",
                                                                            fullWidth: true,
                                                                            sx: {
                                                                                "& .MuiOutlinedInput-root": {
                                                                                    borderRadius: 1.5,
                                                                                },
                                                                            },
                                                                        },
                                                                    }}
                                                                />
                                                            </Grid>

                                                            <Grid size={{ xs: 12, sm: 1 }}>
                                                                <IconButton
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
                                                            </Grid>
                                                        </Grid>
                                                    </Paper>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <Button
                                            startIcon={<Plus className="w-4 h-4" />}
                                            variant="outlined"
                                            onClick={() =>
                                                push({
                                                    type: TOUR_DISCOUNT.SEASONAL,
                                                    value: 0,
                                                })
                                            }
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                            }}
                                        >
                                            Add Discount
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        </motion.div>
                    </Grid>

                    {/* Duration */}
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
                                    <Clock className="w-4 h-4 text-white" />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Duration
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
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            type="number"
                                            name="duration.days"
                                            label="Days"
                                            InputProps={{ inputProps: { min: 1 } }}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 1.5,
                                                },
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            type="number"
                                            name="duration.nights"
                                            label="Nights (Optional)"
                                            InputProps={{ inputProps: { min: 0 } }}
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

                    {/* Operating Windows */}
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
                                    <Calendar className="w-4 h-4 text-white" />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Operating Windows
                                </Typography>
                            </Box>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <FieldArray name="operatingWindows">
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
                                                        <TableCell sx={{ fontWeight: 600 }}>Start Date *</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>End Date *</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Total Seats</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    <AnimatePresence mode="popLayout">
                                                        {values.operatingWindows?.map((window, index) => (
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
                                                                    <DatePicker
                                                                        value={new Date(window.startDate)}
                                                                        onChange={(date) =>
                                                                            setFieldValue(
                                                                                `operatingWindows[${index}].startDate`,
                                                                                date
                                                                            )
                                                                        }
                                                                        slotProps={{
                                                                            textField: {
                                                                                size: "small",
                                                                                error: Boolean(getError(`operatingWindows[${index}].startDate`)),
                                                                                helperText: getError(`operatingWindows[${index}].startDate`),
                                                                                sx: {
                                                                                    "& .MuiOutlinedInput-root": {
                                                                                        borderRadius: 1.5,
                                                                                    },
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                                <TableCell>
                                                                    <DatePicker
                                                                        value={new Date(window.endDate)}
                                                                        onChange={(date) =>
                                                                            setFieldValue(
                                                                                `operatingWindows[${index}].endDate`,
                                                                                date
                                                                            )
                                                                        }
                                                                        slotProps={{
                                                                            textField: {
                                                                                size: "small",
                                                                                error: Boolean(getError(`operatingWindows[${index}].endDate`)),
                                                                                helperText: getError(`operatingWindows[${index}].endDate`),
                                                                                sx: {
                                                                                    "& .MuiOutlinedInput-root": {
                                                                                        borderRadius: 1.5,
                                                                                    },
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        value={window.seatsTotal || ""}
                                                                        onChange={(e) =>
                                                                            setFieldValue(
                                                                                `operatingWindows[${index}].seatsTotal`,
                                                                                e.target.value ? parseInt(e.target.value, 10) : undefined
                                                                            )
                                                                        }
                                                                        InputProps={{
                                                                            inputProps: { min: 0 },
                                                                        }}
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
                                                        ))}
                                                    </AnimatePresence>
                                                </TableBody>
                                        </Table>
                                    </TableContainer>

                                        <Button
                                            startIcon={<Plus className="w-4 h-4" />}
                                            variant="outlined"
                                            onClick={() =>
                                                push({
                                                    startDate: new Date(),
                                                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                                                    seatsTotal: undefined,
                                                })
                                            }
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                            }}
                                        >
                                            Add Operating Window
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        </motion.div>
                    </Grid>

                    {/* Payment Methods */}
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
                                    <CreditCard className="w-4 h-4 text-white" />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Payment Methods *
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
                                    borderColor: "divider",
                                    background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                    },
                                }}
                            >
                                <FormGroup row sx={{ gap: 1 }}>
                                    {Object.values(PAYMENT_METHOD).map((method) => (
                                        <Chip
                                            key={method}
                                            label={method}
                                            onClick={() => {
                                                const newMethods = !values.paymentMethods.includes(method)
                                                    ? [...values.paymentMethods, method]
                                                    : values.paymentMethods.filter(
                                                        (m) => m !== method
                                                    );
                                                setFieldValue("paymentMethods", newMethods);
                                            }}
                                            color={values.paymentMethods.includes(method) ? "primary" : "default"}
                                            sx={{
                                                cursor: "pointer",
                                                borderRadius: 2,
                                                fontWeight: 500,
                                                ...(values.paymentMethods.includes(method) && {
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    color: "white",
                                                }),
                                            }}
                                        />
                                    ))}
                                </FormGroup>
                            </Paper>
                        </motion.div>
                    </Grid>

                    {/* Departures */}
                    <Grid size={12}>
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
                                    <Plane className="w-4 h-4 text-white" />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Departures Schedule
                                </Typography>
                            </Box>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <FieldArray name="departures">
                                {({ push, remove }) => (
                                    <Box>
                                        <TableContainer
                                            component={Paper}
                                            elevation={0}
                                            sx={{
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                                                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Total Seats</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Meeting Point</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Coordinates</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                    <AnimatePresence mode="popLayout">
                                                        {values.departures?.map((departure, index) => (
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
                                                                    <DatePicker
                                                                        value={new Date(departure.date)}
                                                                        onChange={(date) =>
                                                                            setFieldValue(
                                                                                `departures[${index}].date`,
                                                                                date
                                                                            )
                                                                        }
                                                                        slotProps={{
                                                                            textField: {
                                                                                size: "small",
                                                                                sx: {
                                                                                    "& .MuiOutlinedInput-root": {
                                                                                        borderRadius: 1.5,
                                                                                    },
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                                <TableCell>
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        value={departure.seatsTotal}
                                                                        onChange={(e) =>
                                                                            setFieldValue(
                                                                                `departures[${index}].seatsTotal`,
                                                                                parseInt(e.target.value, 10)
                                                                            )
                                                                        }
                                                                        InputProps={{
                                                                            inputProps: { min: 1 },
                                                                        }}
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
                                                                        value={departure.meetingPoint || ""}
                                                                        onChange={(e) =>
                                                                            setFieldValue(
                                                                                `departures[${index}].meetingPoint`,
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        fullWidth
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                borderRadius: 1.5,
                                                                            },
                                                                        }}
                                                                    />
                                                                </TableCell>

                                                                <TableCell>
                                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            startIcon={<MapPin className="w-4 h-4" />}
                                                                            onClick={() => openMapPicker(index)}
                                                                            sx={{
                                                                                borderRadius: 1.5,
                                                                                textTransform: "none",
                                                                                minWidth: "auto",
                                                                            }}
                                                                        >
                                                                            Set Location
                                                                        </Button>
                                                                        {departure.meetingCoordinates && (
                                                                            <Chip
                                                                                size="small"
                                                                                label={`${departure.meetingCoordinates.lat.toFixed(4)}, ${departure.meetingCoordinates.lng.toFixed(4)}`}
                                                                                onDelete={() => setFieldValue(
                                                                                    `departures[${index}].meetingCoordinates`,
                                                                                    undefined
                                                                                )}
                                                                                color="primary"
                                                                                variant="outlined"
                                                                                sx={{
                                                                                    borderRadius: 1.5,
                                                                                    fontWeight: 500,
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
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
                                                        ))}
                                                    </AnimatePresence>
                                                </TableBody>
                                        </Table>
                                    </TableContainer>

                                        <Button
                                            startIcon={<Plus className="w-4 h-4" />}
                                            variant="outlined"
                                            sx={{
                                                mt: 2,
                                                borderRadius: 2,
                                                textTransform: "none",
                                            }}
                                            onClick={() =>
                                                push({
                                                    date: new Date(),
                                                    seatsTotal: 10,
                                                    meetingPoint: "",
                                                })
                                            }
                                        >
                                            Add Departure
                                        </Button>
                                    </Box>
                                )}
                            </FieldArray>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* MapPickerDialog for setting coordinates */}
                <MapPickerDialog
                    open={mapPickerOpen}
                    onClose={closeMapPicker}
                    onSelect={handleMapSelect}
                    initialPosition={getInitialPosition()}
                />
            </motion.div>
        </LocalizationProvider>
    );
}