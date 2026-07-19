'use client';

import { useState } from 'react';
import { useFormikContext } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Plus,
    Trash2,
    Link,
    MapPin,
    ChevronDown,
    Sparkles,
    MapPinned,
    Compass,
    Activity,
    Clock,
    X,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    UpdateTourContentItineraryDTO,
    DestinationBlockDTO,
    AttractionDTO,
    ActivityDTO,
} from '@/types/tour/tour.types';
import { CURRENCY } from '@/constants/tour/tour.const';
import { MapPickerDialog } from '@/components/global/MapPickerDialog';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const NEU = {
    surface: 'bg-[#E7E5E4] dark:bg-[#1a1918]',
    surfaceDeep: 'bg-[#dedad8] dark:bg-[#141312]',
    surfaceNest: 'bg-[#d8d6d4] dark:bg-[#111110]',

    raised:
        ' dark:',
    raisedSm:
        ' dark:',
    raisedXs:
        ' dark:',

    inset:
        ' dark:',
    insetSm:
        ' dark:',

    radius: 'rounded-2xl',
    radiusMd: 'rounded-xl',
    radiusSm: 'rounded-lg',
    radiusFull: 'rounded-full',

    border: 'border border-[#d4d2d0] dark:border-[#2a2926]',
    borderLight: 'border border-[#e0dedd] dark:border-[#232120]',

    text: {
        primary: 'text-[#1E2938] dark:text-[#e8e6e4]',
        secondary: 'text-[#4a5568] dark:text-[#9a9896]',
        muted: 'text-[#8a8886] dark:text-[#6a6866]',
        teal: 'text-[#006666] dark:text-[#00aaaa]',
        purple: 'text-purple-700 dark:text-purple-400',
        green: 'text-emerald-700 dark:text-emerald-400',
        amber: 'text-amber-700 dark:text-amber-400',
        danger: 'text-red-600 dark:text-red-400',
        blue: 'text-blue-700 dark:text-blue-400',
    },

    iconBg: {
        teal: 'bg-[#006666]/10 dark:bg-[#006666]/20',
        purple: 'bg-purple-100 dark:bg-purple-900/30',
        green: 'bg-emerald-100 dark:bg-emerald-900/30',
        amber: 'bg-amber-100 dark:bg-amber-900/30',
        blue: 'bg-blue-100 dark:bg-blue-900/30',
        danger: 'bg-red-100 dark:bg-red-900/20',
    },

    divider: 'border-t border-[#d4d2d0] dark:border-[#2a2926]',
    font: 'font-["Space_Mono",monospace]',
} as const;

// ─── Animation Variants ───────────────────────────────────────────────────────

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const expandVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.28, ease: 'easeOut' } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

// ─── Shared Input Class ───────────────────────────────────────────────────────

const inputCls = [
    'w-full',
    NEU.surface,
    NEU.inset,
    NEU.radiusMd,
    NEU.border,
    NEU.text.primary,
    'placeholder:text-[#9a9896] dark:placeholder:text-[#6a6866]',
    'px-4 py-2.5 text-sm transition-all duration-200 outline-none',
    'focus:ring-2 focus:ring-[#006666]/25 focus:ring-offset-0',
    NEU.font,
].join(' ');

// ─── Shared Sub-components ────────────────────────────────────────────────────

const NeuLabel = ({
    htmlFor,
    icon,
    iconColor = NEU.text.secondary,
    children,
    required,
}: {
    htmlFor?: string;
    icon?: React.ReactNode;
    iconColor?: string;
    children: React.ReactNode;
    required?: boolean;
}) => (
    <label
        htmlFor={htmlFor}
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest ${NEU.text.secondary} ${NEU.font} mb-1.5`}
    >
        {icon && <span className={iconColor}>{icon}</span>}
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const SectionDivider = ({ label }: { label: string }) => (
    <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
            <div className={`w-full ${NEU.divider}`} />
        </div>
        <div className="relative flex justify-start pl-0">
            <span
                className={[
                    'pr-3 text-[10px] font-semibold uppercase tracking-widest',
                    NEU.text.muted,
                    NEU.font,
                    NEU.surfaceDeep,
                ].join(' ')}
            >
                {label}
            </span>
        </div>
    </div>
);

// Neumorphic icon action button (delete / chevron)
const NeuIconBtn = ({
    onClick,
    danger,
    children,
    label,
}: {
    onClick: (e: React.MouseEvent) => void;
    danger?: boolean;
    children: React.ReactNode;
    label: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={[
            'w-8 h-8 flex items-center justify-center flex-shrink-0',
            NEU.radiusSm,
            NEU.surface,
            NEU.raisedXs,
            NEU.border,
            'transition-all duration-150',
            danger
                ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                : `${NEU.text.secondary} hover:bg-[#dedad8] dark:hover:bg-[#141312]`,
            'active: dark:active:',
        ].join(' ')}
    >
        {children}
    </button>
);

// Pill add-button
const NeuAddBtn = ({
    onClick,
    children,
    accent = 'teal',
    full,
    dashed,
}: {
    onClick: () => void;
    children: React.ReactNode;
    accent?: 'teal' | 'purple' | 'green';
    full?: boolean;
    dashed?: boolean;
}) => {
    const accentCls = {
        teal: NEU.text.teal,
        purple: NEU.text.purple,
        green: NEU.text.green,
    }[accent];

    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex items-center gap-2 px-4 py-2 text-xs font-semibold',
                NEU.radiusMd,
                NEU.font,
                full ? 'w-full justify-center' : '',
                dashed
                    ? `border-2 border-dashed border-[#c8c6c4] dark:border-[#3a3836] ${NEU.surface} hover:border-[#006666]/50`
                    : [NEU.surface, NEU.raisedSm, NEU.border].join(' '),
                accentCls,
                'transition-all duration-200',
                'hover: dark:hover:',
                'active: dark:active:',
            ].join(' ')}
        >
            <Plus className="w-3.5 h-3.5" />
            {children}
        </button>
    );
};

// Meta count badge
const MetaBadge = ({
    count,
    icon,
    variant,
}: {
    count: number;
    icon: React.ReactNode;
    variant: 'purple' | 'green' | 'amber';
}) => {
    const cls = {
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    }[variant];

    return (
        <span
            className={[
                'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold',
                NEU.radiusSm,
                NEU.insetSm,
                NEU.borderLight,
                NEU.font,
                cls,
            ].join(' ')}
        >
            {icon}
            {count}
        </span>
    );
};

// Highlight chip
const HighlightChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.18 }}
        className={[
            'inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 text-[11px] font-medium',
            NEU.radiusSm,
            NEU.insetSm,
            NEU.border,
            NEU.font,
            'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        ].join(' ')}
    >
        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
        {label}
        <button
            type="button"
            onClick={onRemove}
            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors ml-0.5"
        >
            <X className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
        </button>
    </motion.span>
);

// Coordinates badge
const CoordBadge = ({ lat, lng }: { lat: number; lng: number }) => (
    <span
        className={[
            'inline-flex items-center px-2.5 py-1 text-[11px]',
            NEU.radiusSm,
            NEU.insetSm,
            NEU.border,
            NEU.font,
            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        ].join(' ')}
    >
        {lat.toFixed(5)}, {lng.toFixed(5)}
    </span>
);

// ─── Nested Card Shell ────────────────────────────────────────────────────────

const NestedCard = ({
    icon,
    iconBg,
    iconColor,
    title,
    isExpanded,
    onToggle,
    onRemove,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accentHover,
    children,
}: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    onRemove: (e: React.MouseEvent) => void;
    accentHover: string;
    children: React.ReactNode;
}) => (
    <div
        className={[
            NEU.surface,
            NEU.raisedSm,
            NEU.radiusMd,
            NEU.border,
            'overflow-hidden transition-all duration-200',
        ].join(' ')}
    >
        {/* Header */}
        <div
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => e.key === 'Enter' && onToggle()}
            className={[
                'flex items-center gap-2.5 px-4 py-3 cursor-pointer',
                'hover:bg-[#dedad8] dark:hover:bg-[#141312]',
                'transition-colors duration-150',
                isExpanded ? NEU.divider : '',
            ].join(' ')}
        >
            <div className={`p-1.5 ${NEU.radiusSm} ${iconBg} ${NEU.raisedXs}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <span className={`flex-1 text-sm font-semibold truncate ${NEU.text.primary} ${NEU.font}`}>
                {title}
            </span>
            <div className="flex items-center gap-1.5">
                <NeuIconBtn onClick={onRemove} danger label="Remove">
                    <Trash2 className="w-3.5 h-3.5" />
                </NeuIconBtn>
                <div
                    className={[
                        'w-8 h-8 flex items-center justify-center',
                        NEU.radiusSm,
                        NEU.surface,
                        NEU.raisedXs,
                        NEU.border,
                    ].join(' ')}
                >
                    <ChevronDown
                        className={`w-3.5 h-3.5 ${NEU.text.secondary} transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>
        </div>

        {/* Expanded */}
        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    variants={expandVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={NEU.surfaceDeep}
                >
                    <div className="px-4 py-5 space-y-4">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

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
    }>({ isOpen: false, type: 'destination' });

    // ── Destination CRUD ──────────────────────────────────────────────────────

    const addDestination = () => {
        const newDest: DestinationBlockDTO = {
            description: '',
            highlights: [],
            attractions: [],
            activities: [],
            imageIds: [],
            coordinates: { lat: 0, lng: 0 },
        };
        setFieldValue('destinations', [...(values.destinations || []), newDest]);
    };

    const removeDestination = (index: number) => {
        const dests = [...(values.destinations || [])];
        dests.splice(index, 1);
        setFieldValue('destinations', dests);
    };

    const updateDestinationField = (
        index: number,
        field: keyof DestinationBlockDTO,
        value: unknown
    ) => {
        const dests = [...(values.destinations || [])];
        dests[index] = { ...dests[index], [field]: value };
        setFieldValue('destinations', dests);
    };

    // ── Attraction CRUD ───────────────────────────────────────────────────────

    const addAttraction = (dIdx: number) => {
        const dests = [...(values.destinations || [])];
        const newAttr: AttractionDTO = {
            title: '',
            description: '',
            bestFor: '',
            insiderTip: '',
            address: '',
            openingHours: '',
            imageIds: [],
            coordinates: { lat: 0, lng: 0 },
        };
        dests[dIdx].attractions = [...(dests[dIdx].attractions || []), newAttr];
        setFieldValue('destinations', dests);
    };

    const removeAttraction = (dIdx: number, aIdx: number) => {
        const dests = [...(values.destinations || [])];
        dests[dIdx].attractions?.splice(aIdx, 1);
        setFieldValue('destinations', dests);
    };

    const updateAttractionField = (
        dIdx: number,
        aIdx: number,
        field: keyof AttractionDTO,
        value: unknown
    ) => {
        const dests = [...(values.destinations || [])];
        const attrs = [...(dests[dIdx].attractions || [])];
        attrs[aIdx] = { ...attrs[aIdx], [field]: value };
        dests[dIdx].attractions = attrs;
        setFieldValue('destinations', dests);
    };

    // ── Activity CRUD ─────────────────────────────────────────────────────────

    const addActivity = (dIdx: number) => {
        const dests = [...(values.destinations || [])];
        const newAct: ActivityDTO = {
            title: '',
            url: '',
            provider: '',
            duration: '',
            price: { amount: 0, currency: CURRENCY.BDT },
        };
        dests[dIdx].activities = [...(dests[dIdx].activities || []), newAct];
        setFieldValue('destinations', dests);
    };

    const removeActivity = (dIdx: number, actIdx: number) => {
        const dests = [...(values.destinations || [])];
        dests[dIdx].activities?.splice(actIdx, 1);
        setFieldValue('destinations', dests);
    };

    const updateActivityField = (
        dIdx: number,
        actIdx: number,
        field: keyof ActivityDTO,
        value: unknown
    ) => {
        const dests = [...(values.destinations || [])];
        const acts = [...(dests[dIdx].activities || [])];
        acts[actIdx] = { ...acts[actIdx], [field]: value };
        dests[dIdx].activities = acts;
        setFieldValue('destinations', dests);
    };

    // ── Highlights ────────────────────────────────────────────────────────────

    const addHighlight = (dIdx: number, highlight: string) => {
        if (!highlight.trim()) return;
        const dests = [...(values.destinations || [])];
        dests[dIdx].highlights = [...(dests[dIdx].highlights || []), highlight.trim()];
        setFieldValue('destinations', dests);
        setHighlightInputs((prev) => ({ ...prev, [dIdx]: '' }));
    };

    const removeHighlight = (dIdx: number, hIdx: number) => {
        const dests = [...(values.destinations || [])];
        dests[dIdx].highlights?.splice(hIdx, 1);
        setFieldValue('destinations', dests);
    };

    // ── Map Picker ────────────────────────────────────────────────────────────

    const openMapForDest = (dIdx: number) =>
        setMapPickerState({ isOpen: true, type: 'destination', destinationIndex: dIdx });

    const openMapForAttraction = (dIdx: number, aIdx: number) =>
        setMapPickerState({ isOpen: true, type: 'attraction', destinationIndex: dIdx, attractionIndex: aIdx });

    const handleMapSelect = (lat: number, lng: number) => {
        const { type, destinationIndex: dIdx, attractionIndex: aIdx } = mapPickerState;
        if (type === 'destination' && dIdx !== undefined) {
            updateDestinationField(dIdx, 'coordinates', { lat, lng });
        } else if (type === 'attraction' && dIdx !== undefined && aIdx !== undefined) {
            updateAttractionField(dIdx, aIdx, 'coordinates', { lat, lng });
        }
        setMapPickerState({ isOpen: false, type: 'destination' });
    };

    const getInitialPosition = (): [number, number] | undefined => {
        const { type, destinationIndex: dIdx, attractionIndex: aIdx } = mapPickerState;
        if (type === 'destination' && dIdx !== undefined) {
            const c = values.destinations?.[dIdx]?.coordinates;
            if (c?.lat && c?.lng) return [c.lat, c.lng];
        } else if (type === 'attraction' && dIdx !== undefined && aIdx !== undefined) {
            const c = values.destinations?.[dIdx]?.attractions?.[aIdx]?.coordinates;
            if (c?.lat && c?.lng) return [c.lat, c.lng];
        }
        return undefined;
    };

    // ── Toggle helpers ────────────────────────────────────────────────────────

    const toggle = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        key: string
    ) => setter((prev) => (prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]));

    const isDestExpanded = (i: number) => expandedDestinations.includes(`d-${i}`);
    const isAttrExpanded = (dI: number, aI: number) => expandedAttractions.includes(`a-${dI}-${aI}`);
    const isActExpanded = (dI: number, acI: number) => expandedActivities.includes(`ac-${dI}-${acI}`);

    const destinations = values.destinations ?? [];

    return (
        <div className="space-y-5">

            {/* ── Destinations List ── */}
            <AnimatePresence mode="popLayout">
                {destinations.map((destination, dIdx) => (
                    <motion.div
                        key={dIdx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                    >
                        {/* ── Destination Card ── */}
                        <div
                            className={[
                                NEU.surface,
                                NEU.raised,
                                NEU.radius,
                                NEU.border,
                                'overflow-hidden transition-all duration-300',
                            ].join(' ')}
                        >
                            {/* Card Header */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => toggle(setExpandedDestinations, `d-${dIdx}`)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && toggle(setExpandedDestinations, `d-${dIdx}`)
                                }
                                className={[
                                    'flex items-center gap-3 px-5 py-4 cursor-pointer',
                                    'hover:bg-[#dedad8] dark:hover:bg-[#141312]',
                                    'transition-colors duration-150',
                                    isDestExpanded(dIdx) ? NEU.divider : '',
                                ].join(' ')}
                            >
                                {/* Icon */}
                                <div
                                    className={[
                                        'p-2.5 flex-shrink-0',
                                        NEU.radiusMd,
                                        NEU.iconBg.teal,
                                        NEU.raisedSm,
                                    ].join(' ')}
                                >
                                    <MapPinned className={`w-4 h-4 ${NEU.text.teal}`} />
                                </div>

                                {/* Title + preview */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold ${NEU.text.primary} ${NEU.font}`}>
                                        Destination {dIdx + 1}
                                    </h4>
                                    {destination.description && (
                                        <p className={`text-xs truncate mt-0.5 ${NEU.text.secondary}`}>
                                            {destination.description}
                                        </p>
                                    )}
                                </div>

                                {/* Meta badges */}
                                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                                    {(destination.highlights?.length ?? 0) > 0 && (
                                        <MetaBadge
                                            count={destination.highlights!.length}
                                            icon={<Sparkles className="w-2.5 h-2.5" />}
                                            variant="amber"
                                        />
                                    )}
                                    {(destination.attractions?.length ?? 0) > 0 && (
                                        <MetaBadge
                                            count={destination.attractions!.length}
                                            icon={<Compass className="w-2.5 h-2.5" />}
                                            variant="purple"
                                        />
                                    )}
                                    {(destination.activities?.length ?? 0) > 0 && (
                                        <MetaBadge
                                            count={destination.activities!.length}
                                            icon={<Activity className="w-2.5 h-2.5" />}
                                            variant="green"
                                        />
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
                                    <NeuIconBtn
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeDestination(dIdx);
                                        }}
                                        danger
                                        label="Remove destination"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </NeuIconBtn>
                                    <div
                                        className={[
                                            'w-8 h-8 flex items-center justify-center',
                                            NEU.radiusSm,
                                            NEU.surface,
                                            NEU.raisedXs,
                                            NEU.border,
                                        ].join(' ')}
                                    >
                                        <ChevronDown
                                            className={`w-4 h-4 ${NEU.text.secondary} transition-transform duration-300 ${isDestExpanded(dIdx) ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Expanded Body ── */}
                            <AnimatePresence>
                                {isDestExpanded(dIdx) && (
                                    <motion.div
                                        variants={expandVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className={NEU.surfaceDeep}
                                    >
                                        <div className="px-5 py-6 space-y-6">

                                            {/* — Description — */}
                                            <SectionDivider label="Overview" />
                                            <div>
                                                <NeuLabel htmlFor={`dest-${dIdx}-desc`}>
                                                    Description
                                                </NeuLabel>
                                                <textarea
                                                    id={`dest-${dIdx}-desc`}
                                                    rows={3}
                                                    placeholder="Describe this destination..."
                                                    value={destination.description || ''}
                                                    onChange={(e) =>
                                                        updateDestinationField(dIdx, 'description', e.target.value)
                                                    }
                                                    className={`${inputCls} resize-none leading-relaxed`}
                                                />
                                            </div>

                                            {/* — Highlights — */}
                                            <SectionDivider label="Highlights" />
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a highlight and press Enter..."
                                                        value={highlightInputs[dIdx] || ''}
                                                        onChange={(e) =>
                                                            setHighlightInputs((prev) => ({
                                                                ...prev,
                                                                [dIdx]: e.target.value,
                                                            }))
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addHighlight(dIdx, highlightInputs[dIdx] || '');
                                                            }
                                                        }}
                                                        className={`${inputCls} flex-1`}
                                                    />
                                                    <NeuAddBtn
                                                        onClick={() =>
                                                            addHighlight(dIdx, highlightInputs[dIdx] || '')
                                                        }
                                                        accent="teal"
                                                    >
                                                        Add
                                                    </NeuAddBtn>
                                                </div>
                                                {(destination.highlights?.length ?? 0) > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        <AnimatePresence mode="popLayout">
                                                            {destination.highlights!.map((h, hIdx) => (
                                                                <HighlightChip
                                                                    key={hIdx}
                                                                    label={h}
                                                                    onRemove={() => removeHighlight(dIdx, hIdx)}
                                                                />
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </div>

                                            {/* — Coordinates — */}
                                            <SectionDivider label="Location" />
                                            <div className="space-y-2">
                                                <NeuLabel
                                                    icon={<MapPin className="w-3.5 h-3.5" />}
                                                    iconColor={NEU.text.blue}
                                                >
                                                    Destination Coordinates
                                                </NeuLabel>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <NeuAddBtn
                                                        onClick={() => openMapForDest(dIdx)}
                                                        accent="teal"
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        {destination.coordinates?.lat && destination.coordinates?.lng
                                                            ? 'Change Location'
                                                            : 'Pick Location'}
                                                    </NeuAddBtn>
                                                    {destination.coordinates?.lat && destination.coordinates?.lng && (
                                                        <CoordBadge
                                                            lat={destination.coordinates.lat}
                                                            lng={destination.coordinates.lng}
                                                        />
                                                    )}
                                                </div>
                                                <p className={`text-xs ${NEU.text.muted} ${NEU.font}`}>
                                                    Coordinates must be within Bangladesh.
                                                </p>
                                            </div>

                                            {/* ── Attractions ── */}
                                            <SectionDivider label="Attractions" />
                                            <div className="space-y-3">
                                                <AnimatePresence mode="popLayout">
                                                    {(destination.attractions || []).map((attraction, aIdx) => (
                                                        <motion.div
                                                            key={aIdx}
                                                            variants={cardVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            layout
                                                        >
                                                            <NestedCard
                                                                icon={<Compass className="w-3.5 h-3.5" />}
                                                                iconBg={NEU.iconBg.purple}
                                                                iconColor={NEU.text.purple}
                                                                title={attraction.title || `Attraction ${aIdx + 1}`}
                                                                isExpanded={isAttrExpanded(dIdx, aIdx)}
                                                                onToggle={() =>
                                                                    toggle(
                                                                        setExpandedAttractions,
                                                                        `a-${dIdx}-${aIdx}`
                                                                    )
                                                                }
                                                                onRemove={(e) => {
                                                                    e.stopPropagation();
                                                                    removeAttraction(dIdx, aIdx);
                                                                }}
                                                                accentHover="purple"
                                                            >
                                                                {/* Attraction Fields */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <NeuLabel htmlFor={`attr-title-${dIdx}-${aIdx}`} required>
                                                                            Title
                                                                        </NeuLabel>
                                                                        <input
                                                                            id={`attr-title-${dIdx}-${aIdx}`}
                                                                            type="text"
                                                                            value={attraction.title || ''}
                                                                            onChange={(e) =>
                                                                                updateAttractionField(dIdx, aIdx, 'title', e.target.value)
                                                                            }
                                                                            className={inputCls}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <NeuLabel htmlFor={`attr-bestfor-${dIdx}-${aIdx}`}>
                                                                            Best For
                                                                        </NeuLabel>
                                                                        <input
                                                                            id={`attr-bestfor-${dIdx}-${aIdx}`}
                                                                            type="text"
                                                                            placeholder="Families, Photographers..."
                                                                            value={attraction.bestFor || ''}
                                                                            onChange={(e) =>
                                                                                updateAttractionField(dIdx, aIdx, 'bestFor', e.target.value)
                                                                            }
                                                                            className={inputCls}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <NeuLabel htmlFor={`attr-desc-${dIdx}-${aIdx}`}>
                                                                        Description
                                                                    </NeuLabel>
                                                                    <textarea
                                                                        id={`attr-desc-${dIdx}-${aIdx}`}
                                                                        rows={2}
                                                                        value={attraction.description || ''}
                                                                        onChange={(e) =>
                                                                            updateAttractionField(dIdx, aIdx, 'description', e.target.value)
                                                                        }
                                                                        className={`${inputCls} resize-none`}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <NeuLabel htmlFor={`attr-tip-${dIdx}-${aIdx}`}
                                                                        icon={<Sparkles className="w-3 h-3" />}
                                                                        iconColor={NEU.text.amber}
                                                                    >
                                                                        Insider Tip
                                                                    </NeuLabel>
                                                                    <input
                                                                        id={`attr-tip-${dIdx}-${aIdx}`}
                                                                        type="text"
                                                                        placeholder="Local secret or tip..."
                                                                        value={attraction.insiderTip || ''}
                                                                        onChange={(e) =>
                                                                            updateAttractionField(dIdx, aIdx, 'insiderTip', e.target.value)
                                                                        }
                                                                        className={inputCls}
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <NeuLabel htmlFor={`attr-addr-${dIdx}-${aIdx}`}>
                                                                            Address
                                                                        </NeuLabel>
                                                                        <input
                                                                            id={`attr-addr-${dIdx}-${aIdx}`}
                                                                            type="text"
                                                                            value={attraction.address || ''}
                                                                            onChange={(e) =>
                                                                                updateAttractionField(dIdx, aIdx, 'address', e.target.value)
                                                                            }
                                                                            className={inputCls}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <NeuLabel
                                                                            htmlFor={`attr-hours-${dIdx}-${aIdx}`}
                                                                            icon={<Clock className="w-3 h-3" />}
                                                                        >
                                                                            Opening Hours
                                                                        </NeuLabel>
                                                                        <input
                                                                            id={`attr-hours-${dIdx}-${aIdx}`}
                                                                            type="text"
                                                                            placeholder="9:00 AM – 5:00 PM"
                                                                            value={attraction.openingHours || ''}
                                                                            onChange={(e) =>
                                                                                updateAttractionField(dIdx, aIdx, 'openingHours', e.target.value)
                                                                            }
                                                                            className={inputCls}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Attraction coordinates */}
                                                                <div className="space-y-2">
                                                                    <NeuLabel
                                                                        icon={<MapPin className="w-3 h-3" />}
                                                                        iconColor={NEU.text.blue}
                                                                    >
                                                                        Coordinates
                                                                    </NeuLabel>
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <NeuAddBtn
                                                                            onClick={() => openMapForAttraction(dIdx, aIdx)}
                                                                            accent="purple"
                                                                        >
                                                                            <MapPin className="w-3 h-3" />
                                                                            {attraction.coordinates?.lat && attraction.coordinates?.lng
                                                                                ? 'Change'
                                                                                : 'Pick'}
                                                                        </NeuAddBtn>
                                                                        {attraction.coordinates?.lat && attraction.coordinates?.lng && (
                                                                            <CoordBadge
                                                                                lat={attraction.coordinates.lat}
                                                                                lng={attraction.coordinates.lng}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </NestedCard>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>

                                                <NeuAddBtn
                                                    onClick={() => addAttraction(dIdx)}
                                                    accent="purple"
                                                >
                                                    Add Attraction
                                                </NeuAddBtn>
                                            </div>

                                            {/* ── Activities ── */}
                                            <SectionDivider label="Activities" />
                                            <div className="space-y-3">
                                                <AnimatePresence mode="popLayout">
                                                    {(destination.activities || []).map((activity, actIdx) => {
                                                        const priceKey = `${dIdx}-${actIdx}`;
                                                        return (
                                                            <motion.div
                                                                key={actIdx}
                                                                variants={cardVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                                layout
                                                            >
                                                                <NestedCard
                                                                    icon={<Activity className="w-3.5 h-3.5" />}
                                                                    iconBg={NEU.iconBg.green}
                                                                    iconColor={NEU.text.green}
                                                                    title={activity.title || `Activity ${actIdx + 1}`}
                                                                    isExpanded={isActExpanded(dIdx, actIdx)}
                                                                    onToggle={() =>
                                                                        toggle(
                                                                            setExpandedActivities,
                                                                            `ac-${dIdx}-${actIdx}`
                                                                        )
                                                                    }
                                                                    onRemove={(e) => {
                                                                        e.stopPropagation();
                                                                        removeActivity(dIdx, actIdx);
                                                                    }}
                                                                    accentHover="green"
                                                                >
                                                                    {/* Activity fields */}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <NeuLabel
                                                                                htmlFor={`act-title-${dIdx}-${actIdx}`}
                                                                                required
                                                                            >
                                                                                Title
                                                                            </NeuLabel>
                                                                            <input
                                                                                id={`act-title-${dIdx}-${actIdx}`}
                                                                                type="text"
                                                                                value={activity.title || ''}
                                                                                onChange={(e) =>
                                                                                    updateActivityField(dIdx, actIdx, 'title', e.target.value)
                                                                                }
                                                                                className={inputCls}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <NeuLabel htmlFor={`act-provider-${dIdx}-${actIdx}`}>
                                                                                Provider
                                                                            </NeuLabel>
                                                                            <input
                                                                                id={`act-provider-${dIdx}-${actIdx}`}
                                                                                type="text"
                                                                                value={activity.provider || ''}
                                                                                onChange={(e) =>
                                                                                    updateActivityField(dIdx, actIdx, 'provider', e.target.value)
                                                                                }
                                                                                className={inputCls}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <NeuLabel
                                                                            htmlFor={`act-url-${dIdx}-${actIdx}`}
                                                                            icon={<Link className="w-3 h-3" />}
                                                                            iconColor={NEU.text.blue}
                                                                        >
                                                                            URL
                                                                        </NeuLabel>
                                                                        <input
                                                                            id={`act-url-${dIdx}-${actIdx}`}
                                                                            type="text"
                                                                            placeholder="https://..."
                                                                            value={activity.url || ''}
                                                                            onChange={(e) =>
                                                                                updateActivityField(dIdx, actIdx, 'url', e.target.value)
                                                                            }
                                                                            className={inputCls}
                                                                        />
                                                                    </div>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                        <div>
                                                                            <NeuLabel
                                                                                htmlFor={`act-dur-${dIdx}-${actIdx}`}
                                                                                icon={<Clock className="w-3 h-3" />}
                                                                                iconColor={NEU.text.amber}
                                                                            >
                                                                                Duration
                                                                            </NeuLabel>
                                                                            <input
                                                                                id={`act-dur-${dIdx}-${actIdx}`}
                                                                                type="text"
                                                                                placeholder="2 hours"
                                                                                value={activity.duration || ''}
                                                                                onChange={(e) =>
                                                                                    updateActivityField(dIdx, actIdx, 'duration', e.target.value)
                                                                                }
                                                                                className={inputCls}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <NeuLabel
                                                                                htmlFor={`act-price-${dIdx}-${actIdx}`}
                                                                                icon={<FaBangladeshiTakaSign className="w-3 h-3" />}
                                                                                iconColor={NEU.text.green}
                                                                            >
                                                                                Price
                                                                            </NeuLabel>
                                                                            <input
                                                                                id={`act-price-${dIdx}-${actIdx}`}
                                                                                type="text"
                                                                                inputMode="decimal"
                                                                                placeholder="0.00"
                                                                                value={
                                                                                    activityPriceInputs[priceKey] ??
                                                                                    activity.price?.amount?.toString() ??
                                                                                    ''
                                                                                }
                                                                                onChange={(e) => {
                                                                                    const v = e.target.value;
                                                                                    if (!/^\d*\.?\d*$/.test(v)) return;
                                                                                    setActivityPriceInputs((prev) => ({
                                                                                        ...prev,
                                                                                        [priceKey]: v,
                                                                                    }));
                                                                                }}
                                                                                onBlur={() => {
                                                                                    const raw = activityPriceInputs[priceKey];
                                                                                    if (raw === undefined || raw === '') {
                                                                                        updateActivityField(dIdx, actIdx, 'price', {
                                                                                            ...activity.price,
                                                                                            amount: '0',
                                                                                        });
                                                                                        return;
                                                                                    }
                                                                                    const num = Number(raw);
                                                                                    if (isNaN(num) || num < 0) return;
                                                                                    updateActivityField(dIdx, actIdx, 'price', {
                                                                                        ...activity.price,
                                                                                        amount: num.toFixed(2),
                                                                                    });
                                                                                }}
                                                                                className={inputCls}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <NeuLabel htmlFor={`act-currency-${dIdx}-${actIdx}`}>
                                                                                Currency
                                                                            </NeuLabel>
                                                                            <Select
                                                                                value={activity.price?.currency}
                                                                                onValueChange={(v) =>
                                                                                    updateActivityField(dIdx, actIdx, 'price', {
                                                                                        ...activity.price,
                                                                                        currency: v,
                                                                                    })
                                                                                }
                                                                            >
                                                                                <SelectTrigger
                                                                                    id={`act-currency-${dIdx}-${actIdx}`}
                                                                                    className={[
                                                                                        inputCls,
                                                                                        'flex items-center justify-between',
                                                                                        '[&>svg]:text-[#4a5568]',
                                                                                    ].join(' ')}
                                                                                >
                                                                                    <SelectValue placeholder="Currency" />
                                                                                </SelectTrigger>
                                                                                <SelectContent
                                                                                    className={[
                                                                                        NEU.surface,
                                                                                        NEU.raisedSm,
                                                                                        NEU.radiusMd,
                                                                                        NEU.border,
                                                                                        NEU.font,
                                                                                    ].join(' ')}
                                                                                >
                                                                                    {Object.entries(CURRENCY).map(([k, v]) => (
                                                                                        <SelectItem
                                                                                            key={k}
                                                                                            value={v}
                                                                                            className={`${NEU.text.primary} ${NEU.font} text-sm cursor-pointer`}
                                                                                        >
                                                                                            {v}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>
                                                                </NestedCard>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </AnimatePresence>

                                                <NeuAddBtn
                                                    onClick={() => addActivity(dIdx)}
                                                    accent="green"
                                                >
                                                    Add Activity
                                                </NeuAddBtn>
                                            </div>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* ── Add Destination CTA ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <NeuAddBtn onClick={addDestination} accent="teal" full dashed>
                    Add New Destination
                </NeuAddBtn>
            </motion.div>

            {/* ── Map Picker Dialog ── */}
            <MapPickerDialog
                open={mapPickerState.isOpen}
                onClose={() => setMapPickerState({ isOpen: false, type: 'destination' })}
                onSelect={handleMapSelect}
                initialPosition={getInitialPosition()}
            />
        </div>
    );
}