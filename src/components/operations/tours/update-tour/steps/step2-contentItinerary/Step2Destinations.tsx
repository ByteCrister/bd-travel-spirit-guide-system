'use client';

import { useState } from 'react';
import { useFormikContext } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Plus,
    Trash2,
    Link,
    MapPin,
    ChevronDown,
    ChevronUp,
    Sparkles,
    MapPinned,
    Compass,
    Activity,
    Clock,
} from 'lucide-react';
import {
    UpdateTourContentItineraryDTO,
    DestinationBlockDTO,
    AttractionDTO,
    ActivityDTO,
} from '@/types/tour.types';
import { CURRENCY } from '@/constants/tour.const';
import { MapPickerDialog } from '@/components/global/MapPickerDialog';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
        opacity: 0, 
        y: -20,
        transition: { duration: 0.2 }
    }
};

const nestedCardVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
        opacity: 1, 
        height: 'auto',
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
        opacity: 0, 
        height: 0,
        transition: { duration: 0.2 }
    }
};

export default function Step2Destinations() {
    const { values, setFieldValue } = useFormikContext<UpdateTourContentItineraryDTO>();
    const [highlightInputs, setHighlightInputs] = useState<Record<number, string>>({});
    const [expandedDestinations, setExpandedDestinations] = useState<string[]>([]);
    const [expandedAttractions, setExpandedAttractions] = useState<string[]>([]);
    const [expandedActivities, setExpandedActivities] = useState<string[]>([]);
    const [activityPriceInputs, setActivityPriceInputs] = useState<Record<string, string>>({});

    const [mapPickerState, setMapPickerState] = useState<{
        isOpen: boolean;
        type: 'destination' | 'attraction';
        destinationIndex?: number;
        attractionIndex?: number;
    }>({
        isOpen: false,
        type: 'destination'
    });

    // =============== DESTINATION MANAGEMENT ===============
    const addDestination = () => {
        const newDestination: DestinationBlockDTO = {
            description: '',
            highlights: [],
            attractions: [],
            activities: [],
            imageIds: [],
            coordinates: { lat: 0, lng: 0 },
        };
        setFieldValue('destinations', [...(values.destinations || []), newDestination]);
    };

    const removeDestination = (index: number) => {
        const destinations = [...(values.destinations || [])];
        destinations.splice(index, 1);
        setFieldValue('destinations', destinations);
    };

    const updateDestinationField = (index: number, field: keyof DestinationBlockDTO, value: unknown) => {
        const destinations = [...(values.destinations || [])];
        destinations[index] = { ...destinations[index], [field]: value };
        setFieldValue('destinations', destinations);
    };

    // =============== ATTRACTION MANAGEMENT ===============
    const addAttraction = (destinationIndex: number) => {
        const destinations = [...(values.destinations || [])];
        const newAttraction: AttractionDTO = {
            title: '',
            description: '',
            bestFor: '',
            insiderTip: '',
            address: '',
            openingHours: '',
            imageIds: [],
            coordinates: { lat: 0, lng: 0 },
        };

        if (!destinations[destinationIndex].attractions) {
            destinations[destinationIndex].attractions = [];
        }

        destinations[destinationIndex].attractions = [
            ...destinations[destinationIndex].attractions,
            newAttraction,
        ];
        setFieldValue('destinations', destinations);
    };

    const removeAttraction = (destinationIndex: number, attractionIndex: number) => {
        const destinations = [...(values.destinations || [])];
        if (destinations[destinationIndex].attractions) {
            destinations[destinationIndex].attractions.splice(attractionIndex, 1);
        }
        setFieldValue('destinations', destinations);
    };

    const updateAttractionField = (
        destinationIndex: number,
        attractionIndex: number,
        field: keyof AttractionDTO,
        value: unknown
    ) => {
        const destinations = [...(values.destinations || [])];
        const attractions = [...(destinations[destinationIndex].attractions || [])];
        attractions[attractionIndex] = { ...attractions[attractionIndex], [field]: value };
        destinations[destinationIndex].attractions = attractions;
        setFieldValue('destinations', destinations);
    };

    // =============== ACTIVITY MANAGEMENT ===============
    const addActivity = (destinationIndex: number) => {
        const destinations = [...(values.destinations || [])];
        const newActivity: ActivityDTO = {
            title: '',
            url: '',
            provider: '',
            duration: '',
            price: { amount: 0, currency: CURRENCY.BDT },
        };

        if (!destinations[destinationIndex].activities) {
            destinations[destinationIndex].activities = [];
        }

        destinations[destinationIndex].activities = [
            ...destinations[destinationIndex].activities,
            newActivity,
        ];
        setFieldValue('destinations', destinations);
    };

    const removeActivity = (destinationIndex: number, activityIndex: number) => {
        const destinations = [...(values.destinations || [])];
        if (destinations[destinationIndex].activities) {
            destinations[destinationIndex].activities.splice(activityIndex, 1);
        }
        setFieldValue('destinations', destinations);
    };

    const updateActivityField = (
        destinationIndex: number,
        activityIndex: number,
        field: keyof ActivityDTO,
        value: unknown
    ) => {
        const destinations = [...(values.destinations || [])];
        const activities = [...(destinations[destinationIndex].activities || [])];
        activities[activityIndex] = { ...activities[activityIndex], [field]: value };
        destinations[destinationIndex].activities = activities;
        setFieldValue('destinations', destinations);
    };

    // =============== HIGHLIGHTS MANAGEMENT ===============
    const addHighlight = (destinationIndex: number, highlight: string) => {
        if (!highlight.trim()) return;
        const destinations = [...(values.destinations || [])];
        const highlights = [...(destinations[destinationIndex].highlights || [])];
        highlights.push(highlight.trim());
        destinations[destinationIndex].highlights = highlights;
        setFieldValue('destinations', destinations);
        setHighlightInputs(prev => ({ ...prev, [destinationIndex]: '' }));
    };

    const removeHighlight = (destinationIndex: number, highlightIndex: number) => {
        const destinations = [...(values.destinations || [])];
        const highlights = [...(destinations[destinationIndex].highlights || [])];
        highlights.splice(highlightIndex, 1);
        destinations[destinationIndex].highlights = highlights;
        setFieldValue('destinations', destinations);
    };

    // =============== MAP PICKER HANDLERS ===============
    const openMapPickerForDestination = (destinationIndex: number) => {
        setMapPickerState({
            isOpen: true,
            type: 'destination',
            destinationIndex,
        });
    };

    const openMapPickerForAttraction = (destinationIndex: number, attractionIndex: number) => {
        setMapPickerState({
            isOpen: true,
            type: 'attraction',
            destinationIndex,
            attractionIndex,
        });
    };

    const handleMapSelect = (lat: number, lng: number) => {
        if (mapPickerState.type === 'destination' && mapPickerState.destinationIndex !== undefined) {
            updateDestinationField(mapPickerState.destinationIndex, 'coordinates', { lat, lng });
        } else if (
            mapPickerState.type === 'attraction' &&
            mapPickerState.destinationIndex !== undefined &&
            mapPickerState.attractionIndex !== undefined
        ) {
            updateAttractionField(
                mapPickerState.destinationIndex,
                mapPickerState.attractionIndex,
                'coordinates',
                { lat, lng }
            );
        }
        setMapPickerState({ isOpen: false, type: 'destination' });
    };

    // Toggle handlers
    const toggleDestination = (value: string) => {
        setExpandedDestinations(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const toggleAttraction = (value: string) => {
        setExpandedAttractions(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const toggleActivity = (value: string) => {
        setExpandedActivities(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const getInitialPosition = () => {
        if (mapPickerState.type === 'destination' && mapPickerState.destinationIndex !== undefined) {
            const dest = values.destinations?.[mapPickerState.destinationIndex];
            if (dest?.coordinates?.lat && dest?.coordinates?.lng) {
                return [dest.coordinates.lat, dest.coordinates.lng] as [number, number];
            }
        } else if (
            mapPickerState.type === 'attraction' &&
            mapPickerState.destinationIndex !== undefined &&
            mapPickerState.attractionIndex !== undefined
        ) {
            const attraction = values.destinations?.[mapPickerState.destinationIndex]?.attractions?.[mapPickerState.attractionIndex];
            if (attraction?.coordinates?.lat && attraction?.coordinates?.lng) {
                return [attraction.coordinates.lat, attraction.coordinates.lng] as [number, number];
            }
        }
        return undefined;
    };

    const isDestinationExpanded = (index: number) => expandedDestinations.includes(`destination-${index}`);
    const isAttractionExpanded = (destIndex: number, attrIndex: number) => 
        expandedAttractions.includes(`attraction-${destIndex}-${attrIndex}`);
    const isActivityExpanded = (destIndex: number, actIndex: number) => 
        expandedActivities.includes(`activity-${destIndex}-${actIndex}`);

    return (
        <div className="space-y-6">
            <AnimatePresence mode="popLayout">
                {(values?.destinations ?? []).map((destination, destinationIndex) => (
                    <motion.div
                        key={destinationIndex}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                    >
                        <Card className="border-2 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        className="flex-1 flex items-center gap-3 text-left group"
                                        onClick={() => toggleDestination(`destination-${destinationIndex}`)}
                                    >
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                                            <MapPinned className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                Destination {destinationIndex + 1}
                                            </h4>
                                            {destination.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                                    {destination.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {destination.attractions && destination.attractions.length > 0 && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Compass className="h-3 w-3" />
                                                    {destination.attractions.length}
                                                </Badge>
                                            )}
                                            {destination.activities && destination.activities.length > 0 && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    {destination.activities.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-1 ml-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeDestination(destinationIndex);
                                            }}
                                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleDestination(`destination-${destinationIndex}`)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {isDestinationExpanded(destinationIndex) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <AnimatePresence>
                                {isDestinationExpanded(destinationIndex) && (
                                    <motion.div
                                        variants={nestedCardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <Separator />
                                        <CardContent className="pt-6 space-y-6">
                                            {/* Description */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`dest-${destinationIndex}-description`}>
                                                    Description
                                                </Label>
                                                <Textarea
                                                    id={`dest-${destinationIndex}-description`}
                                                    value={destination.description || ''}
                                                    onChange={(e) => updateDestinationField(destinationIndex, 'description', e.target.value)}
                                                    rows={3}
                                                    placeholder="Describe this destination..."
                                                    className="resize-none"
                                                />
                                            </div>

                                            {/* Highlights */}
                                            <div className="space-y-3">
                                                <Label className="flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                                    Highlights
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add a highlight..."
                                                        value={highlightInputs[destinationIndex] || ''}
                                                        onChange={(e) => setHighlightInputs(prev => ({ ...prev, [destinationIndex]: e.target.value }))}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addHighlight(destinationIndex, highlightInputs[destinationIndex] || '');
                                                            }
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => addHighlight(destinationIndex, highlightInputs[destinationIndex] || '')}
                                                        size="sm"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add
                                                    </Button>
                                                </div>
                                                {destination.highlights && destination.highlights.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        <AnimatePresence mode="popLayout">
                                                            {destination.highlights.map((highlight, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="gap-1 pr-1 hover:bg-secondary/80 transition-colors"
                                                                    >
                                                                        {highlight}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeHighlight(destinationIndex, idx)}
                                                                            className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors"
                                                                        >
                                                                            <Plus className="h-3 w-3 rotate-45" />
                                                                        </button>
                                                                    </Badge>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Destination Coordinates */}
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-blue-500" />
                                                    Destination Coordinates
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openMapPickerForDestination(destinationIndex)}
                                                        className="gap-2"
                                                    >
                                                        <MapPin className="h-4 w-4" />
                                                        {destination.coordinates?.lat && destination.coordinates?.lng
                                                            ? 'Change Location'
                                                            : 'Pick Location'}
                                                    </Button>
                                                    {destination.coordinates?.lat && destination.coordinates?.lng && (
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {destination.coordinates.lat.toFixed(6)}, {destination.coordinates.lng.toFixed(6)}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Click to pick location on map. Coordinates must be within Bangladesh.
                                                </p>
                                            </div>

                                            <Separator />

                                            {/* Attractions Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-base flex items-center gap-2">
                                                        <Compass className="h-5 w-5 text-purple-500" />
                                                        Attractions
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addAttraction(destinationIndex)}
                                                        className="gap-2"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    <AnimatePresence mode="popLayout">
                                                        {(destination.attractions || []).map((attraction, attractionIndex) => (
                                                            <motion.div
                                                                key={attractionIndex}
                                                                variants={cardVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                                layout
                                                            >
                                                                <Card className="border hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                                                                    <CardHeader className="pb-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <button
                                                                                type="button"
                                                                                className="flex-1 flex items-center gap-2 text-left group"
                                                                                onClick={() => toggleAttraction(`attraction-${destinationIndex}-${attractionIndex}`)}
                                                                            >
                                                                                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                                                                    <Compass className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                                </div>
                                                                                <span className="text-sm font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                                                    {attraction.title || `Attraction ${attractionIndex + 1}`}
                                                                                </span>
                                                                            </button>
                                                                            <div className="flex items-center gap-1">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        removeAttraction(destinationIndex, attractionIndex);
                                                                                    }}
                                                                                    className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                                                                >
                                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => toggleAttraction(`attraction-${destinationIndex}-${attractionIndex}`)}
                                                                                    className="h-7 w-7 p-0"
                                                                                >
                                                                                    {isAttractionExpanded(destinationIndex, attractionIndex) ? (
                                                                                        <ChevronUp className="h-3.5 w-3.5" />
                                                                                    ) : (
                                                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                                                    )}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </CardHeader>

                                                                    <AnimatePresence>
                                                                        {isAttractionExpanded(destinationIndex, attractionIndex) && (
                                                                            <motion.div
                                                                                variants={nestedCardVariants}
                                                                                initial="hidden"
                                                                                animate="visible"
                                                                                exit="exit"
                                                                            >
                                                                                <Separator />
                                                                                <CardContent className="pt-4 space-y-4">
                                                                                    <div className="grid grid-cols-2 gap-4">
                                                                                        <div className="space-y-2">
                                                                                            <Label>
                                                                                                Title <span className="text-red-500">*</span>
                                                                                            </Label>
                                                                                            <Input
                                                                                                value={attraction.title || ''}
                                                                                                onChange={(e) => updateAttractionField(destinationIndex, attractionIndex, 'title', e.target.value)}
                                                                                                required
                                                                                            />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                            <Label>Best For</Label>
                                                                                            <Input
                                                                                                value={attraction.bestFor || ''}
                                                                                                onChange={(e) => updateAttractionField(destinationIndex, attractionIndex, 'bestFor', e.target.value)}
                                                                                                placeholder="Families, Photographers..."
                                                                                            />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-2">
                                                                                        <Label>Description</Label>
                                                                                        <Textarea
                                                                                            value={attraction.description || ''}
                                                                                            onChange={(e) => updateAttractionField(destinationIndex, attractionIndex, 'description', e.target.value)}
                                                                                            rows={2}
                                                                                            className="resize-none"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="space-y-2">
                                                                                        <Label>Insider Tip</Label>
                                                                                        <Input
                                                                                            value={attraction.insiderTip || ''}
                                                                                            onChange={(e) => updateAttractionField(destinationIndex, attractionIndex, 'insiderTip', e.target.value)}
                                                                                            placeholder="Local secret or tip..."
                                                                                        />
                                                                                    </div>

                                                                                    <div className="space-y-2">
                                                                                        <Label>Address</Label>
                                                                                        <Input
                                                                                            value={attraction.address || ''}
                                                                                            onChange={(e) => updateAttractionField(destinationIndex, attractionIndex, 'address', e.target.value)}
                                                                                        />
                                                                                    </div>

                                                                                    <div className="space-y-2">
                                                                                        <Label>Opening Hours</Label>
                                                                                        <Input
                                                                                            value={attraction.openingHours || ''}
                                                                                            onChange={(e) => updateAttractionField(destinationIndex, attractionIndex, 'openingHours', e.target.value)}
                                                                                            placeholder="9:00 AM - 5:00 PM"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="space-y-2">
                                                                                        <Label className="flex items-center gap-2">
                                                                                            <MapPin className="h-4 w-4 text-purple-500" />
                                                                                            Coordinates
                                                                                        </Label>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                onClick={() => openMapPickerForAttraction(destinationIndex, attractionIndex)}
                                                                                                className="gap-2"
                                                                                            >
                                                                                                <MapPin className="h-4 w-4" />
                                                                                                {attraction.coordinates?.lat && attraction.coordinates?.lng ? 'Change' : 'Pick'}
                                                                                            </Button>
                                                                                            {attraction.coordinates?.lat && attraction.coordinates?.lng && (
                                                                                                <Badge variant="outline" className="font-mono text-xs">
                                                                                                    {attraction.coordinates.lat.toFixed(6)}, {attraction.coordinates.lng.toFixed(6)}
                                                                                                </Badge>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </CardContent>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </Card>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Activities Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-base flex items-center gap-2">
                                                        <Activity className="h-5 w-5 text-green-500" />
                                                        Activities
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addActivity(destinationIndex)}
                                                        className="gap-2"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    <AnimatePresence mode="popLayout">
                                                        {(destination.activities || []).map((activity, activityIndex) => {
                                                            const priceKey = `${destinationIndex}-${activityIndex}`;
                                                            
                                                            return (
                                                                <motion.div
                                                                    key={activityIndex}
                                                                    variants={cardVariants}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    exit="exit"
                                                                    layout
                                                                >
                                                                    <Card className="border hover:border-green-400 dark:hover:border-green-600 transition-colors">
                                                                        <CardHeader className="pb-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <button
                                                                                    type="button"
                                                                                    className="flex-1 flex items-center gap-2 text-left group"
                                                                                    onClick={() => toggleActivity(`activity-${destinationIndex}-${activityIndex}`)}
                                                                                >
                                                                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                                                                        <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                                    </div>
                                                                                    <span className="text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                                                        {activity.title || `Activity ${activityIndex + 1}`}
                                                                                    </span>
                                                                                </button>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            removeActivity(destinationIndex, activityIndex);
                                                                                        }}
                                                                                        className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                                                                    >
                                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => toggleActivity(`activity-${destinationIndex}-${activityIndex}`)}
                                                                                        className="h-7 w-7 p-0"
                                                                                    >
                                                                                        {isActivityExpanded(destinationIndex, activityIndex) ? (
                                                                                            <ChevronUp className="h-3.5 w-3.5" />
                                                                                        ) : (
                                                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                                                        )}
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </CardHeader>

                                                                        <AnimatePresence>
                                                                            {isActivityExpanded(destinationIndex, activityIndex) && (
                                                                                <motion.div
                                                                                    variants={nestedCardVariants}
                                                                                    initial="hidden"
                                                                                    animate="visible"
                                                                                    exit="exit"
                                                                                >
                                                                                    <Separator />
                                                                                    <CardContent className="pt-4 space-y-4">
                                                                                        <div className="grid grid-cols-2 gap-4">
                                                                                            <div className="space-y-2">
                                                                                                <Label>Title <span className="text-red-500">*</span></Label>
                                                                                                <Input
                                                                                                    value={activity.title || ''}
                                                                                                    onChange={(e) => updateActivityField(destinationIndex, activityIndex, 'title', e.target.value)}
                                                                                                    required
                                                                                                />
                                                                                            </div>
                                                                                            <div className="space-y-2">
                                                                                                <Label>Provider</Label>
                                                                                                <Input
                                                                                                    value={activity.provider || ''}
                                                                                                    onChange={(e) => updateActivityField(destinationIndex, activityIndex, 'provider', e.target.value)}
                                                                                                />
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-2">
                                                                                            <Label className="flex items-center gap-2">
                                                                                                <Link className="h-4 w-4 text-blue-500" />
                                                                                                URL
                                                                                            </Label>
                                                                                            <Input
                                                                                                value={activity.url || ''}
                                                                                                onChange={(e) => updateActivityField(destinationIndex, activityIndex, 'url', e.target.value)}
                                                                                                placeholder="https://..."
                                                                                            />
                                                                                        </div>

                                                                                        <div className="grid grid-cols-2 gap-4">
                                                                                            <div className="space-y-2">
                                                                                                <Label className="flex items-center gap-2">
                                                                                                    <Clock className="h-4 w-4 text-orange-500" />
                                                                                                    Duration
                                                                                                </Label>
                                                                                                <Input
                                                                                                    value={activity.duration || ''}
                                                                                                    onChange={(e) => updateActivityField(destinationIndex, activityIndex, 'duration', e.target.value)}
                                                                                                    placeholder="2 hours"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="space-y-2">
                                                                                                <Label className="flex items-center gap-2">
                                                                                                    <FaBangladeshiTakaSign className="h-4 w-4 text-green-500" />
                                                                                                    Price
                                                                                                </Label>
                                                                                                <Input
                                                                                                    type="text"
                                                                                                    inputMode="decimal"
                                                                                                    placeholder="0.00"
                                                                                                    value={
                                                                                                        activityPriceInputs[priceKey] ??
                                                                                                        activity.price?.amount?.toString() ??
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(e) => {
                                                                                                        const value = e.target.value;
                                                                                                        if (!/^\d*\.?\d*$/.test(value)) return;
                                                                                                        setActivityPriceInputs(prev => ({
                                                                                                            ...prev,
                                                                                                            [priceKey]: value,
                                                                                                        }));
                                                                                                    }}
                                                                                                    onBlur={() => {
                                                                                                        const raw = activityPriceInputs[priceKey];
                                                                                                        if (raw === undefined || raw === '') {
                                                                                                            updateActivityField(destinationIndex, activityIndex, 'price', {
                                                                                                                ...activity.price,
                                                                                                                amount: '0',
                                                                                                            });
                                                                                                            return;
                                                                                                        }
                                                                                                        const num = Number(raw);
                                                                                                        if (isNaN(num) || num < 0) return;
                                                                                                        updateActivityField(destinationIndex, activityIndex, 'price', {
                                                                                                            ...activity.price,
                                                                                                            amount: num.toFixed(2),
                                                                                                        });
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="space-y-2">
                                                                                            <Label>Currency</Label>
                                                                                            <Select
                                                                                                value={activity.price?.currency}
                                                                                                onValueChange={(value) => updateActivityField(destinationIndex, activityIndex, 'price', {
                                                                                                    ...activity.price,
                                                                                                    currency: value,
                                                                                                })}
                                                                                            >
                                                                                                <SelectTrigger>
                                                                                                    <SelectValue placeholder="Select currency" />
                                                                                                </SelectTrigger>
                                                                                                <SelectContent>
                                                                                                    {Object.entries(CURRENCY).map(([key, value]) => (
                                                                                                        <SelectItem key={key} value={value}>
                                                                                                            {value}
                                                                                                        </SelectItem>
                                                                                                    ))}
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </Card>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Button
                    type="button"
                    variant="outline"
                    onClick={addDestination}
                    className="w-full border-2 border-dashed hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Destination
                </Button>
            </motion.div>

            <MapPickerDialog
                open={mapPickerState.isOpen}
                onClose={() => setMapPickerState({ isOpen: false, type: 'destination' })}
                onSelect={handleMapSelect}
                initialPosition={getInitialPosition()}
            />
        </div>
    );
}