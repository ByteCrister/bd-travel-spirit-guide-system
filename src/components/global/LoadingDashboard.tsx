// components/global/LoadingDashboard.tsx
import { MotionDiv, MotionSpan } from "./motion-elements";

type Size = "sm" | "md" | "lg";

export interface LoaderProps {
    ariaLabel?: string;
    size?: Size;
    center?: boolean;
    className?: string;
    textSpeed?: number;
}

/* ─── Size map: outer box dimensions only ───────────────────────── */
const SIZE_MAP: Record<Size, { dim: string; px: number }> = {
    sm: { dim: "h-8 w-8",  px: 32 },
    md: { dim: "h-12 w-12", px: 48 },
    lg: { dim: "h-16 w-16", px: 64 },
};

/* ─── Design tokens ─────────────────────────────────────────────── */
const surface = "#E7E5E4";
const primary = "#006666";
const text    = "#1E2938";

export default function LoadingDashboard({
    ariaLabel = "Loading content",
    size = "md",
    center = true,
    className = "",
    textSpeed = 1,
}: LoaderProps) {
    const { dim, px } = SIZE_MAP[size];
    const borderRadius = px * 0.22; // proportional rounding

    return (
        <div
            role="status"
            aria-label={ariaLabel}
            className={`${center ? "min-h-screen flex items-center justify-center" : "inline-flex"} ${className}`}
        >
            {/* Neumorphic card shell */}
            <div
                style={{
                    background: surface,
                    boxShadow:
                        "10px 10px 22px rgba(0,0,0,0.13), -6px -6px 16px rgba(255,255,255,0.72)",
                    borderRadius: "16px",
                    padding: "24px 32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "14px",
                }}
            >
                <span className="sr-only">{ariaLabel}</span>

                {/* ── Neumorphic raised box with teal liquid fill ── */}
                <MotionDiv
                    aria-hidden
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -20, -20, 0],
                        rotate: [0, 0, 180, 180, 360],
                    }}
                    transition={{
                        opacity: { duration: 0.4, ease: "easeOut" },
                        scale:   { duration: 0.4, ease: "easeOut" },
                        y: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.25, 0.75, 1],
                        },
                        rotate: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                            times: [0, 0.25, 0.5, 0.75, 1],
                        },
                    }}
                    className={`${dim} relative overflow-hidden`}
                    style={{
                        background: surface,
                        boxShadow:
                            "6px 6px 14px rgba(0,0,0,0.14), -4px -4px 10px rgba(255,255,255,0.72)",
                        borderRadius: `${borderRadius}px`,
                    }}
                >
                    {/* Primary teal wave */}
                    <MotionDiv
                        animate={{
                            y: ["100%", "-100%"],
                            borderRadius: [
                                "60% 40% 30% 70% / 60% 30% 70% 40%",
                                "30% 60% 70% 40% / 50% 60% 30% 60%",
                                "60% 40% 30% 70% / 60% 30% 70% 40%",
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to top, ${primary}, #009999)` }}
                    />
                    {/* Secondary teal-dark overlay */}
                    <MotionDiv
                        animate={{
                            y: ["120%", "-120%"],
                            borderRadius: [
                                "40% 60% 70% 30% / 40% 70% 30% 60%",
                                "70% 30% 40% 60% / 60% 40% 70% 30%",
                                "40% 60% 70% 30% / 40% 70% 30% 60%",
                            ],
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute inset-0 opacity-60"
                        style={{ background: "linear-gradient(to top, #004d4d, #006666)" }}
                    />
                </MotionDiv>

                {/* ── Bouncing dots ── */}
                <span
                    aria-hidden
                    className="inline-flex items-center gap-1.5"
                >
                    {[0, 0.18, 0.36].map((delay) => (
                        <MotionSpan
                            key={delay}
                            aria-hidden
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.9 / textSpeed,
                                delay,
                            }}
                            style={{
                                display: "block",
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: primary,
                                boxShadow:
                                    "2px 2px 4px rgba(0,0,0,0.16), -1px -1px 3px rgba(255,255,255,0.58)",
                            }}
                        />
                    ))}
                </span>

                {/* ── Label ── */}
                <span
                    style={{
                        fontFamily: "var(--font-space-mono, 'Space Mono', monospace)",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: `${text}70`,
                    }}
                >
                    {ariaLabel}
                </span>
            </div>
        </div>
    );
}