"use client";

import { Sparkles, Star, Zap } from "lucide-react";
import FinalCTAbtn from "./client/FinalCTAbtn";
import { MotionDiv } from "../global/motion-elements";


export default function FinalCTA() {

    return (
        <section
            aria-labelledby="cta-title"
            className="relative py-20 overflow-hidden bg-transparent"
            role="region"
        >
            {/* Visual background panel (non-negative z so it renders above page chrome) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-700 to-cyan-600" />
                <div className="absolute inset-0 opacity-80 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15),transparent_50%)]" />
            </div>

            {/* Decorative floating accents (muted but visible) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <MotionDiv
                    animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-16 left-8 w-40 h-40 rounded-full bg-yellow-400/20 blur-3xl ring-1 ring-yellow-300/10"
                    aria-hidden
                />
                <MotionDiv
                    animate={{ y: [0, 18, 0], rotate: [0, -6, 0] }}
                    transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-16 right-8 w-28 h-28 rounded-full bg-rose-500/18 blur-3xl ring-1 ring-rose-300/10"
                    aria-hidden
                />
                <MotionDiv
                    animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-emerald-400/18 blur-3xl ring-1 ring-emerald-300/10"
                    aria-hidden
                />
            </div>

            {/* Foreground content — explicit z above decorations */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <MotionDiv
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-center"
                >
                    {/* Badge: use a dark translucent pill so it reads on the dark panel */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                        className="inline-flex items-center gap-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 px-5 py-2 mb-6 shadow-sm"
                        role="status"
                        aria-live="polite"
                    >
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        <span className="text-sm font-semibold text-white">Ready to transform your travel business</span>
                    </MotionDiv>

                    {/* Heading */}
                    <h2
                        id="cta-title"
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4"
                    >
                        Ready to elevate your{" "}
                        <span className="bg-gradient-to-r from-yellow-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                            tours
                        </span>
                        ?
                    </h2>

                    <p className="text-lg sm:text-xl text-slate-200 leading-relaxed mb-10 max-w-3xl mx-auto">
                        Join as a Guide or Assistant and start collaborating with secure access and modern tools. Transform your travel business with polished UX and reliable workflows.
                    </p>

                    {/* CTA Buttons */}
                    <FinalCTAbtn />

                    {/* Features */}
                    <MotionDiv
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
                    >
                        {[
                            { icon: Star, text: "Premium features" },
                            { icon: Zap, text: "Lightning fast" },
                            { icon: Sparkles, text: "Easy setup" },
                        ].map(({ icon: Icon, text }, idx) => (
                            <MotionDiv
                                key={text}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.45, delay: 0.45 + idx * 0.08 }}
                                className="flex items-center gap-3 text-slate-100"
                            >
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/8 backdrop-blur-sm border border-white/12">
                                    <Icon className="h-5 w-5 text-white/95" />
                                </div>
                                <span className="font-medium text-white/95">{text}</span>
                            </MotionDiv>
                        ))}
                    </MotionDiv>
                </MotionDiv>
            </div>
        </section>
    );
}