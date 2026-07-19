"use client";

import { TRANSPORT_MODE, TransportMode } from "@/constants/tour/tour.const";
import { TourDetailDTO } from "@/types/tour/tour.types";
import {
    AlertCircle,
    Bus,
    Car,
    CheckCircle,
    Home,
    Luggage,
    Navigation,
    Plane,
    Ship,
    Train,
    MapPin,
} from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";

// ─── Style Constants (Neumorphism Design System) ────────────────────────────

const NEU = {
    surface:   "bg-[#E7E5E4]",
    card:      "bg-[#E7E5E4] rounded-2xl",
    raised:    " rounded-2xl",
    inset:     " rounded-xl",
    insetSm:   " rounded-lg",
    pill:      " rounded-full",
    iconWrap:  "flex items-center justify-center w-10 h-10 rounded-xl bg-[#E7E5E4] ",
    label:     "text-xs font-mono font-semibold uppercase tracking-widest text-[#006666]",
    heading:   "font-bold text-[#1E2938] font-[Space_Mono,monospace]",
    muted:     "text-sm text-[#1E2938]/50 font-[Space_Mono,monospace]",
    body:      "text-sm text-[#1E2938]/80 font-[Space_Mono,monospace]",
    divider:   "border-t border-[#1E2938]/10 my-4",
    accent:    "text-[#006666]",
    required:  "bg-[#E7E5E4] border-l-4 border-[#00A63D]  rounded-lg",
    optional:  "bg-[#E7E5E4] border-l-4 border-[#FE9900]  rounded-lg",
} as const;

// Fixed: proper easing type for Framer Motion
const fadeUpProps = (delay = 0): HTMLMotionProps<"div"> => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut", delay },
});

// ────────────────────────────────────────────────────────────────────────────

interface LogisticsInfoProps {
    tour: TourDetailDTO;
}

const LogisticsInfo = ({ tour }: LogisticsInfoProps) => {
    const getTransportIcon = (mode: TransportMode) => {
        const cls = `h-4 w-4 ${NEU.accent}`;
        switch (mode) {
            case TRANSPORT_MODE.BUS:             return <Bus className={cls} />;
            case TRANSPORT_MODE.TRAIN:           return <Train className={cls} />;
            case TRANSPORT_MODE.DOMESTIC_FLIGHT: return <Plane className={cls} />;
            case TRANSPORT_MODE.BOAT:            return <Ship className={cls} />;
            case TRANSPORT_MODE.PRIVATE_CAR:
            case TRANSPORT_MODE.RIDE_SHARE:      return <Car className={cls} />;
            default:                             return <Navigation className={cls} />;
        }
    };

    return (
        <div className={`${NEU.card} ${NEU.raised} p-1`}>
            {/* Header */}
            <div className="flex items-center gap-4 px-6 pt-6 pb-4">
                <div className={NEU.iconWrap}>
                    <Navigation className={`h-5 w-5 ${NEU.accent}`} />
                </div>
                <div>
                    <p className={NEU.label}>Tour Details</p>
                    <h2 className={`${NEU.heading} text-xl mt-0.5`}>Logistics</h2>
                </div>
            </div>

            <div className={`mx-4 ${NEU.divider}`} />

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">

                {/* ── Main Location ────────────────────────── */}
                <motion.div {...fadeUpProps(0)} className={`${NEU.inset} p-5 space-y-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`${NEU.iconWrap} w-8 h-8`}>
                            <Home className={`h-4 w-4 ${NEU.accent}`} />
                        </div>
                        <span className={NEU.label}>Main Location</span>
                    </div>

                    {tour.mainLocation ? (
                        <div className="space-y-3">
                            {tour.mainLocation.address ? (
                                <div className={`${NEU.insetSm} p-3`}>
                                    <div className={`flex items-center gap-1 ${NEU.label} mb-2`}>
                                        <MapPin className="h-3 w-3" />
                                        Address
                                    </div>
                                    <div className={`${NEU.body} space-y-0.5`}>
                                        {tour.mainLocation.address.line1 && <div>{tour.mainLocation.address.line1}</div>}
                                        {tour.mainLocation.address.line2 && <div>{tour.mainLocation.address.line2}</div>}
                                        {tour.mainLocation.address.city && <div>{tour.mainLocation.address.city}</div>}
                                        {tour.mainLocation.address.district && <div>{tour.mainLocation.address.district}</div>}
                                    </div>
                                </div>
                            ) : null}
                            {tour.mainLocation.coordinates ? (
                                <div className={`${NEU.insetSm} p-3`}>
                                    <div className={`${NEU.label} mb-1`}>Coordinates</div>
                                    <div className="text-xs font-mono text-[#1E2938]/60">
                                        {tour.mainLocation.coordinates.lat.toFixed(6)},{" "}
                                        {tour.mainLocation.coordinates.lng.toFixed(6)}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <p className={`${NEU.muted} ${NEU.insetSm} p-3`}>No main location specified</p>
                    )}

                    {tour.meetingPoint ? (
                        <>
                            <div className={NEU.divider} />
                            <div>
                                <p className={`${NEU.label} mb-2`}>Meeting Point</p>
                                <p className={`${NEU.body} ${NEU.insetSm} p-3`}>{tour.meetingPoint}</p>
                            </div>
                        </>
                    ) : null}
                </motion.div>

                {/* ── Transport & Pickup ───────────────────── */}
                <motion.div {...fadeUpProps(0.1)} className={`${NEU.inset} p-5 space-y-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`${NEU.iconWrap} w-8 h-8`}>
                            <Navigation className={`h-4 w-4 ${NEU.accent}`} />
                        </div>
                        <span className={NEU.label}>Transport Modes</span>
                    </div>

                    {tour.transportModes && tour.transportModes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {tour.transportModes.map((mode, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${NEU.pill} text-xs font-mono font-semibold text-[#1E2938]/70 bg-[#E7E5E4]`}
                                >
                                    {getTransportIcon(mode)}
                                    {mode}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className={`${NEU.muted} ${NEU.insetSm} p-3`}>No transport modes specified</p>
                    )}

                    {tour.pickupOptions && tour.pickupOptions.length > 0 ? (
                        <>
                            <div className={NEU.divider} />
                            <div>
                                <p className={`${NEU.label} mb-3`}>Pickup Options</p>
                                <div className="space-y-2">
                                    {tour.pickupOptions.slice(0, 3).map((option, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 + idx * 0.06 }}
                                            className={`${NEU.raised} p-3 flex items-center justify-between bg-[#E7E5E4]`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <MapPin className={`h-3.5 w-3.5 ${NEU.accent} flex-shrink-0`} />
                                                <span className={`font-semibold text-sm text-[#1E2938] font-[Space_Mono,monospace]`}>
                                                    {option.city}
                                                </span>
                                            </div>
                                            {option.price ? (
                                                <span className={`text-xs font-mono text-[#006666] font-bold`}>
                                                    {option.price} {option.currency}
                                                </span>
                                            ) : null}
                                        </motion.div>
                                    ))}
                                    {tour.pickupOptions.length > 3 ? (
                                        <div className={`${NEU.insetSm} p-2 text-center ${NEU.muted}`}>
                                            +{tour.pickupOptions.length - 3} more options
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </>
                    ) : null}
                </motion.div>

                {/* ── Packing List ─────────────────────────── */}
                <motion.div {...fadeUpProps(0.2)} className={`${NEU.inset} p-5 space-y-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`${NEU.iconWrap} w-8 h-8`}>
                            <Luggage className={`h-4 w-4 ${NEU.accent}`} />
                        </div>
                        <span className={NEU.label}>Packing List</span>
                    </div>

                    {tour.packingList && tour.packingList.length > 0 ? (
                        <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#006666]/30">
                            {tour.packingList.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.04 }}
                                    className={`flex items-center justify-between px-3 py-2.5 ${
                                        item.required ? NEU.required : NEU.optional
                                    }`}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {item.required ? (
                                            <CheckCircle className="h-4 w-4 text-[#00A63D] flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-[#FE9900] flex-shrink-0" />
                                        )}
                                        <span
                                            className={`text-sm truncate font-[Space_Mono,monospace] ${
                                                item.required ? "font-semibold text-[#1E2938]" : "text-[#1E2938]/70"
                                            }`}
                                        >
                                            {item.item}
                                        </span>
                                    </div>
                                    {item.notes ? (
                                        <span className="ml-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#006666] bg-[#006666]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                            Note
                                        </span>
                                    ) : null}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className={`${NEU.muted} ${NEU.insetSm} p-3`}>No packing list provided</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default LogisticsInfo;