// src/components/dashboard-overview/SocialLinks.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useGuideOverviewStore } from "@/store/useGuideOverviewStore";
import { EditableGuideOverview, GuideSocialEntry } from "@/types/overview.types";
import { GUIDE_SOCIAL_PLATFORM } from "@/constants/guide.const";
import {
    Plus,
    Trash2,
    Link2,
    AlertCircle,
    Facebook,
    Twitter,
    Instagram,
    MessageCircle,
    Globe
} from "lucide-react";

interface PropsTypes {
    draft: EditableGuideOverview;
}

type ErrorMap = Record<string, string | null>;

function normalizeUrlForCompare(u: string): string {
    return u.trim().toLowerCase();
}

/** Return true if value is a valid allowed URL for social links */
function isValidUrl(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    try {
        const u = new URL(trimmed);
        if (u.protocol !== "http:" && u.protocol !== "https:") return false;
        if (u.hostname === "wa.me" || u.hostname === "api.whatsapp.com") return true;
        return !!u.hostname;
    } catch {
        return false;
    }
}

// Platform icon mapping
const platformIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    [GUIDE_SOCIAL_PLATFORM.FACEBOOK]: Facebook,
    [GUIDE_SOCIAL_PLATFORM.TWITTER]: Twitter,
    [GUIDE_SOCIAL_PLATFORM.INSTAGRAM]: Instagram,
    [GUIDE_SOCIAL_PLATFORM.WHATSAPP]: MessageCircle,
    [GUIDE_SOCIAL_PLATFORM.IMO]: MessageCircle,
};

// Platform colors
const platformColors: Record<string, string> = {
    [GUIDE_SOCIAL_PLATFORM.FACEBOOK]: "text-blue-600 bg-blue-50 border-blue-200",
    [GUIDE_SOCIAL_PLATFORM.TWITTER]: "text-sky-600 bg-sky-50 border-sky-200",
    [GUIDE_SOCIAL_PLATFORM.INSTAGRAM]: "text-pink-600 bg-pink-50 border-pink-200",
    [GUIDE_SOCIAL_PLATFORM.WHATSAPP]: "text-green-600 bg-green-50 border-green-200",
    [GUIDE_SOCIAL_PLATFORM.IMO]: "text-purple-600 bg-purple-50 border-purple-200",
};

export default function SocialLinks({ draft }: PropsTypes) {
    const { addSocial, updateSocial, removeSocial, markDirty } = useGuideOverviewStore();

    // Build initial errors map from draft
    const initialErrors = useMemo<ErrorMap>(() => {
        const m: ErrorMap = {};
        for (const s of draft.social.value) {
            const key = s.id ?? normalizeUrlForCompare(s.url) ?? `tmp-${Math.random().toString(36).slice(2, 8)}`;
            if (!s.url?.trim()) m[key] = "URL required";
            else if (!isValidUrl(s.url)) m[key] = "Invalid URL";
            else m[key] = null;
        }
        return m;
    }, [draft.social.value]);

    const [errors, setErrors] = useState<ErrorMap>(initialErrors);

    const platformOptions = useMemo(
        () => [
            GUIDE_SOCIAL_PLATFORM.FACEBOOK,
            GUIDE_SOCIAL_PLATFORM.WHATSAPP,
            GUIDE_SOCIAL_PLATFORM.IMO,
            GUIDE_SOCIAL_PLATFORM.TWITTER,
            GUIDE_SOCIAL_PLATFORM.INSTAGRAM,
        ],
        []
    );

    const setErrorFor = useCallback((key: string, message: string | null) => {
        setErrors((prev) => {
            if (prev[key] === message) return prev;
            return { ...prev, [key]: message };
        });
    }, []);

    const getAllNormalizedUrls = useCallback(() => {
        return draft.social.value.map((s) => normalizeUrlForCompare(s.url ?? ""));
    }, [draft.social.value]);

    const isDuplicateUrl = useCallback(
        (id: string | undefined, url: string) => {
            const normalized = normalizeUrlForCompare(url);
            if (!normalized) return false;
            let count = 0;
            for (const s of draft.social.value) {
                const key = normalizeUrlForCompare(s.url ?? "");
                if (!key) continue;
                if (key === normalized) {
                    if (s.id && id && s.id === id) {
                        // same entry
                    } else if (s.id && id && s.id !== id) {
                        count++;
                    } else if (!s.id && !id && s.url !== url) {
                        count++;
                    } else if (!s.id && id) {
                        count++;
                    } else if (!id && s.id) {
                        count++;
                    }
                }
            }
            return count > 0;
        },
        [draft.social.value]
    );

    const onChange = (id: string | undefined, url: string) => {
        updateSocial(id, { url });
    };

    const onBlurValidate = (s: GuideSocialEntry) => {
        const key = s.id ?? normalizeUrlForCompare(s.url) ?? `tmp-${Math.random().toString(36).slice(2, 8)}`;
        const trimmed = (s.url ?? "").trim();

        if (!trimmed) {
            setErrorFor(key, "URL required");
        } else if (!isValidUrl(trimmed)) {
            setErrorFor(key, "Invalid URL");
        } else if (isDuplicateUrl(s.id, trimmed)) {
            setErrorFor(key, "Duplicate URL");
        } else {
            setErrorFor(key, null);
        }

        markDirty("social");
    };

    const onPlatformChange = (id: string | undefined, platform: GuideSocialEntry["platform"]) => {
        updateSocial(id, { platform });
        const found = draft.social.value.find((x) => x.id === id);
        if (found) onBlurValidate(found);
        markDirty("social");
    };

    const handleAdd = () => {
        if (draft.social.value.length >= 5) {
            toast.error("You can add up to 5 links only");
            return;
        }
        addSocial({ platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK, url: "", id: undefined });
        markDirty("social");
        const tmpKey = "";
        setErrors((prev) => ({ ...prev, [tmpKey]: "URL required" }));
    };

    const handleRemove = (id: string | undefined) => {
        if (!id) return;
        removeSocial(id);
        markDirty("social");
        setErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Link2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-foreground">Social Links</h4>
                        <p className="text-xs text-muted-foreground">Connect your social profiles</p>
                    </div>
                </div>

                <motion.button
                    type="button"
                    onClick={handleAdd}
                    disabled={draft.social.value.length >= 5}
                    whileHover={draft.social.value.length < 5 ? { translateY: -1 } : {}}
                    whileTap={draft.social.value.length < 5 ? { scale: 0.98 } : {}}
                    className={`
    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
    border transition-colors duration-150
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/30
    ${draft.social.value.length >= 5
                            ? "bg-transparent text-muted-foreground border-muted/30 cursor-not-allowed"
                            : "bg-transparent text-primary border border-primary/10 hover:bg-primary/5"
                        }
  `}
                >
                    <Plus className={`w-4 h-4 ${draft.social.value.length >= 5 ? "text-muted-foreground" : "text-primary"}`} />
                    Add Link
                </motion.button>

            </div>

            <AnimatePresence mode="popLayout">
                {draft.social.value.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-8 text-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20"
                    >
                        <Globe className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            No social links yet
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            Click &quot;Add Link&quot; to connect your social profiles
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {draft.social.value.map((s, index) => {
                            const key = s.id ?? normalizeUrlForCompare(s.url) ?? `tmp-${Math.random().toString(36).slice(2, 8)}`;
                            const error = errors[key] ?? null;
                            const Icon = platformIcons[s.platform] || Globe;
                            const colorClass = platformColors[s.platform] || "text-gray-600 bg-gray-50 border-gray-200";

                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                    className={`
                                        group relative p-4 rounded-xl border transition-all duration-200
                                        ${error
                                            ? "border-destructive/50 bg-destructive/5 shadow-sm shadow-destructive/10"
                                            : "border-muted/40 bg-muted/20 hover:bg-muted/30 hover:border-muted/60"
                                        }
                                    `}
                                >
                                    <div className="flex gap-3 items-start">
                                        {/* Platform Selector */}
                                        <div className="relative">
                                            <div className={`
                                                absolute inset-0 rounded-lg border
                                                ${colorClass}
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                            `} />
                                            <select
                                                className={`
                                                    relative w-40 px-3 py-2.5 pr-8 rounded-lg border font-medium text-sm
                                                    appearance-none cursor-pointer transition-all duration-200
                                                    focus:outline-none focus:ring-2 focus:ring-primary/50
                                                    ${colorClass}
                                                `}
                                                value={s.platform}
                                                onChange={(e) => onPlatformChange(s.id, e.target.value as GuideSocialEntry["platform"])}
                                                onBlur={() => {
                                                    const found = draft.social.value.find((x) => x.id === s.id);
                                                    if (found) onBlurValidate(found);
                                                }}
                                            >
                                                {platformOptions.map((p) => (
                                                    <option key={p} value={p}>
                                                        {p}
                                                    </option>
                                                ))}
                                            </select>
                                            <Icon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                                        </div>

                                        {/* URL Input */}
                                        <div className="flex-1 space-y-1">
                                            <div className="relative">
                                                <input
                                                    className={`
                                                        w-full px-4 py-2.5 pl-10 rounded-lg border font-medium text-sm
                                                        transition-all duration-200
                                                        focus:outline-none focus:ring-2 focus:ring-primary/50
                                                        placeholder:text-muted-foreground/40
                                                        ${error
                                                            ? "border-destructive bg-destructive/5 text-destructive"
                                                            : "border-muted bg-background hover:border-muted-foreground/30"
                                                        }
                                                    `}
                                                    value={s.url}
                                                    onChange={(e) => onChange(s.id, e.target.value)}
                                                    onBlur={() => onBlurValidate(s)}
                                                    placeholder="https://example.com/your-profile"
                                                    aria-invalid={!!error}
                                                />
                                                <Link2 className={`
                                                    absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                                                    ${error ? "text-destructive/50" : "text-muted-foreground/50"}
                                                `} />
                                            </div>

                                            <AnimatePresence>
                                                {error && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="flex items-center gap-1.5 text-xs text-destructive font-medium px-1"
                                                    >
                                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                                        {error}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Remove Button */}
                                        <motion.button
                                            type="button"
                                            onClick={() => handleRemove(s.id)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="
                                                flex-shrink-0 p-2 rounded-lg 
                                                text-destructive hover:text-destructive/80
                                                hover:bg-destructive/10
                                                transition-all duration-200
                                                focus:outline-none focus:ring-2 focus:ring-destructive/50
                                            "
                                            aria-label="Remove social link"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-muted/40"
            >
                <AlertCircle className="w-4 h-4 text-muted-foreground/70 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    You can add up to <span className="font-semibold text-foreground">{draft.social.value.length}/5</span> social links.
                    Each URL must be unique and valid.
                </p>
            </motion.div>
        </div>
    );
}