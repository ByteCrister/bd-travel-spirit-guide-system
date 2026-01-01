"use client";

import { FieldArray, getIn, useFormikContext } from "formik";
import {
    TextField,
    Box,
    Typography,
    IconButton,
    Paper,
    Button,
    Chip,
    FormGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour.types";
import {
    MEALS_PROVIDED,
    TRANSPORT_MODE,
} from "@/constants/tour.const";
import {
    Plus,
    Trash2,
    ChevronDown,
    Calendar,
    UtensilsCrossed,
    Hotel,
    Navigation,
    Clock,
    Activity,
    AlertCircle,
    Plane,
} from "lucide-react";

export default function ItinerarySection() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

    // Helper function to safely get error messages
    const getError = (fieldName: string) => {
        const error = getIn(errors, fieldName);
        const touch = getIn(touched, fieldName);
        return touch && error ? error : undefined;
    };

    // Animation variant
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
        <Grid size={12}
        >
            <motion.div variants={itemVariants}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
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
                        <Calendar className="w-5 h-5 text-white" />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Daily Itinerary
                    </Typography>
                </Box>
            </motion.div>
            <FieldArray name="itinerary">
                {({ push, remove }) => (
                    <Box>
                        <AnimatePresence mode="popLayout">
                            {values.itinerary?.map((day, dayIndex) => (
                                <motion.div
                                    key={dayIndex}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                >
                                    <Accordion
                                        sx={{
                                            mb: 2,
                                            borderRadius: 3,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                            "&:before": { display: "none" },
                                            "&.Mui-expanded": {
                                                margin: "0 0 16px 0",
                                            },
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={
                                                <ChevronDown className="w-5 h-5" />
                                            }
                                            sx={{
                                                borderRadius: 3,
                                                "&:hover": {
                                                    backgroundColor: "action.hover",
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                                                <Box
                                                    sx={{
                                                        p: 1,
                                                        borderRadius: 2,
                                                        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        minWidth: 50,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    Day {day.day}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="600">
                                                        {day.title || "Untitled Day"}
                                                    </Typography>
                                                    {day.description && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            {day.description.substring(0, 60)}...
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2.5}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Day Number *"
                                                        type="number"
                                                        size="small"
                                                        value={day.day || ""}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                `itinerary[${dayIndex}].day`,
                                                                parseInt(e.target.value) || 1
                                                            )
                                                        }
                                                        error={!!getError(`itinerary[${dayIndex}].day`)}
                                                        helperText={getError(`itinerary[${dayIndex}].day`)}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                borderRadius: 1.5,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Day Title"
                                                        size="small"
                                                        value={day.title || ""}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                `itinerary[${dayIndex}].title`,
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
                                                        label="Description"
                                                        multiline
                                                        rows={3}
                                                        value={day.description || ""}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                `itinerary[${dayIndex}].description`,
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

                                                {/* Meals Provided */}
                                                <Grid size={12}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            background: "rgba(255,255,255,0.5)",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                                            <UtensilsCrossed className="w-4 h-4 text-primary" />
                                                            <Typography variant="subtitle2" fontWeight="600">
                                                                Meals Provided
                                                            </Typography>
                                                        </Box>
                                                        <FormGroup row sx={{ gap: 1 }}>
                                                            {Object.values(MEALS_PROVIDED).map((meal) => {
                                                                const selected =
                                                                    day.mealsProvided?.includes(meal) ?? false;

                                                                return (
                                                                    <Chip
                                                                        key={meal}
                                                                        label={meal}
                                                                        onClick={() => {
                                                                            const next = !selected
                                                                                ? [...(day.mealsProvided ?? []), meal]
                                                                                : (day.mealsProvided ?? []).filter(
                                                                                    (m) => m !== meal
                                                                                );

                                                                            setFieldValue(
                                                                                `itinerary[${dayIndex}].mealsProvided`,
                                                                                next
                                                                            );
                                                                        }}
                                                                        color={selected ? "primary" : "default"}
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            borderRadius: 2,
                                                                            ...(selected && {
                                                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                                                color: "white",
                                                                            }),
                                                                        }}
                                                                    />
                                                                );
                                                            })}
                                                        </FormGroup>
                                                    </Paper>
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Accommodation"
                                                        size="small"
                                                        value={day.accommodation || ""}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                `itinerary[${dayIndex}].accommodation`,
                                                                e.target.value
                                                            )
                                                        }
                                                        InputProps={{
                                                            startAdornment: (
                                                                <Hotel className="w-4 h-4 text-primary mr-1" />
                                                            ),
                                                        }}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                borderRadius: 1.5,
                                                            },
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Travel Distance"
                                                        size="small"
                                                        value={day.travelDistance || ""}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                `itinerary[${dayIndex}].travelDistance`,
                                                                e.target.value
                                                            )
                                                        }
                                                        InputProps={{
                                                            startAdornment: (
                                                                <Navigation className="w-4 h-4 text-primary mr-1" />
                                                            ),
                                                        }}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                borderRadius: 1.5,
                                                            },
                                                        }}
                                                    />
                                                </Grid>

                                                {/* Transport Mode */}
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            background: "rgba(255,255,255,0.5)",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                                            <Plane className="w-4 h-4 text-primary" />
                                                            <Typography variant="subtitle2" fontWeight="600">
                                                                Transport Mode
                                                            </Typography>
                                                        </Box>
                                                        <FormGroup row sx={{ gap: 1 }}>
                                                            {Object.values(TRANSPORT_MODE).map((mode) => {
                                                                const selected = day.travelMode === mode;

                                                                return (
                                                                    <Chip
                                                                        key={mode}
                                                                        label={mode.replace("_", " ")}
                                                                        onClick={() => {
                                                                            setFieldValue(
                                                                                `itinerary[${dayIndex}].travelMode`,
                                                                                !selected ? mode : undefined
                                                                            );
                                                                        }}
                                                                        color={selected ? "primary" : "default"}
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            borderRadius: 2,
                                                                            ...(selected && {
                                                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                                                color: "white",
                                                                            }),
                                                                        }}
                                                                    />
                                                                );
                                                            })}
                                                        </FormGroup>
                                                    </Paper>
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Estimated Time"
                                                        size="small"
                                                        value={day.estimatedTime || ""}
                                                        onChange={(e) =>
                                                            setFieldValue(
                                                                `itinerary[${dayIndex}].estimatedTime`,
                                                                e.target.value
                                                            )
                                                        }
                                                        InputProps={{
                                                            startAdornment: (
                                                                <Clock className="w-4 h-4 text-primary mr-1" />
                                                            ),
                                                        }}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                borderRadius: 1.5,
                                                            },
                                                        }}
                                                    />
                                                </Grid>

                                                {/* Activities */}
                                                <Grid size={12}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            background: "rgba(255,255,255,0.5)",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                                            <Activity className="w-4 h-4 text-primary" />
                                                            <Typography variant="subtitle2" fontWeight="600">
                                                                Activities
                                                            </Typography>
                                                        </Box>
                                                        <FieldArray name={`itinerary[${dayIndex}].activities`}>
                                                            {({ push: pushActivity, remove: removeActivity }) => (
                                                                <Box>
                                                                    <AnimatePresence mode="popLayout">
                                                                        {day.activities?.map((activity, activityIndex) => (
                                                                            <motion.div
                                                                                key={activityIndex}
                                                                                variants={cardVariants}
                                                                                initial="hidden"
                                                                                animate="visible"
                                                                                exit="exit"
                                                                                layout
                                                                            >
                                                                                <Box
                                                                                    sx={{
                                                                                        display: "flex",
                                                                                        alignItems: "flex-start",
                                                                                        gap: 1,
                                                                                        mb: 1.5,
                                                                                        p: 1.5,
                                                                                        borderRadius: 2,
                                                                                        border: "1px solid",
                                                                                        borderColor: "divider",
                                                                                        backgroundColor: "background.paper",
                                                                                    }}
                                                                                >
                                                                                    <Activity className="w-4 h-4 text-primary mt-0.5" />
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        size="small"
                                                                                        placeholder="Enter activity..."
                                                                                        value={activity}
                                                                                        onChange={(e) =>
                                                                                            setFieldValue(
                                                                                                `itinerary[${dayIndex}].activities[${activityIndex}]`,
                                                                                                e.target.value
                                                                                            )
                                                                                        }
                                                                                        sx={{
                                                                                            "& .MuiOutlinedInput-root": {
                                                                                                borderRadius: 1.5,
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() => removeActivity(activityIndex)}
                                                                                        sx={{
                                                                                            color: "error.main",
                                                                                            "&:hover": {
                                                                                                backgroundColor: "error.light",
                                                                                                color: "error.dark",
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </IconButton>
                                                                                </Box>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                    <Button
                                                                        startIcon={<Plus className="w-4 h-4" />}
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => pushActivity("")}
                                                                        sx={{
                                                                            borderRadius: 2,
                                                                            textTransform: "none",
                                                                            mt: 1,
                                                                        }}
                                                                    >
                                                                        Add Activity
                                                                    </Button>
                                                                </Box>
                                                            )}
                                                        </FieldArray>
                                                    </Paper>
                                                </Grid>

                                                {/* Important Notes */}
                                                <Grid size={12}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            border: "1px solid",
                                                            borderColor: "divider",
                                                            background: "rgba(255,255,255,0.5)",
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                                                            <AlertCircle className="w-4 h-4 text-primary" />
                                                            <Typography variant="subtitle2" fontWeight="600">
                                                                Important Notes
                                                            </Typography>
                                                        </Box>
                                                        <FieldArray name={`itinerary[${dayIndex}].importantNotes`}>
                                                            {({ push: pushNote, remove: removeNote }) => (
                                                                <Box>
                                                                    <AnimatePresence mode="popLayout">
                                                                        {day.importantNotes?.map((note, noteIndex) => (
                                                                            <motion.div
                                                                                key={noteIndex}
                                                                                variants={cardVariants}
                                                                                initial="hidden"
                                                                                animate="visible"
                                                                                exit="exit"
                                                                                layout
                                                                            >
                                                                                <Box
                                                                                    sx={{
                                                                                        display: "flex",
                                                                                        alignItems: "flex-start",
                                                                                        gap: 1,
                                                                                        mb: 1.5,
                                                                                        p: 1.5,
                                                                                        borderRadius: 2,
                                                                                        border: "1px solid",
                                                                                        borderColor: "divider",
                                                                                        backgroundColor: "background.paper",
                                                                                    }}
                                                                                >
                                                                                    <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        multiline
                                                                                        rows={2}
                                                                                        size="small"
                                                                                        placeholder="Enter important note..."
                                                                                        value={note}
                                                                                        onChange={(e) =>
                                                                                            setFieldValue(
                                                                                                `itinerary[${dayIndex}].importantNotes[${noteIndex}]`,
                                                                                                e.target.value
                                                                                            )
                                                                                        }
                                                                                        sx={{
                                                                                            "& .MuiOutlinedInput-root": {
                                                                                                borderRadius: 1.5,
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() => removeNote(noteIndex)}
                                                                                        sx={{
                                                                                            color: "error.main",
                                                                                            "&:hover": {
                                                                                                backgroundColor: "error.light",
                                                                                                color: "error.dark",
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </IconButton>
                                                                                </Box>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                    <Button
                                                                        startIcon={<Plus className="w-4 h-4" />}
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => pushNote("")}
                                                                        sx={{
                                                                            borderRadius: 2,
                                                                            textTransform: "none",
                                                                            mt: 1,
                                                                        }}
                                                                    >
                                                                        Add Note
                                                                    </Button>
                                                                </Box>
                                                            )}
                                                        </FieldArray>
                                                    </Paper>
                                                </Grid>

                                                <Grid size={12}>
                                                    <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
                                                        <Button
                                                            color="error"
                                                            variant="outlined"
                                                            startIcon={<Trash2 className="w-4 h-4" />}
                                                            onClick={() => remove(dayIndex)}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: "none",
                                                            }}
                                                        >
                                                            Remove Day
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                startIcon={<Plus className="w-4 h-4" />}
                                variant="contained"
                                onClick={() => push({
                                    day: (values.itinerary?.length || 0) + 1,
                                    title: "",
                                    description: "",
                                    mealsProvided: [],
                                    accommodation: "",
                                    activities: [],
                                    travelDistance: "",
                                    travelMode: undefined,
                                    estimatedTime: "",
                                    importantNotes: []
                                })}
                                sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                                    },
                                }}
                            >
                                Add Day
                            </Button>
                        </motion.div>
                    </Box>
                )}
            </FieldArray>
        </Grid>
    );
}