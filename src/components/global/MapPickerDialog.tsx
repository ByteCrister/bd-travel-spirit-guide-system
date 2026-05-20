// src/components/global/MapPickerDialog.tsx
"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, FC } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { useMap, useMapEvents } from "react-leaflet";
import { LatLngExpression, LeafletMouseEvent } from "leaflet";

const MapContainer = dynamic(
    () => import("react-leaflet").then((m) => m.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((m) => m.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((m) => m.Marker),
    { ssr: false }
);

/* ─── Design tokens ──────────────────────────────────────────────── */
const surface  = "#E7E5E4";
const primary  = "#006666";
const text     = "#1E2938";

const nmBase: React.CSSProperties = {
    background: surface,
    boxShadow:
        "4px 4px 8px rgba(0,0,0,0.14), -3px -3px 7px rgba(255,255,255,0.70)",
    borderRadius: "8px",
    border: "none",
};

const nmInset: React.CSSProperties = {
    background: surface,
    boxShadow:
        "inset 3px 3px 6px rgba(0,0,0,0.10), inset -2px -2px 5px rgba(255,255,255,0.65)",
    borderRadius: "6px",
};

/* ─── Leaflet helpers (logic unchanged) ─────────────────────────── */
const ForceResize: FC<{ open: boolean }> = ({ open }) => {
    const map = useMap();
    useEffect(() => {
        if (!open) return;
        const ts = [
            setTimeout(() => map.invalidateSize(), 50),
            setTimeout(() => map.invalidateSize(), 150),
            setTimeout(() => map.invalidateSize(), 300),
        ];
        return () => ts.forEach(clearTimeout);
    }, [open, map]);
    return null;
};

const CenterMap: FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center[0] !== 0 && center[1] !== 0) map.setView(center, 12);
    }, [center, map]);
    return null;
};

let L: typeof import("leaflet") | null = null;
async function configureLeafletIcons() {
    if (!L) L = (await import("leaflet")).default;
    const flag = "_configured";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((L.Icon.Default as any)[flag]) return;
    L.Icon.Default.mergeOptions({
        iconUrl: "/leaflet/marker-icon.png",
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        shadowUrl: "/leaflet/marker-shadow.png",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.Icon.Default as any)[flag] = true;
}

/* ─── Props ──────────────────────────────────────────────────────── */
export interface MapPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (lat: number, lng: number) => void;
    initialPosition?: [number, number];
}

/* ─── Component ──────────────────────────────────────────────────── */
export const MapPickerDialog: FC<MapPickerProps> = ({
    open,
    onClose,
    onSelect,
    initialPosition,
}) => {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<[number, number] | null>(
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
            ? initialPosition
            : null
    );

    useEffect(() => {
        if (initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    useEffect(() => {
        setMounted(true);
        configureLeafletIcons();
    }, []);

    const defaultCenter: LatLngExpression =
        initialPosition && initialPosition[0] !== 0 && initialPosition[1] !== 0
            ? initialPosition
            : [23.8103, 90.4125];

    const ClickHandler: FC = () => {
        useMapEvents({
            click: (e: LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                onSelect(lat, lng);
                onClose();
            },
        });
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            {/*
             * We override the default shadcn DialogContent with a
             * neumorphic shell. The `asChild`-style approach isn't
             * available here, so we zero-out its own styles via
             * className and re-apply nm styles via style prop.
             */}
            <DialogContent
                className="max-w-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col border-none"
                style={{
                    background: surface,
                    boxShadow:
                        "14px 14px 30px rgba(0,0,0,0.14), -8px -8px 22px rgba(255,255,255,0.72)",
                    borderRadius: "16px",
                }}
            >
                {/* ── Header ── */}
                <DialogHeader
                    className="px-5 py-4 flex-shrink-0"
                    style={{
                        borderBottom: `1px solid ${text}12`,
                        background: surface,
                    }}
                >
                    <DialogTitle className="flex items-center gap-2.5">
                        {/* Icon pill */}
                        <span
                            style={{
                                ...nmBase,
                                padding: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                color: primary,
                            }}
                        >
                            <MapPin size={16} />
                        </span>
                        <span
                            style={{
                                fontFamily:
                                    "var(--font-space-mono, 'Space Mono', monospace)",
                                fontSize: "12px",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: text,
                            }}
                        >
                            {position ? "Update Location" : "Pick a Location"}
                        </span>
                    </DialogTitle>

                    {position && (
                        <p
                            style={{
                                fontFamily:
                                    "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
                                fontSize: "11px",
                                color: `${text}55`,
                                marginTop: "4px",
                            }}
                        >
                            Click anywhere on the map to update the pin
                        </p>
                    )}
                </DialogHeader>

                {/* ── Map area — inset shadow gives it a "recessed screen" feel ── */}
                <div
                    className="flex-1 w-full overflow-hidden"
                    style={{
                        ...nmInset,
                        borderRadius: 0,
                        minHeight: "460px",
                        maxHeight: "500px",
                    }}
                >
                    {mounted && open && (
                        <MapContainer
                            center={defaultCenter}
                            zoom={position ? 12 : 5}
                            scrollWheelZoom
                            className="h-full w-full"
                            style={{ minHeight: "460px" }}
                        >
                            <ForceResize open={open} />
                            {position && <CenterMap center={position} />}
                            <TileLayer
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap contributors"
                            />
                            <ClickHandler />
                            {position && <Marker position={position} />}
                        </MapContainer>
                    )}
                </div>

                {/* ── Footer ── */}
                <div
                    className="px-5 py-3 flex-shrink-0 flex items-center justify-between gap-4"
                    style={{
                        borderTop: `1px solid ${text}12`,
                        background: surface,
                    }}
                >
                    {/* Coordinate readout — inset chip */}
                    <div
                        style={{
                            ...nmInset,
                            padding: "6px 14px",
                            fontFamily:
                                "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
                            fontSize: "12px",
                            color: position ? primary : `${text}45`,
                            minWidth: 0,
                            flex: 1,
                        }}
                        className="truncate"
                    >
                        {position ? (
                            <>
                                <span style={{ color: `${text}55`, fontSize: "10px", letterSpacing: "0.06em" }}>
                                    SELECTED&nbsp;
                                </span>
                                {position[0].toFixed(6)},&nbsp;{position[1].toFixed(6)}
                            </>
                        ) : (
                            <span style={{ fontSize: "11px", fontStyle: "italic" }}>
                                Click on the map to select a location
                            </span>
                        )}
                    </div>

                    {/* Cancel button */}
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            ...nmBase,
                            fontFamily:
                                "var(--font-space-mono, 'Space Mono', monospace)",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: `${text}70`,
                            padding: "8px 16px",
                            cursor: "pointer",
                            flexShrink: 0,
                            transition: "all 0.15s",
                        }}
                        onMouseDown={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                "inset 3px 3px 6px rgba(0,0,0,0.12), inset -2px -2px 5px rgba(255,255,255,0.60)";
                        }}
                        onMouseUp={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                "4px 4px 8px rgba(0,0,0,0.14), -3px -3px 7px rgba(255,255,255,0.70)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                "4px 4px 8px rgba(0,0,0,0.14), -3px -3px 7px rgba(255,255,255,0.70)";
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};