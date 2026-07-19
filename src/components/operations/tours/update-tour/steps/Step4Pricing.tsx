// app/operations/tours/[tourId]/update-tour/components/steps/Step4Pricing.tsx
'use client';

import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';

import {
  UpdateTourPricingDTO, DiscountDTO, OperatingWindowDTO, DepartureDTO, PriceDTO,
} from '@/types/tour/tour.types';
import {
  CURRENCY, TOUR_DISCOUNT, TOUR_DISCOUNT_TYPE, PAYMENT_METHOD,
  Currency, TourDiscount, PaymentMethod, TourDiscountType,
} from '@/constants/tour/tour.const';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { Step4PricingSchema } from '@/utils/validators/tour/add-tour.validator';
import { MapPickerDialog } from '@/components/global/MapPickerDialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertCircle, Plus, Trash2, CalendarIcon, Percent, Plane, Users, MapPin,
  Loader2, Check, X, TrendingDown, CalendarDays, Timer, Wallet, Tag, Gift,
  Navigation, CheckCircle2, XCircle, Coins, ChevronDown,
} from 'lucide-react';

// ─── Neumorphism + Font Style Constants ───────────────────────────────────────
const neu = {
  // surfaces
  card: 'bg-[#E7E5E4] rounded-2xl ',
  cardInner: 'bg-[#E7E5E4] rounded-xl border border-[#d4d2d0]  hover: transition-all duration-300',
  inset: 'bg-[#E7E5E4] rounded-xl ',
  insetSm: 'bg-[#E7E5E4] rounded-lg  ',
  flat: 'bg-[#E7E5E4] rounded-xl border border-[#d4d2d0]',

  // interactive
  iconBox: (color: string) => `rounded-xl p-2.5  flex items-center justify-center ${color}`,
  btn: 'inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm rounded-xl text-white bg-[#006666]  hover: active: transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-[var(--font-space-mono)]',
  btnSm: 'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg text-white bg-[#006666]  hover: active: transition-all duration-200 font-[var(--font-space-mono)]',
  btnGhost: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-[#FF2157] border border-[#FF2157]/25  hover: hover:bg-[#FF2157]/5 transition-all duration-200 font-[var(--font-space-mono)]',
  btnOutline: 'inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-[#E7E5E4] text-[#1E2938] border border-[#d4d2d0]  hover: transition-all font-[var(--font-jetbrains-mono)]',
  input: 'w-full bg-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#1E2938] placeholder:text-[#888780] border-0 outline-none  focus:ring-1 focus:ring-[#006666]/50 transition-all font-[var(--font-jetbrains-mono)]',
  inputErr: 'ring-1 ring-[#FF2157]/50',
  checkTile: (a: boolean) => `flex items-center gap-2.5 p-3 rounded-xl cursor-pointer select-none transition-all duration-200 bg-[#E7E5E4] ${a ? ' ring-1 ring-[#006666]/35' : ' hover:'}`,
  checkbox: (a: boolean) => `w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-200 ${a ? 'bg-[#006666] ' : 'bg-[#E7E5E4] '}`,
  badge: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-[var(--font-space-mono)] bg-[#E7E5E4] text-[#888780]  border border-[#d4d2d0]',
  divider: 'border-t border-[#d4d2d0] my-5',

  // alerts
  alertErr: 'flex items-start gap-3 px-4 py-3 rounded-xl bg-[#E7E5E4] border border-[#FF2157]/30 ',
  alertOk: 'flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E7E5E4] border border-[#00A63D]/30 ',
  errText: 'text-xs text-[#FF2157] font-[var(--font-jetbrains-mono)] flex items-center gap-1 mt-1',

  // typography
  heading: 'font-[var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight',
  subheading: 'font-[var(--font-space-mono)] font-semibold text-[#1E2938]',
  label: 'font-[var(--font-space-mono)] font-medium text-sm text-[#1E2938]',
  muted: 'font-[var(--font-jetbrains-mono)] text-xs text-[#888780]',
  body: 'font-[var(--font-jetbrains-mono)] text-sm text-[#5a6270]',

  // section colors
  colorBlue: 'bg-[#E7E5E4] text-[#006666]',
  colorAmber: 'bg-[#E7E5E4] text-[#FE9900]',
  colorRed: 'bg-[#E7E5E4] text-[#FF2157]',
  colorGray: 'bg-[#E7E5E4] text-[#888780]',
};

// ─── Label maps ──────────────────────────────────────────────────────────────
const DISCOUNT_CAT_LABELS: Record<TourDiscount, string> = {
  [TOUR_DISCOUNT.FIXED]: 'Fixed',
  [TOUR_DISCOUNT.SEASONAL]: 'Seasonal',
  [TOUR_DISCOUNT.EARLY_BIRD]: 'Early Bird',
  [TOUR_DISCOUNT.GROUP]: 'Group',
  [TOUR_DISCOUNT.PROMO]: 'Promo Code',
};
const DISCOUNT_TYPE_LABELS: Record<TourDiscountType, string> = {
  [TOUR_DISCOUNT_TYPE.PERCENTAGE]: 'Percentage (%)',
  [TOUR_DISCOUNT_TYPE.FLAT_AMOUNT]: 'Flat Amount',
};
const CURRENCY_LABELS: Record<Currency, string> = {
  [CURRENCY.BDT]: 'BDT (৳)',
  [CURRENCY.USD]: 'USD ($)',
  [CURRENCY.INR]: 'INR (₹)',
};
const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  [PAYMENT_METHOD.BKASH]: 'bKash',
  [PAYMENT_METHOD.NAGAD]: 'Nagad',
  [PAYMENT_METHOD.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHOD.STRIPE]: 'Stripe',
  [PAYMENT_METHOD.CASH]: 'Cash',
  [PAYMENT_METHOD.BANK_TRANSFER]: 'Bank Transfer',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const normalizeDiscount = (d: Partial<DiscountDTO>): DiscountDTO => {
  const dVals = new Set<string>(Object.values(TOUR_DISCOUNT) as string[]);
  const tVals = new Set<string>(Object.values(TOUR_DISCOUNT_TYPE) as string[]);
  const raw = d.type as string | undefined;
  return {
    type: raw && tVals.has(raw) ? (raw as TourDiscountType) : TOUR_DISCOUNT_TYPE.PERCENTAGE,
    discount: raw && dVals.has(raw) ? (raw as TourDiscount) : (d.discount ?? TOUR_DISCOUNT.SEASONAL),
    value: Number(d.value ?? 0),
    code: d.code ?? '',
    validFrom: d.validFrom,
    validUntil: d.validUntil,
  };
};

const fmtDate = (s: string) => { try { return format(new Date(s), 'PPP'); } catch { return 'Invalid date'; } };

const fmtNum = (v: number | string): string => {
  if (v === '' || v === null || v === undefined) return '';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '';
  return Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.00$/, '');
};

const parseNum = (v: string): number => {
  if (!v?.trim()) return 0;
  const c = v.replace(/,/g, '').replace(/\s/g, '');
  const n = parseFloat(c.startsWith('.') ? '0' + c : c);
  return isNaN(n) ? 0 : n;
};

// ─── Accordion section id type ────────────────────────────────────────────────
type SectionId = 'basePrice' | 'duration' | 'discounts' | 'windows' | 'departure' | 'payments';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Step4PricingProps {
  tourId: string;
  initialData: UpdateTourPricingDTO;
  onUpdateSuccess?: () => void;
}

// ─── Animation variants ───────────────────────────────────────────────────────
const alertVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.2 } },
};
const itemIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Step4Pricing({ tourId, initialData, onUpdateSuccess }: Step4PricingProps) {
  const queryClient = useQueryClient();
  const [mapOpen, setMapOpen] = useState(false);
  const [basePriceInput, setBasePriceInput] = useState(initialData.basePrice?.amount?.toString() ?? '');
  const [openSections, setOpenSections] = useState<SectionId[]>(['basePrice', 'duration', 'discounts', 'windows', 'departure', 'payments']);

  const toggleSection = (id: SectionId) =>
    setOpenSections(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  const isOpen = (id: SectionId) => openSections.includes(id);

  const mutation = useMutation({
    mutationFn: (data: UpdateTourPricingDTO) => tourUpdateService.updatePricing(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Pricing & commerce updated successfully');
      onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Failed to update pricing', { description: error.message || 'Please try again' });
    },
  });

  const formik = useFormik<UpdateTourPricingDTO>({
    initialValues: {
      basePrice: initialData.basePrice ?? { amount: 0, currency: CURRENCY.BDT },
      discounts: initialData.discounts?.map(normalizeDiscount) ?? [],
      duration: initialData.duration ?? { days: 1, nights: 0 },
      operatingWindow: initialData.operatingWindow,
      departure: initialData.departure,
      paymentMethods: initialData.paymentMethods ?? [PAYMENT_METHOD.BANK_TRANSFER],
    },
    validationSchema: Step4PricingSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => mutation.mutate(values),
  });

  // ── Error helper ───────────────────────────────────────────────────────────
  const getErr = (path: string): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = formik.touched as any, e = formik.errors as any;
    const parts = path.split('.');
    let ct = t, ce = e;
    for (const p of parts) {
      ct = ct?.[p];
      ce = ce?.[p];
    }
    return ct && ce ? String(ce) : undefined;
  };

  // ── Base price ────────────────────────────────────────────────────────────
  const updateBasePrice = (field: keyof PriceDTO, val: unknown) => {
    formik.setFieldValue(`basePrice.${field}`, val);
    formik.setFieldTouched(`basePrice.${field}`, true);
  };

  // ── Discounts ─────────────────────────────────────────────────────────────
  const addDiscount = () => formik.setFieldValue('discounts', [
    ...(formik.values.discounts ?? []),
    { type: TOUR_DISCOUNT_TYPE.PERCENTAGE, discount: TOUR_DISCOUNT.SEASONAL, value: 0, code: '' } as DiscountDTO,
  ]);
  const removeDiscount = (i: number) => { const a = [...(formik.values.discounts ?? [])]; a.splice(i, 1); formik.setFieldValue('discounts', a); };
  const updateDiscount = (i: number, field: keyof DiscountDTO, val: unknown) => {
    const a = [...(formik.values.discounts ?? [])];
    a[i] = { ...a[i], [field]: field === 'value' && typeof val === 'string' ? parseNum(val) : val };
    formik.setFieldValue('discounts', a);
    formik.setFieldTouched(`discounts[${i}].${field}`, true);
  };

  // ── Operating Window ─────────────────────────────────────────────────────
  const updateOperatingWindow = (field: keyof OperatingWindowDTO, val: unknown) => {
    formik.setFieldValue(`operatingWindow.${field}`, val);
    formik.setFieldTouched(`operatingWindow.${field}`, true);
  };
  const clearOperatingWindow = () => {
    formik.setFieldValue('operatingWindow', undefined);
  };

  // ── Departure ────────────────────────────────────────────────────────────
  const handleMapSelect = (lat: number, lng: number) => {
    formik.setFieldValue('departure.meetingCoordinates', { lat, lng });
  };

  // ── Payment methods ───────────────────────────────────────────────────────
  const togglePayment = (m: PaymentMethod) => {
    const cur = formik.values.paymentMethods || [];
    formik.setFieldValue('paymentMethods', cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
  };

  const errorCount = Object.keys(formik.errors).length;

  // ── Section header helper component ───────────────────────────────────────
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
      <button type="button" onClick={() => toggleSection(id)} className="flex items-center gap-3 flex-1 text-left">
        <div className={neu.iconBox(iconColor)}><Icon size={18} /></div>
        <div className="flex-1 min-w-0">
          <p className={`${neu.subheading} text-base`}>{title}</p>
          <p className={`${neu.body} text-xs mt-0.5`}>{description}</p>
        </div>
        <motion.div animate={{ rotate: isOpen(id) ? 180 : 0 }} transition={{ duration: 0.2 }} className="mr-2 text-[#888780]">
          <ChevronDown size={18} />
        </motion.div>
      </button>
      {action}
    </div>
  );

  // ── Date picker button ─────────────────────────────────────────────────────
  const DateBtn = ({ value, placeholder }: { value?: string; placeholder?: string }) => (
    <div className={`${neu.btnOutline} w-full justify-start`}>
      <CalendarIcon size={15} className="text-[#888780] shrink-0" />
      <span className={value ? 'text-[#1E2938]' : 'text-[#888780]'}>
        {value ? fmtDate(value) : (placeholder ?? 'Select date')}
      </span>
    </div>
  );

  // ── Neu Select wrapper ─────────────────────────────────────────────────────
  const NeuSelect = ({ children, ...props }: React.ComponentProps<typeof Select>) => (
    <div className={`${neu.insetSm} overflow-hidden`}>
      <Select {...props}>
        <SelectTrigger className="border-0 bg-transparent shadow-none h-10 font-[var(--font-jetbrains-mono)] text-sm text-[#1E2938] focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full">
        <div className={`${neu.card} p-1 w-full`}>

          {/* ── Header ── */}
          <div className="px-6 md:px-8 pt-6 md:pt-7 pb-5 border-b border-[#d4d2d0]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={neu.iconBox(neu.colorBlue)}>
                  <FaBangladeshiTakaSign size={20} className="text-[#006666]" />
                </div>
                <div>
                  <h2 className={`${neu.heading} text-xl`}>Pricing & Commerce</h2>
                  <p className={`${neu.body} text-xs mt-0.5`}>Pricing, discounts, schedules, and payment methods</p>
                </div>
              </div>
              <span className={neu.badge}>Step 4 of 5</span>
            </div>
          </div>

          <div className="px-4 md:px-6 py-6 md:py-7">
            <form onSubmit={formik.handleSubmit}>
              <div className="flex flex-col gap-5">

                {/* ══════════════════════════════════════════════════════════
                    SECTION 1 — Base Price
                ══════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={neu.cardInner}>
                  <SectionHeader id="basePrice" icon={Coins} iconColor={neu.colorBlue} title="Base Price" description="Set the base pricing for your tour" />
                  <AnimatePresence>
                    {isOpen('basePrice') && (
                      <motion.div key="bp" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.27 }} className="overflow-hidden">
                        <div className="px-5 md:px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Amount */}
                          <div className="flex flex-col gap-1.5">
                            <label className={`${neu.label} flex items-center gap-1`}>Amount <span className="text-[#FF2157]">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={basePriceInput}
                                onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value)) setBasePriceInput(e.target.value); }}
                                onBlur={() => {
                                  const n = parseFloat(basePriceInput);
                                  if (isNaN(n)) { formik.setFieldError('basePrice.amount', 'Amount is required'); return; }
                                  if (n < 0) { formik.setFieldError('basePrice.amount', 'Amount cannot be negative'); return; }
                                  formik.setFieldValue('basePrice.amount', Number(n.toFixed(2)));
                                  formik.setFieldTouched('basePrice.amount', true);
                                }}
                                className={`${neu.input} pr-14 ${getErr('basePrice.amount') ? neu.inputErr : ''}`}
                              />
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <span className={`${neu.muted} text-xs`}>
                                  {CURRENCY_LABELS[(formik.values?.basePrice?.currency ?? CURRENCY.BDT)]?.split(' ')[0]}
                                </span>
                              </div>
                            </div>
                            {getErr('basePrice.amount')
                              ? <p className={neu.errText}><AlertCircle size={11} />{getErr('basePrice.amount')}</p>
                              : <p className={neu.muted}>e.g., 98987 or 98987.50</p>
                            }
                          </div>
                          {/* Currency */}
                          <div className="flex flex-col gap-1.5">
                            <label className={`${neu.label} flex items-center gap-1`}>Currency <span className="text-[#FF2157]">*</span></label>
                            <NeuSelect value={formik.values?.basePrice?.currency ?? CURRENCY.BDT} onValueChange={(v) => updateBasePrice('currency', v)}>
                              {Object.values(CURRENCY).map(c => <SelectItem key={c} value={c} className="font-[var(--font-jetbrains-mono)] text-sm">{CURRENCY_LABELS[c]}</SelectItem>)}
                            </NeuSelect>
                            {getErr('basePrice.currency') && <p className={neu.errText}><AlertCircle size={11} />{getErr('basePrice.currency')}</p>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    SECTION 2 — Duration
                ══════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={neu.cardInner}>
                  <SectionHeader id="duration" icon={Timer} iconColor={neu.colorGray} title="Tour Duration" description="Specify days and nights for the tour" />
                  <AnimatePresence>
                    {isOpen('duration') && (
                      <motion.div key="dur" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.27 }} className="overflow-hidden">
                        <div className="px-5 md:px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className={`${neu.label} flex items-center gap-1`}>Days <span className="text-[#FF2157]">*</span></label>
                            <input
                              name="duration.days" type="number" min="1" placeholder="3"
                              value={formik.values.duration?.days || 1}
                              onChange={(e) => formik.setFieldValue('duration.days', parseInt(e.target.value) || 1)}
                              onBlur={formik.handleBlur}
                              className={`${neu.input} ${getErr('duration.days') ? neu.inputErr : ''}`}
                            />
                            {getErr('duration.days') && <p className={neu.errText}><AlertCircle size={11} />{getErr('duration.days')}</p>}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={neu.label}>Nights</label>
                            <input
                              name="duration.nights" type="number" min="0" placeholder="2"
                              value={formik.values.duration?.nights || 0}
                              onChange={(e) => formik.setFieldValue('duration.nights', parseInt(e.target.value) || 0)}
                              onBlur={formik.handleBlur}
                              className={`${neu.input} ${getErr('duration.nights') ? neu.inputErr : ''}`}
                            />
                            {getErr('duration.nights') && <p className={neu.errText}><AlertCircle size={11} />{getErr('duration.nights')}</p>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    SECTION 3 — Discounts
                ══════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={neu.cardInner}>
                  <SectionHeader
                    id="discounts" icon={Tag} iconColor={neu.colorAmber}
                    title="Discounts & Promotions" description="Create special offers and discount codes"
                    action={<button type="button" onClick={addDiscount} className={`${neu.btnSm} ml-3`}><Plus size={13} /> Add Discount</button>}
                  />
                  <AnimatePresence>
                    {isOpen('discounts') && (
                      <motion.div key="disc" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.27 }} className="overflow-hidden">
                        <div className="px-5 md:px-6 py-5">
                          {(formik.values.discounts ?? []).length === 0 ? (
                            <div className={`${neu.inset} flex flex-col items-center justify-center py-10 gap-4`}>
                              <div className={neu.iconBox(neu.colorAmber)}><Tag size={24} className="text-[#FE9900]" /></div>
                              <div className="text-center">
                                <p className={`${neu.subheading} text-sm`}>No discounts added</p>
                                <p className={`${neu.body} text-xs mt-1`}>Create special offers and promotional codes to attract more customers</p>
                              </div>
                              <button type="button" onClick={addDiscount} className={neu.btnSm}><Plus size={13} /> Add First Discount</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4">
                              <AnimatePresence>
                                {(formik.values.discounts ?? []).map((disc, i) => (
                                  <motion.div key={i} variants={itemIn} initial="hidden" animate="visible" exit="exit" className={neu.insetSm}>
                                    <div className="p-4">
                                      {/* Discount row header */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <TrendingDown size={15} className="text-[#FE9900] shrink-0" />
                                        <span className={`${neu.subheading} text-sm flex-1`}>
                                          {DISCOUNT_CAT_LABELS[disc.discount]}: {fmtNum(disc.value)}
                                          {disc.type === TOUR_DISCOUNT_TYPE.PERCENTAGE ? '%' : ` ${formik.values.basePrice?.currency ?? CURRENCY.BDT}`}
                                        </span>
                                        {disc.code && (
                                          <span className={`${neu.badge} text-[#FE9900] border-[#FE9900]/25`}>
                                            <Gift size={10} />{disc.code}
                                          </span>
                                        )}
                                        <button type="button" onClick={() => removeDiscount(i)} className={neu.btnGhost}><Trash2 size={12} /></button>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                          <label className={`${neu.label} flex items-center gap-1`}>Discount Value Type <span className="text-[#FF2157]">*</span></label>
                                          <NeuSelect value={disc.type} onValueChange={(v) => updateDiscount(i, 'type', v)}>
                                            {Object.values(TOUR_DISCOUNT_TYPE).map(t => <SelectItem key={t} value={t} className="font-[var(--font-jetbrains-mono)] text-sm">{DISCOUNT_TYPE_LABELS[t]}</SelectItem>)}
                                          </NeuSelect>
                                          {getErr(`discounts[${i}].type`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`discounts[${i}].type`)}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                          <label className={`${neu.label} flex items-center gap-1`}>Discount Category <span className="text-[#FF2157]">*</span></label>
                                          <NeuSelect value={disc.discount} onValueChange={(v) => updateDiscount(i, 'discount', v)}>
                                            {Object.values(TOUR_DISCOUNT).map(t => <SelectItem key={t} value={t} className="font-[var(--font-jetbrains-mono)] text-sm">{DISCOUNT_CAT_LABELS[t]}</SelectItem>)}
                                          </NeuSelect>
                                          {getErr(`discounts[${i}].discount`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`discounts[${i}].discount`)}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                          <label className={`${neu.label} flex items-center gap-1`}>
                                            Value {disc.type === TOUR_DISCOUNT_TYPE.PERCENTAGE ? '(%)' : `(${formik.values.basePrice?.currency ?? CURRENCY.BDT})`} <span className="text-[#FF2157]">*</span>
                                          </label>
                                          <div className="relative">
                                            <input
                                              type="text" inputMode="decimal" placeholder="10.5"
                                              value={fmtNum(disc.value)}
                                              onChange={(e) => updateDiscount(i, 'value', e.target.value)}
                                              onBlur={() => { const r = Math.round(disc.value * 10) / 10; updateDiscount(i, 'value', r); }}
                                              className={`${neu.input} pr-10 ${getErr(`discounts[${i}].value`) ? neu.inputErr : ''}`}
                                            />
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                              {disc.type === TOUR_DISCOUNT_TYPE.PERCENTAGE
                                                ? <Percent size={14} className="text-[#888780]" />
                                                : <FaBangladeshiTakaSign size={13} className="text-[#888780]" />}
                                            </div>
                                          </div>
                                          {getErr(`discounts[${i}].value`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`discounts[${i}].value`)}</p>}
                                        </div>
                                        {disc.discount === TOUR_DISCOUNT.PROMO && (
                                          <div className="flex flex-col gap-1.5">
                                            <label className={`${neu.label} flex items-center gap-1`}>Promo Code <span className="text-[#FF2157]">*</span></label>
                                            <input
                                              placeholder="SUMMER2024" value={disc.code || ''}
                                              onChange={(e) => updateDiscount(i, 'code', e.target.value)}
                                              className={`${neu.input} ${getErr(`discounts[${i}].code`) ? neu.inputErr : ''}`}
                                            />
                                            {getErr(`discounts[${i}].code`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`discounts[${i}].code`)}</p>}
                                          </div>
                                        )}
                                      </div>

                                      {/* Date pickers */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {([
                                          { field: 'validFrom' as keyof DiscountDTO, label: 'Valid From' },
                                          { field: 'validUntil' as keyof DiscountDTO, label: 'Valid Until' },
                                        ] as { field: keyof DiscountDTO; label: string }[]).map(({ field, label }) => (
                                          <div key={field} className="flex flex-col gap-1.5">
                                            <label className={neu.label}>{label}</label>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <button type="button" className="w-full">
                                                  <DateBtn value={disc[field] as string | undefined} placeholder="Select date" />
                                                </button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                  mode="single"
                                                  selected={disc[field] ? new Date(disc[field] as string) : undefined}
                                                  onSelect={(d) => updateDiscount(i, field, d?.toISOString())}
                                                  disabled={(d) => {
                                                    const today = new Date(); today.setHours(0, 0, 0, 0);
                                                    if (d < today) return true;
                                                    if (field === 'validUntil' && disc.validFrom) {
                                                      const fromDate = new Date(disc.validFrom);
                                                      fromDate.setHours(0,0,0,0);
                                                      if (d < fromDate) return true;
                                                    }
                                                    
                                                    const opWin = formik.values.operatingWindow;
                                                    if (opWin && opWin.startDate && opWin.endDate) {
                                                      const start = new Date(opWin.startDate); start.setHours(0,0,0,0);
                                                      const end = new Date(opWin.endDate); end.setHours(0,0,0,0);
                                                      if (d < start || d > end) return true;
                                                    }
                                                    
                                                    return false;
                                                  }}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                            {getErr(`discounts[${i}].${field}`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`discounts[${i}].${field}`)}</p>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    SECTION 4 — Operating Windows
                ══════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={neu.cardInner}>
                  <SectionHeader
                    id="windows" icon={CalendarDays} iconColor={neu.colorBlue}
                    title="Operating Window" description="Define the date range when this tour is available"
                  />
                  <AnimatePresence>
                    {isOpen('windows') && (
                      <motion.div key="win" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.27 }} className="overflow-hidden">
                        <div className="px-5 md:px-6 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(['startDate', 'endDate'] as (keyof OperatingWindowDTO)[]).map((field) => (
                              <div key={field} className="flex flex-col gap-1.5">
                                <label className={`${neu.label} flex items-center gap-1`}>
                                  {field === 'startDate' ? 'Start Date' : 'End Date'} <span className="text-[#FF2157]">*</span>
                                </label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button type="button" className="w-full">
                                      <DateBtn value={formik.values.operatingWindow?.[field] as string | undefined} />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={formik.values.operatingWindow?.[field] ? new Date(formik.values.operatingWindow[field] as string) : undefined}
                                      onSelect={(d) => updateOperatingWindow(field, d?.toISOString())}
                                      disabled={(d) => {
                                        const today = new Date(); today.setHours(0, 0, 0, 0);
                                        if (d < today) return true;
                                        if (field === 'endDate' && formik.values.operatingWindow?.startDate) return d < new Date(formik.values.operatingWindow.startDate);
                                        return false;
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                {getErr(`operatingWindow.${field}`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`operatingWindow.${field}`)}</p>}
                              </div>
                            ))}
                          </div>
                          {formik.values.operatingWindow && (
                            <button type="button" onClick={clearOperatingWindow} className={`${neu.btnGhost} mt-4`}>
                              <X size={12} /> Clear Operating Window
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    SECTION 5 — Departure
                ══════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={neu.cardInner}>
                  <SectionHeader
                    id="departure" icon={Plane} iconColor={neu.colorGray}
                    title="Departure Schedule" description="Schedule specific departure date and time"
                    action={!formik.values.departure && <button type="button" onClick={() => formik.setFieldValue('departure', { date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), seatsTotal: 20 })} className={`${neu.btnSm} ml-3`}><Plus size={13} /> Add Departure</button>}
                  />
                  <AnimatePresence>
                    {isOpen('departure') && (
                      <motion.div key="dep" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.27 }} className="overflow-hidden">
                        <div className="px-5 md:px-6 py-5">
                          {!formik.values.departure ? (
                            <div className={`${neu.inset} flex flex-col items-center justify-center py-10 gap-4`}>
                              <div className={neu.iconBox(neu.colorGray)}><Plane size={24} className="text-[#888780]" /></div>
                              <div className="text-center">
                                <p className={`${neu.subheading} text-sm`}>No departure schedule added</p>
                                <p className={`${neu.body} text-xs mt-1`}>Schedule specific dates and times when your tour will depart</p>
                              </div>
                              <button type="button" onClick={() => formik.setFieldValue('departure', { date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), seatsTotal: 20 })} className={neu.btnSm}><Plus size={13} /> Add Departure</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4">
                              <motion.div variants={itemIn} initial="hidden" animate="visible" exit="exit" className={neu.insetSm}>
                                <div className="p-4">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Navigation size={15} className="text-[#888780] shrink-0" />
                                    <span className={`${neu.subheading} text-sm flex-1`}>Departure Details</span>
                                    <button type="button" onClick={() => formik.setFieldValue('departure', undefined)} className={neu.btnGhost}><Trash2 size={12} /></button>
                                  </div>

                                  {/* Date */}
                                  <div className="flex flex-col gap-1.5 mb-4">
                                    <label className={`${neu.label} flex items-center gap-1`}>Departure Date <span className="text-[#FF2157]">*</span></label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button type="button" className="w-full">
                                          <DateBtn value={formik.values.departure.date} />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={formik.values.departure.date ? new Date(formik.values.departure.date) : undefined}
                                          onSelect={(d) => formik.setFieldValue('departure.date', d?.toISOString())}
                                          disabled={(d) => {
                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                            if (d < today) return true;
                                            
                                            const opWin = formik.values.operatingWindow;
                                            if (opWin && opWin.endDate) {
                                                const endDate = new Date(opWin.endDate);
                                                endDate.setHours(0, 0, 0, 0);
                                                const maxDate = new Date(endDate);
                                                maxDate.setDate(maxDate.getDate() + 10);
                                                if (d < endDate || d > maxDate) return true;
                                            }
                                            return false;
                                          }}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    {getErr(`departure.date`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`departure.date`)}</p>}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Total Seats */}
                                    <div className="flex flex-col gap-1.5">
                                      <label className={`${neu.label} flex items-center gap-1`}>Total Seats <span className="text-[#FF2157]">*</span></label>
                                      <div className="relative">
                                        <input
                                          type="number" min="1" placeholder="20"
                                          value={formik.values.departure.seatsTotal}
                                          onChange={(e) => formik.setFieldValue('departure.seatsTotal', parseInt(e.target.value, 10))}
                                          className={`${neu.input} pr-10 ${getErr(`departure.seatsTotal`) ? neu.inputErr : ''}`}
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                          <Users size={14} className="text-[#888780]" />
                                        </div>
                                      </div>
                                      {getErr(`departure.seatsTotal`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`departure.seatsTotal`)}</p>}
                                    </div>
                                    {/* Meeting Point */}
                                    <div className="flex flex-col gap-1.5">
                                      <label className={neu.label}>Meeting Point</label>
                                      <div className="relative">
                                        <input
                                          placeholder="Hotel lobby, airport gate…"
                                          value={formik.values.departure.meetingPoint || ''}
                                          onChange={(e) => formik.setFieldValue('departure.meetingPoint', e.target.value)}
                                          className={`${neu.input} pr-10 ${getErr(`departure.meetingPoint`) ? neu.inputErr : ''}`}
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                          <MapPin size={14} className="text-[#888780]" />
                                        </div>
                                      </div>
                                      {getErr(`departure.meetingPoint`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`departure.meetingPoint`)}</p>}
                                    </div>
                                  </div>

                                  {/* Map coordinates */}
                                  <div className="flex flex-col gap-1.5 mt-4">
                                    <label className={neu.label}>Meeting Coordinates</label>
                                    <div className="flex gap-2">
                                      <input
                                        readOnly
                                        placeholder="Latitude, Longitude"
                                        value={
                                          formik.values.departure?.meetingCoordinates?.lat && formik.values.departure?.meetingCoordinates?.lng
                                            ? `${formik.values.departure.meetingCoordinates.lat.toFixed(6)}, ${formik.values.departure.meetingCoordinates.lng.toFixed(6)}`
                                            : ''
                                        }
                                        className={`${neu.input} flex-1`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => { setMapOpen(true); }}
                                        className={`${neu.btnOutline} shrink-0 px-3`}
                                      >
                                        <MapPin size={15} className="text-[#006666]" />
                                      </button>
                                    </div>
                                    {getErr(`departure.meetingCoordinates`) && <p className={neu.errText}><AlertCircle size={11} />{getErr(`departure.meetingCoordinates`)}</p>}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ══════════════════════════════════════════════════════════
                    SECTION 6 — Payment Methods
                ══════════════════════════════════════════════════════════ */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={neu.cardInner}>
                  <SectionHeader id="payments" icon={Wallet} iconColor={neu.colorBlue} title="Payment Methods" description="Select accepted payment options" />
                  <AnimatePresence>
                    {isOpen('payments') && (
                      <motion.div key="pay" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.27 }} className="overflow-hidden">
                        <div className="px-5 md:px-6 py-5">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.values(PAYMENT_METHOD).map((m) => {
                              const active = (formik.values.paymentMethods ?? []).includes(m);
                              return (
                                <div key={m} className={neu.checkTile(active)} onClick={() => togglePayment(m)}>
                                  <div className={neu.checkbox(active)}>
                                    {active && <Check size={12} className="text-white" />}
                                  </div>
                                  <span className={`${neu.label} text-xs flex-1`}>{PAYMENT_LABELS[m]}</span>
                                  {active && <CheckCircle2 size={14} className="text-[#006666] shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                          {formik.touched.paymentMethods && formik.errors.paymentMethods && (
                            <div className={`${neu.alertErr} mt-4`}>
                              <AlertCircle size={15} className="text-[#FF2157] shrink-0 mt-0.5" />
                              <span className="text-[#FF2157] text-xs font-[var(--font-jetbrains-mono)]">{formik.errors.paymentMethods as string}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* ── Mutation alerts ── */}
                <AnimatePresence mode="wait">
                  {mutation.isError && (
                    <motion.div key="err" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                      <div className={neu.alertErr}>
                        <XCircle size={17} className="text-[#FF2157] shrink-0 mt-0.5" />
                        <span className="text-[#FF2157] text-sm font-[var(--font-jetbrains-mono)]">
                          Failed to update pricing: {mutation.error?.message}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {mutation.isSuccess && (
                    <motion.div key="ok" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                      <div className={neu.alertOk}>
                        <CheckCircle2 size={17} className="text-[#00A63D] shrink-0" />
                        <span className="text-[#00A63D] text-sm font-[var(--font-jetbrains-mono)]">
                          Pricing & commerce updated successfully
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Footer / Submit ── */}
                <div className={`${neu.inset} flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4`}>
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
                    disabled={mutation.isPending || !formik.isValid}
                    whileHover={!mutation.isPending && formik.isValid ? { scale: 1.02 } : {}}
                    whileTap={!mutation.isPending && formik.isValid ? { scale: 0.97 } : {}}
                    className={`${neu.btn} min-w-[220px] font-bold`}
                  >
                    {mutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /><span>Updating...</span></>
                    ) : (
                      <><Check size={16} /><span>Update Pricing & Commerce</span></>
                    )}
                  </motion.button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* ── Map Picker (retained exactly) ── */}
      <MapPickerDialog
        open={mapOpen}
        onClose={() => { setMapOpen(false); }}
        onSelect={handleMapSelect}
        initialPosition={
          formik.values.departure?.meetingCoordinates
            ? [formik.values.departure.meetingCoordinates.lat, formik.values.departure.meetingCoordinates.lng]
            : undefined
        }
      />
    </>
  );
}