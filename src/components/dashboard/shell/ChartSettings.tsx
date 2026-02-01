// components/dashboard/ChartSettings.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiSettings, FiRotateCw, FiSave, FiX, FiBell, FiClock, FiSlash, FiList } from "react-icons/fi";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export type ChartSettingsPrefs = {
    enableNotifications: boolean;
    compactMessages: boolean;
    prefersReducedMotion: boolean;
    showMessageTimestamps: boolean;
};

const STORAGE_KEY_PREFIX = "dashboard:chartSettings:v1:";

export interface ChartSettingsProps {
    chartId?: string;
    className?: string;
    onOpen?: () => void;
    onClose?: () => void;
}

/**
 * ChartSettings
 *
 * Controlled dialog that only closes when the user explicitly requests it
 * (Close button or programmatic allow-close). Toggling controls inside the
 * dialog will not cause accidental close via backdrop or Escape.
 */
export default function ChartSettings({ chartId, className, onOpen, onClose }: ChartSettingsProps) {
    const storageKey = `${STORAGE_KEY_PREFIX}${chartId ?? "global"}`;
    const [open, setOpen] = useState(false);
    const [prefs, setPrefs] = useState<ChartSettingsPrefs>({
        enableNotifications: true,
        compactMessages: false,
        prefersReducedMotion: false,
        showMessageTimestamps: true,
    });
    const [dirty, setDirty] = useState(false);
    const firstInputRef = useRef<HTMLInputElement | null>(null);

    // allowCloseRef controls whether the next close event should be honored.
    // We set it to true only when we intentionally want to close (Close button,
    // or if you want Save to close as well you can set it in handleSave).
    const allowCloseRef = useRef(false);

    // hydrate prefs (client-only)
    useEffect(() => {
        try {
            const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<ChartSettingsPrefs>;
                setPrefs((p) => ({ ...p, ...parsed }));
            }
        } catch {
            // ignore parse errors
        }
    }, [storageKey]);

    // persist only on explicit save
    const handleSave = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(prefs));
            setDirty(false);
            // If you prefer Save to also close the dialog, uncomment the two lines below:
            // allowCloseRef.current = true;
            // setOpen(false);
        } catch {
            // ignore
        }
    };

    const handleReset = () => {
        const defaults: ChartSettingsPrefs = {
            enableNotifications: true,
            compactMessages: false,
            prefersReducedMotion: false,
            showMessageTimestamps: true,
        };
        setPrefs(defaults);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // ignore
        }
        setDirty(true);
    };

    // focus first input when dialog opens
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => firstInputRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
        return;
    }, [open]);

    // notify parent if provided
    useEffect(() => {
        if (open) onOpen?.();
        else onClose?.();
    }, [open, onOpen, onClose]);

    const toggle = <K extends keyof ChartSettingsPrefs>(key: K) => {
        setPrefs((prev) => {
            const next = { ...prev, [key]: !prev[key] } as ChartSettingsPrefs;
            if (key === "prefersReducedMotion") {
                try {
                    window.dispatchEvent(new CustomEvent("dashboard:prefersReducedMotion", { detail: next.prefersReducedMotion }));
                } catch {
                    // ignore environments without CustomEvent support
                }
            }
            setDirty(true);
            return next;
        });
    };

    const controlRow = (opts: {
        id: string;
        label: string;
        hint?: string;
        icon?: React.ReactNode;
        checked: boolean;
        onChange: () => void;
        inputRef?: React.RefObject<HTMLInputElement | null>;
    }) => {
        return (
            <div key={opts.id} className="flex items-start gap-4">
                <div className="mt-1 text-slate-600" aria-hidden>
                    {opts.icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <label htmlFor={opts.id} className="text-sm font-medium text-slate-900">
                            {opts.label}
                        </label>
                        <div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={opts.checked}
                                onClick={opts.onChange}
                                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 ${opts.checked ? "bg-emerald-500" : "bg-slate-200"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${opts.checked ? "translate-x-5" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                    {opts.hint && <p className="mt-1 text-xs text-muted-foreground">{opts.hint}</p>}
                </div>
            </div>
        );
    };

    // Controlled onOpenChange: allow open always, only allow close when allowCloseRef is true.
    const handleOpenChange = (next: boolean) => {
        if (next === true) {
            setOpen(true);
            return;
        }

        // next === false: only close if we intentionally allowed it
        if (allowCloseRef.current) {
            allowCloseRef.current = false;
            setOpen(false);
            return;
        }

        // Otherwise ignore automatic/ambient close attempts (backdrop, Escape)
        // and keep the dialog open.
        setOpen(true);
    };

    const handleCloseRequested = () => {
        allowCloseRef.current = true;
        setOpen(false);
    };

    return (
        <div className={className}>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        aria-label="Open chart settings"
                        title="Chart settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                        <FiSettings className="w-4 h-4" />
                        <span className="hidden md:inline">Chart settings</span>
                    </button>
                </DialogTrigger>

                <DialogContent className="max-w-xl w-full">
                    <DialogHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <DialogTitle className="flex items-center gap-2">
                                    <FiSettings className="w-5 h-5 text-emerald-600" />
                                    <span>Chart settings</span>
                                </DialogTitle>
                                <DialogDescription>Per-chart preferences, accessibility and export convenience</DialogDescription>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    title="Reset to defaults"
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <FiRotateCw className="w-4 h-4" />
                                    Reset
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    title="Save preferences"
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm text-white ${dirty ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-400/60 cursor-default"}`}
                                    aria-disabled={!dirty}
                                >
                                    <FiSave className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-4 grid gap-4">
                        <div className="rounded-lg border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
                            <h4 className="mb-3 text-sm font-semibold text-slate-800">General</h4>
                            <div className="flex flex-col gap-3">
                                {controlRow({
                                    id: "enableNotifications",
                                    label: "Enable notifications",
                                    hint: "Show realtime notification badges and toasts for this chart.",
                                    icon: <FiBell className="w-5 h-5 text-amber-500" />,
                                    checked: prefs.enableNotifications,
                                    onChange: () => toggle("enableNotifications"),
                                    inputRef: firstInputRef,
                                })}

                                {controlRow({
                                    id: "compactMessages",
                                    label: "Compact message layout",
                                    hint: "Reduce vertical spacing in messages and activity rows for dense dashboards.",
                                    icon: <FiList className="w-5 h-5 text-sky-500" />,
                                    checked: prefs.compactMessages,
                                    onChange: () => toggle("compactMessages"),
                                })}
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
                            <h4 className="mb-3 text-sm font-semibold text-slate-800">Accessibility</h4>
                            <div className="flex flex-col gap-3">
                                {controlRow({
                                    id: "prefersReducedMotion",
                                    label: "Reduce motion",
                                    hint: "Turn off non-essential motion for charts and UI elements.",
                                    icon: <FiSlash className="w-5 h-5 text-violet-500" />,
                                    checked: prefs.prefersReducedMotion,
                                    onChange: () => toggle("prefersReducedMotion"),
                                })}

                                {controlRow({
                                    id: "showMessageTimestamps",
                                    label: "Show timestamps",
                                    hint: "Display timestamps next to chart messages and system notes.",
                                    icon: <FiClock className="w-5 h-5 text-slate-500" />,
                                    checked: prefs.showMessageTimestamps,
                                    onChange: () => toggle("showMessageTimestamps"),
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <p className="text-xs text-muted-foreground">
                                Changes are local to your browser. Use <span className="font-medium">Save</span> to persist preferences.
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                                    type="button"
                                    onClick={() => {
                                        // explicit close via the Close button — allow and close
                                        handleCloseRequested();
                                    }}
                                >
                                    <FiX className="w-4 h-4" />
                                    Close
                                </button>
                                <button
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white ${dirty ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-400/60 cursor-default"}`}
                                    type="button"
                                    onClick={handleSave}
                                    aria-disabled={!dirty}
                                >
                                    <FiSave className="w-4 h-4" />
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
