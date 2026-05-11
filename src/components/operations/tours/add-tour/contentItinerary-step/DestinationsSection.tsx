"use client";

import { FieldArray, getIn, useFormikContext } from "formik";
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
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import {
    CURRENCY,
} from "@/constants/tour/tour.const";
import {
    MapPin,
    Plus,
    Trash2,
    ChevronDown,
    Map,
    // Image as ImageIcon,
    Activity,
    CheckCircle2,
    Sparkles,
    Building2,
} from "lucide-react";
// import DestinationImageUploader from "../ImageUpload/DestinationImageUploader";
import { useState } from "react";
import { MapPickerDialog } from "@/components/global/MapPickerDialog";
// import UploadAttractionImage from "../ImageUpload/UploadAttractionImage";

export default function DestinationsSection() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

    const [mapPickerOpen, setMapPickerOpen] = useState(false);
    const [currentDestinationIndex, setCurrentDestinationIndex] = useState<number | null>(null);
    const [currentAttractionIndex, setCurrentAttractionIndex] = useState<{ destinationIndex: number; attractionIndex: number } | null>(null);
    const [mapPickerType, setMapPickerType] = useState<'destination' | 'attraction'>('destination');

    // Helper function to safely get error messages
    const getError = (fieldName: string) => {
        const error = getIn(errors, fieldName);
        const touch = getIn(touched, fieldName);
        return touch && error ? error : undefined;
    };

    // Helper function to get initial position based on map picker type
    const getInitialPosition = (): [number, number] | undefined => {
        if (mapPickerType === 'destination' && currentDestinationIndex !== null) {
            const destination = values.destinations?.[currentDestinationIndex];
            if (!destination?.coordinates) return undefined;

            const lat = destination.coordinates.lat;
            const lng = destination.coordinates.lng;

            if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) return undefined;
            if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) return undefined;

            return [lat, lng] as [number, number];
        }

        if (mapPickerType === 'attraction' && currentAttractionIndex !== null) {
            const { destinationIndex, attractionIndex } = currentAttractionIndex;
            const attraction = values.destinations?.[destinationIndex]?.attractions?.[attractionIndex];
            if (!attraction?.coordinates) return undefined;

            const lat = attraction.coordinates.lat;
            const lng = attraction.coordinates.lng;

            if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) return undefined;
            if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) return undefined;

            return [lat, lng] as [number, number];
        }

        return undefined;
    };

    // Handle map selection
    const handleMapSelect = (lat: number, lng: number) => {
        if (mapPickerType === 'destination' && currentDestinationIndex !== null) {
            setFieldValue(`destinations[${currentDestinationIndex}].coordinates.lat`, lat);
            setFieldValue(`destinations[${currentDestinationIndex}].coordinates.lng`, lng);
        } else if (mapPickerType === 'attraction' && currentAttractionIndex !== null) {
            const { destinationIndex, attractionIndex } = currentAttractionIndex;
            setFieldValue(`destinations[${destinationIndex}].attractions[${attractionIndex}].coordinates.lat`, lat);
            setFieldValue(`destinations[${destinationIndex}].attractions[${attractionIndex}].coordinates.lng`, lng);
        }
        setMapPickerOpen(false);
    };

    // Open map picker for destination
    const openDestinationMapPicker = (index: number) => {
        setCurrentDestinationIndex(index);
        setCurrentAttractionIndex(null);
        setMapPickerType('destination');
        setMapPickerOpen(true);
    };

    // Open map picker for attraction
    const openAttractionMapPicker = (destinationIndex: number, attractionIndex: number) => {
        setCurrentDestinationIndex(null);
        setCurrentAttractionIndex({ destinationIndex, attractionIndex });
        setMapPickerType('attraction');
        setMapPickerOpen(true);
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
        <>
            <Grid size={12} >

                <motion.div variants={itemVariants}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
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
                            <MapPin className="w-5 h-5 text-white" />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                            Destinations
                        </Typography>
                    </Box>
                </motion.div>

                <FieldArray name="destinations">
                    {({ push, remove }) => (
                        <Box>
                            <AnimatePresence mode="popLayout">
                                {values.destinations?.map((destination, index) => (
                                    <motion.div
                                        key={index}
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
                                                    <motion.div
                                                        animate={{ rotate: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ChevronDown className="w-5 h-5" />
                                                    </motion.div>
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
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            color: "white",
                                                            fontWeight: "bold",
                                                            minWidth: 40,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="600">
                                                            {destination.description || `Destination ${index + 1}`}
                                                        </Typography>
                                                        <Box sx={{ display: "flex", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
                                                            {destination.highlights && destination.highlights.length > 0 && (
                                                                <Chip
                                                                    label={`${destination.highlights.length} Highlights`}
                                                                    size="small"
                                                                    icon={<Sparkles className="w-3 h-3" />}
                                                                />
                                                            )}
                                                            {destination.attractions && destination.attractions.length > 0 && (
                                                                <Chip
                                                                    label={`${destination.attractions.length} Attractions`}
                                                                    size="small"
                                                                    icon={<Building2 className="w-3 h-3" />}
                                                                />
                                                            )}
                                                            {destination.activities && destination.activities.length > 0 && (
                                                                <Chip
                                                                    label={`${destination.activities.length} Activities`}
                                                                    size="small"
                                                                    icon={<Activity className="w-3 h-3" />}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>

                                            <AccordionDetails>
                                                <Grid container spacing={2.5}>
                                                    {/* Description */}
                                                    <Grid size={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Description"
                                                            multiline
                                                            rows={3}
                                                            value={destination.description || ""}
                                                            onChange={(e) =>
                                                                setFieldValue(`destinations[${index}].description`, e.target.value)
                                                            }
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": {
                                                                    borderRadius: 2,
                                                                },
                                                            }}
                                                        />
                                                    </Grid>

                                                    {/* Highlights */}
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
                                                                <Sparkles className="w-4 h-4 text-primary" />
                                                                <Typography variant="subtitle2" fontWeight="600">
                                                                    Highlights
                                                                </Typography>
                                                            </Box>
                                                            <FieldArray name={`destinations[${index}].highlights`}>
                                                                {({ push: pushHighlight, remove: removeHighlight }) => (
                                                                    <Box>
                                                                        <AnimatePresence mode="popLayout">
                                                                            {destination.highlights?.map((highlight, highlightIndex) => (
                                                                                <motion.div
                                                                                    key={highlightIndex}
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
                                                                                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            size="small"
                                                                                            placeholder="Enter highlight..."
                                                                                            value={highlight}
                                                                                            onChange={(e) =>
                                                                                                setFieldValue(
                                                                                                    `destinations[${index}].highlights[${highlightIndex}]`,
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
                                                                                            onClick={() => removeHighlight(highlightIndex)}
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
                                                                            onClick={() => pushHighlight("")}
                                                                            sx={{
                                                                                borderRadius: 2,
                                                                                textTransform: "none",
                                                                                mt: 1,
                                                                            }}
                                                                        >
                                                                            Add Highlight
                                                                        </Button>
                                                                    </Box>
                                                                )}
                                                            </FieldArray>
                                                        </Paper>
                                                    </Grid>

                                                    {/* Attractions */}
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
                                                                <Building2 className="w-4 h-4 text-primary" />
                                                                <Typography variant="subtitle2" fontWeight="600">
                                                                    Attractions
                                                                </Typography>
                                                            </Box>
                                                            <FieldArray name={`destinations[${index}].attractions`}>
                                                                {({ push: pushAttraction, remove: removeAttraction }) => (
                                                                    <Box>
                                                                        <AnimatePresence mode="popLayout">
                                                                            {destination.attractions?.map((attr, attrIndex) => (
                                                                                <motion.div
                                                                                    key={attrIndex}
                                                                                    variants={cardVariants}
                                                                                    initial="hidden"
                                                                                    animate="visible"
                                                                                    exit="exit"
                                                                                    layout
                                                                                >
                                                                                    <Accordion
                                                                                        sx={{
                                                                                            mb: 1.5,
                                                                                            borderRadius: 2,
                                                                                            border: "1px solid",
                                                                                            borderColor: "divider",
                                                                                            boxShadow: "none",
                                                                                            "&:before": { display: "none" },
                                                                                        }}
                                                                                    >
                                                                                        <AccordionSummary
                                                                                            expandIcon={
                                                                                                <ChevronDown className="w-4 h-4" />
                                                                                            }
                                                                                            sx={{
                                                                                                borderRadius: 2,
                                                                                                "&:hover": {
                                                                                                    backgroundColor: "action.hover",
                                                                                                },
                                                                                            }}
                                                                                        >
                                                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                                                <MapPin className="w-4 h-4 text-primary" />
                                                                                                <Typography variant="body2" fontWeight="500">
                                                                                                    {attr.title || `Attraction ${attrIndex + 1}`}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        </AccordionSummary>
                                                                                        <AccordionDetails>
                                                                                            <Grid container spacing={2}>
                                                                                                <Grid size={12}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Title"
                                                                                                        size="small"
                                                                                                        value={attr.title || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].attractions[${attrIndex}].title`,
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
                                                                                                        rows={2}
                                                                                                        size="small"
                                                                                                        value={attr.description || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].attractions[${attrIndex}].description`,
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
                                                                                                <Grid size={6}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Address"
                                                                                                        size="small"
                                                                                                        value={attr.address || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].attractions[${attrIndex}].address`,
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
                                                                                                <Grid size={6}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Opening Hours"
                                                                                                        size="small"
                                                                                                        value={attr.openingHours || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].attractions[${attrIndex}].openingHours`,
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

                                                                                                {/* Attraction Images */}
                                                                                                {/* <Grid size={12}>
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
                                                                                                            <ImageIcon className="w-4 h-4 text-primary" />
                                                                                                            <Typography variant="subtitle2" fontWeight="600">
                                                                                                                Attraction Images (Max 5 images)
                                                                                                            </Typography>
                                                                                                        </Box>
                                                                                                        <UploadAttractionImage
                                                                                                            imageIds={attr.imageIds || []}
                                                                                                            onImagesChange={(newImages) =>
                                                                                                                setFieldValue(
                                                                                                                    `destinations[${index}].attractions[${attrIndex}].imageIds`,
                                                                                                                    newImages
                                                                                                                )
                                                                                                            }
                                                                                                            maxImages={5}
                                                                                                            maxSizeMB={5}
                                                                                                        />
                                                                                                    </Paper>
                                                                                                </Grid> */}

                                                                                                {/* Attraction Coordinates */}
                                                                                                <Grid size={6}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Latitude"
                                                                                                        type="number"
                                                                                                        size="small"
                                                                                                        value={attr.coordinates?.lat || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].attractions[${attrIndex}].coordinates.lat`,
                                                                                                                parseFloat(e.target.value) || 0
                                                                                                            )
                                                                                                        }
                                                                                                        sx={{
                                                                                                            "& .MuiOutlinedInput-root": {
                                                                                                                borderRadius: 1.5,
                                                                                                            },
                                                                                                        }}
                                                                                                    />
                                                                                                </Grid>
                                                                                                <Grid size={6}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Longitude"
                                                                                                        type="number"
                                                                                                        size="small"
                                                                                                        value={attr.coordinates?.lng || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].attractions[${attrIndex}].coordinates.lng`,
                                                                                                                parseFloat(e.target.value) || 0
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
                                                                                                    <Button
                                                                                                        variant="outlined"
                                                                                                        startIcon={<MapPin className="w-4 h-4" />}
                                                                                                        onClick={() => openAttractionMapPicker(index, attrIndex)}
                                                                                                        sx={{
                                                                                                            borderRadius: 2,
                                                                                                            textTransform: "none",
                                                                                                        }}
                                                                                                    >
                                                                                                        Pick Attraction on Map
                                                                                                    </Button>
                                                                                                </Grid>

                                                                                                <Grid size={12}>
                                                                                                    <Button
                                                                                                        color="error"
                                                                                                        variant="outlined"
                                                                                                        startIcon={<Trash2 className="w-4 h-4" />}
                                                                                                        onClick={() => removeAttraction(attrIndex)}
                                                                                                        sx={{
                                                                                                            borderRadius: 2,
                                                                                                            textTransform: "none",
                                                                                                        }}
                                                                                                    >
                                                                                                        Remove Attraction
                                                                                                    </Button>
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        </AccordionDetails>
                                                                                    </Accordion>
                                                                                </motion.div>
                                                                            ))}
                                                                        </AnimatePresence>
                                                                        <Button
                                                                            startIcon={<Plus className="w-4 h-4" />}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => pushAttraction({
                                                                                title: "",
                                                                                coordinates: { lat: 0, lng: 0 }
                                                                            })}
                                                                            sx={{
                                                                                mt: 1.5,
                                                                                borderRadius: 2,
                                                                                textTransform: "none",
                                                                            }}
                                                                        >
                                                                            Add Attraction
                                                                        </Button>
                                                                    </Box>
                                                                )}
                                                            </FieldArray>
                                                        </Paper>
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
                                                            <FieldArray name={`destinations[${index}].activities`}>
                                                                {({ push: pushActivity, remove: removeActivity }) => (
                                                                    <Box>
                                                                        <AnimatePresence mode="popLayout">
                                                                            {destination.activities?.map((activity, actIndex) => (
                                                                                <motion.div
                                                                                    key={actIndex}
                                                                                    variants={cardVariants}
                                                                                    initial="hidden"
                                                                                    animate="visible"
                                                                                    exit="exit"
                                                                                    layout
                                                                                >
                                                                                    <Accordion
                                                                                        sx={{
                                                                                            mb: 1.5,
                                                                                            borderRadius: 2,
                                                                                            border: "1px solid",
                                                                                            borderColor: "divider",
                                                                                            boxShadow: "none",
                                                                                            "&:before": { display: "none" },
                                                                                        }}
                                                                                    >
                                                                                        <AccordionSummary
                                                                                            expandIcon={
                                                                                                <ChevronDown className="w-4 h-4" />
                                                                                            }
                                                                                            sx={{
                                                                                                borderRadius: 2,
                                                                                                "&:hover": {
                                                                                                    backgroundColor: "action.hover",
                                                                                                },
                                                                                            }}
                                                                                        >
                                                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                                                <Activity className="w-4 h-4 text-primary" />
                                                                                                <Typography variant="body2" fontWeight="500">
                                                                                                    {activity.title || `Activity ${actIndex + 1}`}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        </AccordionSummary>
                                                                                        <AccordionDetails>
                                                                                            <Grid container spacing={2}>
                                                                                                <Grid size={12}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Title"
                                                                                                        size="small"
                                                                                                        value={activity.title || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].activities[${actIndex}].title`,
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
                                                                                                <Grid size={6}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Provider"
                                                                                                        size="small"
                                                                                                        value={activity.provider || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].activities[${actIndex}].provider`,
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
                                                                                                <Grid size={6}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Duration"
                                                                                                        size="small"
                                                                                                        value={activity.duration || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].activities[${actIndex}].duration`,
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
                                                                                                        label="URL"
                                                                                                        size="small"
                                                                                                        value={activity.url || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].activities[${actIndex}].url`,
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

                                                                                                {/* Price Fields */}
                                                                                                <Grid size={6}>
                                                                                                    <TextField
                                                                                                        fullWidth
                                                                                                        label="Price Amount"
                                                                                                        type="decimal"
                                                                                                        size="small"
                                                                                                        value={activity.price?.amount || ""}
                                                                                                        onChange={(e) => {
                                                                                                            const amount = parseFloat(e.target.value);
                                                                                                            // Ensure price object exists before setting amount
                                                                                                            const currentPrice = activity.price || { amount: 0, currency: "USD" };
                                                                                                            setFieldValue(
                                                                                                                `destinations[${index}].activities[${actIndex}].price`,
                                                                                                                { ...currentPrice, amount: isNaN(amount) ? 0 : amount }
                                                                                                            );
                                                                                                        }}
                                                                                                        error={!!getError(`destinations[${index}].activities[${actIndex}].price.amount`)}
                                                                                                        helperText={getError(`destinations[${index}].activities[${actIndex}].price.amount`)}
                                                                                                        sx={{
                                                                                                            "& .MuiOutlinedInput-root": {
                                                                                                                borderRadius: 1.5,
                                                                                                            },
                                                                                                        }}
                                                                                                    />
                                                                                                </Grid>
                                                                                                <Grid size={6}>
                                                                                                    <FormControl fullWidth size="small">
                                                                                                        <InputLabel>Currency</InputLabel>
                                                                                                        <Select
                                                                                                            value={activity.price?.currency || CURRENCY.BDT}
                                                                                                            label="Currency"
                                                                                                            onChange={(e) => {
                                                                                                                const currency = e.target.value;
                                                                                                                // Ensure price object exists before setting currency
                                                                                                                const currentPrice = activity.price || { amount: 0, currency: CURRENCY.BDT };
                                                                                                                setFieldValue(
                                                                                                                    `destinations[${index}].activities[${actIndex}].price`,
                                                                                                                    { ...currentPrice, currency }
                                                                                                                );
                                                                                                            }}
                                                                                                            sx={{
                                                                                                                borderRadius: 1.5,
                                                                                                            }}
                                                                                                        >
                                                                                                            <MenuItem value={CURRENCY.USD}>USD ($)</MenuItem>
                                                                                                            <MenuItem value={CURRENCY.INR}>INR (₹)</MenuItem>
                                                                                                            <MenuItem value={CURRENCY.BDT}>BDT (৳)</MenuItem>
                                                                                                            <MenuItem value="CNY">CNY (¥)</MenuItem>
                                                                                                        </Select>
                                                                                                    </FormControl>
                                                                                                </Grid>

                                                                                                <Grid size={12}>
                                                                                                    <Button
                                                                                                        color="error"
                                                                                                        variant="outlined"
                                                                                                        startIcon={<Trash2 className="w-4 h-4" />}
                                                                                                        onClick={() => removeActivity(actIndex)}
                                                                                                        sx={{
                                                                                                            borderRadius: 2,
                                                                                                            textTransform: "none",
                                                                                                        }}
                                                                                                    >
                                                                                                        Remove Activity
                                                                                                    </Button>
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        </AccordionDetails>
                                                                                    </Accordion>
                                                                                </motion.div>
                                                                            ))}
                                                                        </AnimatePresence>
                                                                        <Button
                                                                            startIcon={<Plus className="w-4 h-4" />}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => pushActivity({ title: "" })}
                                                                            sx={{
                                                                                mt: 1.5,
                                                                                borderRadius: 2,
                                                                                textTransform: "none",
                                                                            }}
                                                                        >
                                                                            Add Activity
                                                                        </Button>
                                                                    </Box>
                                                                )}
                                                            </FieldArray>
                                                        </Paper>
                                                    </Grid>

                                                    {/*Destination Images */}
                                                    {/* <Grid size={12}>
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
                                                                <ImageIcon className="w-4 h-4 text-primary" />
                                                                <Typography variant="subtitle2" fontWeight="600">
                                                                    Images
                                                                </Typography>
                                                            </Box>
                                                            <DestinationImageUploader
                                                                imageIds={destination.imageIds || []}
                                                                onImagesChange={(newImages) =>
                                                                    setFieldValue(`destinations[${index}].imageIds`, newImages)
                                                                }
                                                                maxImages={10}
                                                                maxSizeMB={5}
                                                            />
                                                        </Paper>
                                                    </Grid> */}

                                                    {/* Destination Coordinates */}
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
                                                                <Map className="w-4 h-4 text-primary" />
                                                                <Typography variant="subtitle2" fontWeight="600">
                                                                    Location Coordinates
                                                                </Typography>
                                                            </Box>
                                                            <Grid container spacing={2}>
                                                                <Grid size={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Latitude"
                                                                        type="number"
                                                                        size="small"
                                                                        value={destination.coordinates?.lat || ""}
                                                                        onChange={(e) =>
                                                                            setFieldValue(`destinations[${index}].coordinates.lat`, parseFloat(e.target.value) || 0)
                                                                        }
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                borderRadius: 1.5,
                                                                            },
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid size={6}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Longitude"
                                                                        type="number"
                                                                        size="small"
                                                                        value={destination.coordinates?.lng || ""}
                                                                        onChange={(e) =>
                                                                            setFieldValue(`destinations[${index}].coordinates.lng`, parseFloat(e.target.value) || 0)
                                                                        }
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                borderRadius: 1.5,
                                                                            },
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid size={12}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        startIcon={<MapPin className="w-4 h-4" />}
                                                                        onClick={() => openDestinationMapPicker(index)}
                                                                        sx={{
                                                                            borderRadius: 2,
                                                                            textTransform: "none",
                                                                        }}
                                                                    >
                                                                        Pick Destination on Map
                                                                    </Button>
                                                                </Grid>
                                                            </Grid>
                                                        </Paper>
                                                    </Grid>

                                                    {/* Remove Destination */}
                                                    <Grid size={12}>
                                                        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
                                                            <Button
                                                                color="error"
                                                                variant="outlined"
                                                                startIcon={<Trash2 className="w-4 h-4" />}
                                                                onClick={() => remove(index)}
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    textTransform: "none",
                                                                }}
                                                            >
                                                                Remove Destination
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add Destination */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    startIcon={<Plus className="w-4 h-4" />}
                                    variant="contained"
                                    onClick={() =>
                                        push({
                                            country: "",
                                            city: "",
                                            district: "",
                                            description: "",
                                            highlights: [],
                                            attractions: [],
                                            activities: [],
                                            imageIds: [],
                                            coordinates: { lat: 0, lng: 0 },
                                        })
                                    }
                                    sx={{
                                        mt: 2,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                                        },
                                    }}
                                >
                                    Add Destination
                                </Button>
                            </motion.div>
                        </Box>
                    )}
                </FieldArray>
            </Grid>

            <MapPickerDialog
                open={mapPickerOpen}
                onClose={() => setMapPickerOpen(false)}
                onSelect={handleMapSelect}
                initialPosition={getInitialPosition()}
            />
        </>
    );
}