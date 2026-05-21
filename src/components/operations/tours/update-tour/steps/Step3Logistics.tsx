'use client';

import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  UpdateTourLogisticsDTO,
  PackingListItemDTO,
} from '@/types/tour/tour.types';
import { TRANSPORT_MODE, CURRENCY, TransportMode, Currency } from '@/constants/tour/tour.const';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { Step3LogisticsSchema } from '@/utils/validators/tour/add-tour.validator';
import { getSortedDistricts, getDisplayName } from '@/utils/helpers/conversions.tour';
import { ComboBox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle, Plus, Trash2, MapPin, Truck,
  Package, Users, Loader2, Check, X, ChevronDown,
} from 'lucide-react';

// ─── Neumorphism + Font Style Constants ───────────────────────────────────────
const neu = {
  // surfaces
  page: 'bg-[#E7E5E4]',
  card: 'bg-[#E7E5E4] rounded-2xl shadow-[8px_8px_18px_#c8c6c4,-8px_-8px_18px_#ffffff]',
  cardInner: 'bg-[#E7E5E4] rounded-xl shadow-[5px_5px_12px_#c8c6c4,-5px_-5px_12px_#ffffff] border border-[#d4d2d0]',
  inset: 'bg-[#E7E5E4] rounded-xl shadow-[inset_4px_4px_9px_#c8c6c4,inset_-4px_-4px_9px_#ffffff]',
  insetSm: 'bg-[#E7E5E4] rounded-lg  shadow-[inset_3px_3px_6px_#c8c6c4,inset_-3px_-3px_6px_#ffffff]',

  // interactive
  iconBox: (color: string) => `rounded-xl p-2.5 shadow-[4px_4px_8px_#c8c6c4,-4px_-4px_8px_#ffffff] flex items-center justify-center ${color}`,
  btn: 'inline-flex items-center gap-2 px-6 py-2.5 text-sm rounded-xl text-white bg-[#006666] shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#c8c6c4,-6px_-6px_14px_#ffffff] active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  btnSm: 'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg text-white bg-[#006666] shadow-[3px_3px_7px_#c8c6c4,-3px_-3px_7px_#ffffff] hover:shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.25)] transition-all duration-200',
  btnGhost: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-[#FF2157] border border-[#FF2157]/25 shadow-[2px_2px_5px_#c8c6c4,-2px_-2px_5px_#ffffff] hover:shadow-[3px_3px_7px_#c8c6c4,-3px_-3px_7px_#ffffff] hover:bg-[#FF2157]/5 transition-all duration-200',
  input: 'w-full bg-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#1E2938] placeholder:text-[#888780] border-0 outline-none shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] focus:ring-1 focus:ring-[#006666]/50 transition-all font-[var(--font-jetbrains-mono)]',
  textarea: 'w-full bg-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#1E2938] placeholder:text-[#888780] border-0 outline-none shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] focus:ring-1 focus:ring-[#006666]/50 transition-all resize-none font-[var(--font-jetbrains-mono)]',
  checkTile: (active: boolean) => `flex items-center gap-3 p-3.5 rounded-xl cursor-pointer select-none transition-all duration-200 ${active ? 'shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] ring-1 ring-[#006666]/40' : 'shadow-[3px_3px_7px_#c8c6c4,-3px_-3px_7px_#ffffff] hover:shadow-[4px_4px_9px_#c8c6c4,-4px_-4px_9px_#ffffff]'} bg-[#E7E5E4]`,
  checkbox: (active: boolean) => `w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-200 ${active ? 'bg-[#006666] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]' : 'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]'}`,
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-[var(--font-space-mono)] bg-[#E7E5E4] text-[#888780] shadow-[2px_2px_4px_#c8c6c4,-2px_-2px_4px_#ffffff] border border-[#d4d2d0]',
  divider: 'border-t border-[#d4d2d0] my-5',

  // alerts
  alertErr: 'flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E7E5E4] border border-[#FF2157]/30 shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff]',
  alertOk: 'flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E7E5E4] border border-[#00A63D]/30 shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff]',
  errText: 'text-xs text-[#FF2157] font-[var(--font-jetbrains-mono)] flex items-center gap-1 mt-1',

  // typography
  heading: 'font-[var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight',
  subheading: 'font-[var(--font-space-mono)] font-semibold text-[#1E2938]',
  label: 'font-[var(--font-space-mono)] font-medium text-sm text-[#1E2938]',
  muted: 'font-[var(--font-jetbrains-mono)] text-xs text-[#888780]',
  body: 'font-[var(--font-jetbrains-mono)] text-sm text-[#5a6270]',

  // section icon colors
  colorBlue: 'bg-[#E7E5E4] text-[#006666]',
  colorAmber: 'bg-[#E7E5E4] text-[#FE9900]',
  colorRed: 'bg-[#E7E5E4] text-[#FF2157]',
  colorGray: 'bg-[#E7E5E4] text-[#888780]',
};

// ─── Transport mode display labels ────────────────────────────────────────────
const TRANSPORT_LABELS: Record<TransportMode, string> = {
  [TRANSPORT_MODE.BUS]: 'Bus',
  [TRANSPORT_MODE.TRAIN]: 'Train',
  [TRANSPORT_MODE.DOMESTIC_FLIGHT]: 'Domestic Flight',
  [TRANSPORT_MODE.BOAT]: 'Boat',
  [TRANSPORT_MODE.PRIVATE_CAR]: 'Private Car',
  [TRANSPORT_MODE.RIDE_SHARE]: 'Ride Share',
};

const CURRENCY_LABELS: Record<Currency, string> = {
  [CURRENCY.BDT]: 'BDT (৳)',
  [CURRENCY.USD]: 'USD ($)',
  [CURRENCY.INR]: 'INR (₹)',
};

// ─── Accordion section ids ─────────────────────────────────────────────────────
type SectionId = 'location' | 'transport' | 'pickup' | 'meeting' | 'packing';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step3LogisticsProps {
  tourId: string;
  initialData: UpdateTourLogisticsDTO;
  onUpdateSuccess?: () => void;
}

type FormikTouched<T> = { [K in keyof T]?: T[K] extends object ? FormikTouched<T[K]> : boolean };
type FormikErrors<T> = { [K in keyof T]?: T[K] extends object ? FormikErrors<T[K]> : string };

// ─── Animation Variants ───────────────────────────────────────────────────────
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const alertVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.2 } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Step3Logistics({ tourId, initialData, onUpdateSuccess }: Step3LogisticsProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<SectionId[]>(['location', 'transport', 'pickup', 'meeting', 'packing']);

  const toggleSection = (id: SectionId) =>
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const isSectionOpen = (id: SectionId) => openSections.includes(id);

  // District combobox options
  const districtOptions = useMemo(() => {
    return getSortedDistricts().map(d => ({ label: getDisplayName(d), value: d }));
  }, []);

  // ── Nested form helpers ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNestedValue = <T extends object>(obj: T | undefined, path: string): any => {
    if (!obj) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return path.split('.').reduce((cur: any, key) => (cur && key in cur ? cur[key] : undefined), obj);
  };

  const mutation = useMutation({
    mutationFn: (data: UpdateTourLogisticsDTO) => tourUpdateService.updateLogistics(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Logistics updated successfully');
      onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Failed to update logistics', { description: error.message || 'Please try again' });
    },
  });

  const formik = useFormik<UpdateTourLogisticsDTO>({
    initialValues: {
      mainLocation: initialData.mainLocation,
      transportModes: initialData.transportModes || [],
      pickupOptions: initialData.pickupOptions || [],
      meetingPoint: initialData.meetingPoint || '',
      packingList: initialData.packingList || [],
    },
    validationSchema: Step3LogisticsSchema,
    onSubmit: async (values, { setSubmitting: setFormikSubmitting }) => {
      setIsSubmitting(true);
      setFormikSubmitting(true);
      try {
        const cleanedValues: UpdateTourLogisticsDTO = {
          mainLocation: values.mainLocation,
          transportModes: values.transportModes?.length ? values.transportModes : undefined,
          meetingPoint: values.meetingPoint || undefined,
        };

        const cleanedPickup = (values.pickupOptions ?? [])
          .filter(o => o.city?.trim())
          .map(o => ({ city: o.city!.trim(), price: o.price || 0, currency: o.currency || CURRENCY.BDT }));
        if (cleanedPickup.length) cleanedValues.pickupOptions = cleanedPickup;

        const cleanedPacking = (values.packingList ?? [])
          .filter(i => i.item?.trim())
          .map(i => ({ item: i.item.trim(), required: i.required ?? true, notes: i.notes?.trim() || undefined }));
        if (cleanedPacking.length) cleanedValues.packingList = cleanedPacking;

        await mutation.mutateAsync(cleanedValues);
      } finally {
        setIsSubmitting(false);
        setFormikSubmitting(false);
      }
    },
  });

  // ── Field helpers ──────────────────────────────────────────────────────────
  const isNestedTouched = (path: string) => Boolean(getNestedValue<FormikTouched<UpdateTourLogisticsDTO>>(formik.touched, path));
  const getNestedError = (path: string): string | undefined => {
    const e = getNestedValue<FormikErrors<UpdateTourLogisticsDTO>>(formik.errors, path);
    return e !== undefined ? String(e) : undefined;
  };
  const getFieldError = <K extends keyof UpdateTourLogisticsDTO>(field: K): string | undefined => {
    const t = formik.touched[field], e = formik.errors[field];
    return t && e ? String(e) : undefined;
  };

  // ── Transport ──────────────────────────────────────────────────────────────
  const toggleTransport = (mode: TransportMode) => {
    const cur = formik.values.transportModes || [];
    formik.setFieldValue('transportModes', cur.includes(mode) ? cur.filter(m => m !== mode) : [...cur, mode]);
    formik.setFieldTouched('transportModes', true, false);
  };

  // ── Pickup ─────────────────────────────────────────────────────────────────
  const addPickup = () => formik.setFieldValue('pickupOptions', [...(formik.values.pickupOptions || []), { city: '', price: 0, currency: CURRENCY.BDT }]);
  const removePickup = (i: number) => { const a = [...(formik.values.pickupOptions || [])]; a.splice(i, 1); formik.setFieldValue('pickupOptions', a); };
  const updatePickup = (i: number, field: string, val: unknown) => {
    const a = [...(formik.values.pickupOptions || [])];
    a[i] = { ...a[i], [field]: val };
    formik.setFieldValue('pickupOptions', a);
  };

  // ── Packing ────────────────────────────────────────────────────────────────
  const addPacking = () => formik.setFieldValue('packingList', [...(formik.values.packingList || []), { item: '', required: true, notes: '' }]);
  const removePacking = (i: number) => { const a = [...(formik.values.packingList || [])]; a.splice(i, 1); formik.setFieldValue('packingList', a); };
  const updatePacking = (i: number, field: keyof PackingListItemDTO, val: unknown) => {
    const a = [...(formik.values.packingList || [])];
    a[i] = { ...a[i], [field]: val };
    formik.setFieldValue('packingList', a);
  };

  // ── Handle nested blur ─────────────────────────────────────────────────────
  const handleNestedBlur = (path: string) => {
    const touched = { ...formik.touched };
    const parts = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cur: any = touched;
    for (let i = 0; i < parts.length - 1; i++) { if (!cur[parts[i]]) cur[parts[i]] = {}; cur = cur[parts[i]]; }
    cur[parts[parts.length - 1]] = true;
    formik.setTouched(touched);
  };

  // ── Accordion section helper ───────────────────────────────────────────────
  const SectionHeader = ({
    id, icon: Icon, iconColor, title, description, action,
  }: {
    id: SectionId;
    icon: React.ElementType;
    iconColor: string;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#d4d2d0]">
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <div className={neu.iconBox(iconColor)}><Icon size={18} /></div>
        <div className="flex-1 min-w-0">
          <p className={`${neu.subheading} text-base`}>{title}</p>
          <p className={`${neu.body} text-xs mt-0.5`}>{description}</p>
        </div>
        <motion.div
          animate={{ rotate: isSectionOpen(id) ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mr-2 text-[#888780]"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      {action}
    </div>
  );

  const errorCount = Object.keys(formik.errors).length;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full">
      <div className={`${neu.card} p-1 w-full`}>

        {/* ── Card Header ── */}
        <div className="px-6 md:px-8 pt-6 md:pt-7 pb-5 border-b border-[#d4d2d0]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={neu.iconBox(neu.colorBlue)}>
                <Truck size={22} className="text-[#006666]" />
              </div>
              <div>
                <h2 className={`${neu.heading} text-xl`}>Tour Logistics</h2>
                <p className={`${neu.body} text-xs mt-0.5`}>Transportation, pickup options, and packing requirements</p>
              </div>
            </div>
            <span className={neu.badge}>Step 3 of 5</span>
          </div>
        </div>

        <div className="px-4 md:px-6 py-6 md:py-7">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-5">

              {/* ════════════════════════════════════════════════════════════
                  SECTION 1 — Main Location
              ══════════════════════════════════════════════════════════════ */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className={neu.cardInner}>
                <SectionHeader id="location" icon={MapPin} iconColor={neu.colorBlue} title="Main Location & Address" description="Primary location details for the tour" />

                <AnimatePresence>
                  {isSectionOpen('location') && (
                    <motion.div
                      key="location-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { name: 'mainLocation.address.line1', label: 'Address Line 1', placeholder: 'Street address, P.O. Box' },
                            { name: 'mainLocation.address.line2', label: 'Address Line 2', placeholder: 'Apartment, suite, unit, floor' },
                            { name: 'mainLocation.address.city', label: 'City / Town', placeholder: 'City or town name' },
                            { name: 'mainLocation.address.region', label: 'Region / Division', placeholder: 'Region or division' },
                            { name: 'mainLocation.address.postalCode', label: 'Postal Code', placeholder: 'Postal code' },
                          ].map(({ name, label, placeholder }) => (
                            <div key={name} className="flex flex-col gap-1.5">
                              <label className={neu.label}>{label}</label>
                              <input
                                name={name}
                                placeholder={placeholder}
                                value={getNestedValue(formik.values, name) || ''}
                                onChange={formik.handleChange}
                                onBlur={() => handleNestedBlur(name)}
                                className={neu.input}
                              />
                              {isNestedTouched(name) && getNestedError(name) && (
                                <p className={neu.errText}><AlertCircle size={11} />{getNestedError(name)}</p>
                              )}
                            </div>
                          ))}

                          {/* District combobox */}
                          <div className="flex flex-col gap-1.5">
                            <label className={neu.label}>District</label>
                            <ComboBox
                              options={districtOptions}
                              value={formik.values.mainLocation?.address?.district || ''}
                              placeholder="Select district"
                              onChange={(val) => { formik.setFieldValue('mainLocation.address.district', val); handleNestedBlur('mainLocation.address.district'); }}
                            />
                            {isNestedTouched('mainLocation.address.district') && getNestedError('mainLocation.address.district') && (
                              <p className={neu.errText}><AlertCircle size={11} />{getNestedError('mainLocation.address.district')}</p>
                            )}
                          </div>
                        </div>

                        {/* Coordinates */}
                        <div className={neu.divider} />
                        <div className={`${neu.inset} p-4`}>
                          <div className="flex items-center gap-2 mb-4">
                            <p className={`${neu.subheading} text-sm`}>Coordinates</p>
                            <span className={neu.badge}>Optional</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className={neu.label}>Latitude</label>
                              <input
                                name="mainLocation.coordinates.lat"
                                type="number"
                                step="0.000001"
                                placeholder="e.g., 23.8103"
                                value={formik.values.mainLocation?.coordinates?.lat || ''}
                                onChange={formik.handleChange}
                                onBlur={() => handleNestedBlur('mainLocation.coordinates.lat')}
                                className={neu.input}
                              />
                              <p className={neu.muted}>Must be within Bangladesh (20.34 – 26.63)</p>
                              {isNestedTouched('mainLocation.coordinates.lat') && getNestedError('mainLocation.coordinates.lat') && (
                                <p className={neu.errText}><AlertCircle size={11} />{getNestedError('mainLocation.coordinates.lat')}</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className={neu.label}>Longitude</label>
                              <input
                                name="mainLocation.coordinates.lng"
                                type="number"
                                step="0.000001"
                                placeholder="e.g., 90.4125"
                                value={formik.values.mainLocation?.coordinates?.lng || ''}
                                onChange={formik.handleChange}
                                onBlur={() => handleNestedBlur('mainLocation.coordinates.lng')}
                                className={neu.input}
                              />
                              <p className={neu.muted}>Must be within Bangladesh (88.01 – 92.67)</p>
                              {isNestedTouched('mainLocation.coordinates.lng') && getNestedError('mainLocation.coordinates.lng') && (
                                <p className={neu.errText}><AlertCircle size={11} />{getNestedError('mainLocation.coordinates.lng')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ════════════════════════════════════════════════════════════
                  SECTION 2 — Transport Modes
              ══════════════════════════════════════════════════════════════ */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className={neu.cardInner}>
                <SectionHeader id="transport" icon={Truck} iconColor={neu.colorBlue} title="Transport Modes" description="Select available transportation options" />

                <AnimatePresence>
                  {isSectionOpen('transport') && (
                    <motion.div
                      key="transport-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 py-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.values(TRANSPORT_MODE).map((mode) => {
                            const active = formik.values.transportModes?.includes(mode) || false;
                            return (
                              <div
                                key={mode}
                                className={neu.checkTile(active)}
                                onClick={() => toggleTransport(mode)}
                              >
                                <div className={neu.checkbox(active)}>
                                  {active && <Check size={12} className="text-white" />}
                                </div>
                                <span className={`${neu.label} text-xs flex-1`}>{TRANSPORT_LABELS[mode]}</span>
                              </div>
                            );
                          })}
                        </div>
                        {formik.touched.transportModes && getFieldError('transportModes') && (
                          <div className={`${neu.alertErr} mt-4`}>
                            <AlertCircle size={15} className="text-[#FF2157] shrink-0" />
                            <span className="text-[#FF2157] text-xs font-[var(--font-jetbrains-mono)]">{getFieldError('transportModes')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ════════════════════════════════════════════════════════════
                  SECTION 3 — Pickup Options
              ══════════════════════════════════════════════════════════════ */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className={neu.cardInner}>
                <SectionHeader
                  id="pickup"
                  icon={Users}
                  iconColor={neu.colorAmber}
                  title="Pickup Options"
                  description="Configure pickup locations and pricing"
                  action={
                    <button type="button" onClick={addPickup} className={`${neu.btnSm} ml-3`}>
                      <Plus size={13} /> Add Option
                    </button>
                  }
                />

                <AnimatePresence>
                  {isSectionOpen('pickup') && (
                    <motion.div
                      key="pickup-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 py-5">
                        {(formik.values.pickupOptions ?? []).length === 0 ? (
                          /* ── Empty state ── */
                          <div className={`${neu.inset} flex flex-col items-center justify-center py-10 gap-4`}>
                            <div className={neu.iconBox(neu.colorAmber)}><Users size={24} className="text-[#FE9900]" /></div>
                            <div className="text-center">
                              <p className={`${neu.subheading} text-sm`}>No pickup options added</p>
                              <p className={`${neu.body} text-xs mt-1`}>Add pickup locations and prices for additional convenience</p>
                            </div>
                            <button type="button" onClick={addPickup} className={neu.btnSm}>
                              <Plus size={13} /> Add First Pickup Option
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <AnimatePresence>
                              {(formik.values.pickupOptions ?? []).map((option, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  className={neu.insetSm}
                                >
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="flex flex-col gap-1.5">
                                        <label className={`${neu.label} flex items-center gap-1`}>
                                          City <span className="text-[#FF2157]">*</span>
                                        </label>
                                        <input
                                          placeholder="e.g., Dhaka, Chittagong"
                                          value={option.city || ''}
                                          onChange={(e) => updatePickup(index, 'city', e.target.value)}
                                          onBlur={() => formik.setFieldTouched(`pickupOptions[${index}].city`, true)}
                                          className={neu.input}
                                        />
                                        {isNestedTouched(`pickupOptions[${index}].city`) && getNestedError(`pickupOptions[${index}].city`) && (
                                          <p className={neu.errText}><AlertCircle size={11} />{getNestedError(`pickupOptions[${index}].city`)}</p>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-1.5">
                                        <label className={neu.label}>Price</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={option.price || ''}
                                          onChange={(e) => updatePickup(index, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                          onBlur={() => formik.setFieldTouched(`pickupOptions[${index}].price`, true)}
                                          className={neu.input}
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1.5">
                                        <label className={`${neu.label} flex items-center gap-1`}>
                                          Currency <span className="text-[#FF2157]">*</span>
                                        </label>
                                        {/* Shadcn Select retains its functionality; outer wrapper styled */}
                                        <div className={`${neu.insetSm} overflow-hidden`}>
                                          <Select
                                            value={option.currency || CURRENCY.BDT}
                                            onValueChange={(val: Currency) => updatePickup(index, 'currency', val)}
                                          >
                                            <SelectTrigger className="border-0 bg-transparent shadow-none h-10 font-[var(--font-jetbrains-mono)] text-sm text-[#1E2938] focus:ring-0">
                                              <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {Object.values(CURRENCY).map(c => (
                                                <SelectItem key={c} value={c} className="font-[var(--font-jetbrains-mono)] text-sm">
                                                  {CURRENCY_LABELS[c]}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-end mt-4 pt-3 border-t border-[#d4d2d0]">
                                      <button type="button" onClick={() => removePickup(index)} className={neu.btnGhost}>
                                        <Trash2 size={12} /> Remove
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                        {getFieldError('pickupOptions') && (
                          <div className={`${neu.alertErr} mt-4`}>
                            <AlertCircle size={15} className="text-[#FF2157] shrink-0" />
                            <span className="text-[#FF2157] text-xs font-[var(--font-jetbrains-mono)]">{getFieldError('pickupOptions')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ════════════════════════════════════════════════════════════
                  SECTION 4 — Meeting Point
              ══════════════════════════════════════════════════════════════ */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className={neu.cardInner}>
                <SectionHeader id="meeting" icon={MapPin} iconColor={neu.colorGray} title="Meeting Point" description="Specify where participants should gather" />

                <AnimatePresence>
                  {isSectionOpen('meeting') && (
                    <motion.div
                      key="meeting-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 py-5 flex flex-col gap-3">
                        <textarea
                          id="meetingPoint"
                          name="meetingPoint"
                          rows={4}
                          placeholder="e.g., Meet at the main entrance of Hotel Sonargaon at 8:00 AM. Look for our guide holding a blue flag with 'Tour Bangladesh' logo."
                          value={formik.values.meetingPoint}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={neu.textarea}
                        />
                        <div className="flex items-center justify-between">
                          <p className={`${neu.muted}`}>Provide clear instructions for where participants should meet</p>
                          <span className={neu.badge}>{(formik.values.meetingPoint?.length ?? 0)} / 500</span>
                        </div>
                        {formik.touched.meetingPoint && formik.errors.meetingPoint && (
                          <div className={neu.alertErr}>
                            <AlertCircle size={15} className="text-[#FF2157] shrink-0" />
                            <span className="text-[#FF2157] text-xs font-[var(--font-jetbrains-mono)]">{formik.errors.meetingPoint}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ════════════════════════════════════════════════════════════
                  SECTION 5 — Packing List
              ══════════════════════════════════════════════════════════════ */}
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className={neu.cardInner}>
                <SectionHeader
                  id="packing"
                  icon={Package}
                  iconColor={neu.colorGray}
                  title="Packing List"
                  description="Essential items travelers should bring"
                  action={
                    <button type="button" onClick={addPacking} className={`${neu.btnSm} ml-3`}>
                      <Plus size={13} /> Add Item
                    </button>
                  }
                />

                <AnimatePresence>
                  {isSectionOpen('packing') && (
                    <motion.div
                      key="packing-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 py-5">
                        {(formik.values.packingList ?? []).length === 0 ? (
                          /* ── Empty state ── */
                          <div className={`${neu.inset} flex flex-col items-center justify-center py-10 gap-4`}>
                            <div className={neu.iconBox(neu.colorGray)}><Package size={24} className="text-[#888780]" /></div>
                            <div className="text-center">
                              <p className={`${neu.subheading} text-sm`}>No packing items added</p>
                              <p className={`${neu.body} text-xs mt-1`}>Help travelers prepare by listing essential items to bring</p>
                            </div>
                            <button type="button" onClick={addPacking} className={neu.btnSm}>
                              <Plus size={13} /> Add First Item
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <AnimatePresence>
                              {(formik.values.packingList ?? []).map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  className={neu.insetSm}
                                >
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                      <div className="md:col-span-5 flex flex-col gap-1.5">
                                        <label className={`${neu.label} flex items-center gap-1`}>
                                          Item Name <span className="text-[#FF2157]">*</span>
                                        </label>
                                        <input
                                          placeholder="e.g., Passport, Hiking Boots, Water Bottle"
                                          value={item.item}
                                          onChange={(e) => updatePacking(index, 'item', e.target.value)}
                                          onBlur={() => formik.setFieldTouched(`packingList[${index}].item`, true)}
                                          className={neu.input}
                                        />
                                        {isNestedTouched(`packingList[${index}].item`) && getNestedError(`packingList[${index}].item`) && (
                                          <p className={neu.errText}><AlertCircle size={11} />{getNestedError(`packingList[${index}].item`)}</p>
                                        )}
                                      </div>
                                      <div className="md:col-span-5 flex flex-col gap-1.5">
                                        <label className={neu.label}>Notes (Optional)</label>
                                        <input
                                          placeholder="e.g., Waterproof, Size 10, At least 1 liter"
                                          value={item.notes || ''}
                                          onChange={(e) => updatePacking(index, 'notes', e.target.value)}
                                          className={neu.input}
                                        />
                                      </div>
                                      <div className="md:col-span-2 flex flex-col gap-1.5">
                                        <label className={neu.label}>Required</label>
                                        <div
                                          className="flex items-center gap-2 h-10 cursor-pointer select-none"
                                          onClick={() => updatePacking(index, 'required', item.required === false)}
                                        >
                                          <div className={neu.checkbox(item.required !== false)}>
                                            {item.required !== false && <Check size={12} className="text-white" />}
                                          </div>
                                          <span className={`${neu.label} text-xs`}>Required</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-end mt-4 pt-3 border-t border-[#d4d2d0]">
                                      <button type="button" onClick={() => removePacking(index)} className={neu.btnGhost}>
                                        <Trash2 size={12} /> Remove
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                        {getFieldError('packingList') && (
                          <div className={`${neu.alertErr} mt-4`}>
                            <AlertCircle size={15} className="text-[#FF2157] shrink-0" />
                            <span className="text-[#FF2157] text-xs font-[var(--font-jetbrains-mono)]">{getFieldError('packingList')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── Mutation Alerts ── */}
              <AnimatePresence mode="wait">
                {mutation.isError && (
                  <motion.div key="err" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                    <div className={neu.alertErr}>
                      <AlertCircle size={17} className="text-[#FF2157] shrink-0" />
                      <span className="text-[#FF2157] text-sm font-[var(--font-jetbrains-mono)] flex-1">
                        Failed to update logistics: {mutation.error?.message}
                      </span>
                    </div>
                  </motion.div>
                )}
                {mutation.isSuccess && (
                  <motion.div key="ok" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                    <div className={neu.alertOk}>
                      <Check size={17} className="text-[#00A63D] shrink-0" />
                      <span className="text-[#00A63D] text-sm font-[var(--font-jetbrains-mono)]">Logistics updated successfully</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Footer / Submit ── */}
              <div className={`${neu.inset} flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4`}>
                {/* Validation status */}
                <div>
                  {errorCount > 0 ? (
                    <div className={`${neu.alertErr} py-2 px-4`}>
                      <X size={14} className="text-[#FF2157] shrink-0" />
                      <span className="text-[#FF2157] text-xs font-[var(--font-space-mono)]">
                        {errorCount} validation issue{errorCount > 1 ? 's' : ''} found
                      </span>
                    </div>
                  ) : (
                    <div className={`${neu.alertOk} py-2 px-4`}>
                      <Check size={14} className="text-[#00A63D] shrink-0" />
                      <span className="text-[#00A63D] text-xs font-[var(--font-space-mono)]">All fields validated</span>
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                  whileHover={!isSubmitting && !mutation.isPending ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting && !mutation.isPending ? { scale: 0.97 } : {}}
                  className={`${neu.btn} min-w-[180px] justify-center font-[var(--font-space-mono)]`}
                >
                  {isSubmitting || mutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Updating...</span></>
                  ) : (
                    <><Check size={16} /><span>Update Logistics</span></>
                  )}
                </motion.button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}