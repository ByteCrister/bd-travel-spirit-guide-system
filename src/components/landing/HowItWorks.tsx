"use client";

import { MotionDiv } from "../global/motion-elements";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, CheckCircle, Users, TrendingUp, Sparkles } from "lucide-react";

const steps = [
    {
        title: "Guide creates admin account",
        desc: "Guides establish secure admin access and invite their Assistances.",
        icon: Users,
        color: "emerald",
    },
    {
        title: "Assistance joins and aligns",
        desc: "Assistances accept invites, receive roles, and collaborate on tasks.",
        icon: CheckCircle,
        color: "teal",
    },
    {
        title: "Tours planned and executed",
        desc: "Publish itineraries, coordinate vendors, and manage live operations.",
        icon: TrendingUp,
        color: "cyan",
    },
    {
        title: "Insights and improvements",
        desc: "Analyze bookings and feedback, refine offerings, and grow sustainably.",
        icon: Sparkles,
        color: "emerald",
    },
] as const;

const colorMap = {
    emerald: {
        bar: "from-emerald-600 to-teal-600",
        softBar: "bg-emerald-100",
        iconGrad: "from-emerald-500/20 to-teal-500/20",
        iconText: "text-emerald-700",
        stepRing: "ring-emerald-200",
        accentText: "text-emerald-700",
        shadow: "hover:shadow-emerald-500/25",
    },
    teal: {
        bar: "from-teal-600 to-cyan-600",
        softBar: "bg-teal-100",
        iconGrad: "from-teal-500/20 to-cyan-500/20",
        iconText: "text-teal-700",
        stepRing: "ring-teal-200",
        accentText: "text-teal-700",
        shadow: "hover:shadow-teal-500/25",
    },
    cyan: {
        bar: "from-cyan-600 to-emerald-600",
        softBar: "bg-cyan-100",
        iconGrad: "from-cyan-500/20 to-emerald-500/20",
        iconText: "text-cyan-700",
        stepRing: "ring-cyan-200",
        accentText: "text-cyan-700",
        shadow: "hover:shadow-cyan-500/25",
    },
} as const;

export default function HowItWorks() {

    return (
        <section
            id="how-section"
            aria-labelledby="how-title"
            className="relative py-20 overflow-hidden"
        >
            {/* Background: soft gradient base + subtle central radial */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05),transparent_70%)]" />
            </div>

            {/* Desktop timeline spine */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent -translate-y-1/2" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <MotionDiv
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-4xl mx-auto text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-sm border border-teal-200/50 px-4 py-2 mb-6 shadow-sm">
                        <ArrowRight className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-semibold text-teal-700">Simple process</span>
                    </div>

                    <h2
                        id="how-title"
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6"
                    >
                        How it{" "}
                        <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                            works
                        </span>
                    </h2>

                    <p className="text-xl text-slate-600 leading-relaxed">
                        A structured flow that keeps Guides and assistance&apos;s aligned from start to finish,
                        with seamless collaboration.
                    </p>
                </MotionDiv>

                {/* Mobile vertical timeline indicator */}
                <div className="lg:hidden relative mb-8">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200" />
                </div>

                {/* Steps grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => {
                        const c = colorMap[step.color as keyof typeof colorMap];
                        return (
                            <MotionDiv
                                key={step.title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                                whileHover={{ y: -6, scale: 1.01 }}
                                className="group relative"
                            >
                                {/* Desktop connector to next step */}
                                {idx < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-emerald-200 to-transparent -translate-x-1/2" />
                                )}

                                {/* Mobile timeline dot */}
                                <div className="lg:hidden absolute -left-0.5 top-5">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white shadow-sm" />
                                </div>

                                <Card
                                    className={[
                                        "h-full rounded-2xl overflow-hidden transition-all duration-300",
                                        "bg-white/80 backdrop-blur-xl",
                                        "border border-slate-200/70",
                                        "shadow-sm hover:shadow-xl",
                                        c.shadow,
                                    ].join(" ")}
                                >
                                    {/* Top gradient bar */}
                                    <div className={`h-1.5 bg-gradient-to-r ${c.bar}`} />

                                    <CardHeader className="p-6 pt-8 relative">
                                        {/* Step chip: clear, inside header */}
                                        <div
                                            className={[
                                                "absolute -top-4 left-6 inline-flex h-9 px-3 items-center justify-center rounded-full",
                                                "bg-white text-slate-800 text-sm font-semibold",
                                                "shadow-md ring-1",
                                                c.stepRing,
                                            ].join(" ")}
                                        >
                                            Step {idx + 1}/{steps.length}
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            {/* Icon tile */}
                                            <div
                                                className={[
                                                    "inline-flex h-12 w-12 items-center justify-center rounded-xl",
                                                    "bg-gradient-to-br",
                                                    c.iconGrad,
                                                    "shadow-md ring-4 ring-white/60",
                                                    "transition-transform duration-300 group-hover:scale-110",
                                                ].join(" ")}
                                            >
                                                <step.icon className={`h-6 w-6 ${c.iconText}`} aria-hidden="true" />
                                            </div>

                                            {/* Micro subtitle */}
                                            <div className={`hidden sm:block text-xs font-medium ${c.accentText}`}>
                                                Aligned workflow
                                            </div>
                                        </div>

                                        <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                                            {step.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-6 pt-0">
                                        <p className="text-slate-600 leading-relaxed text-base">{step.desc}</p>

                                        {/* Divider */}
                                        <div className="mt-6 h-px bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

                                        {/* Progress bar */}
                                        <div className="mt-6 flex items-center gap-2">
                                            <div className={`h-2 flex-1 rounded-full ${c.softBar}`}>
                                                <div className={`h-2 rounded-full bg-gradient-to-r ${c.bar}`} style={{ width: "100%" }} />
                                            </div>
                                            <span className={`text-xs font-semibold ${c.accentText}`}>
                                                {idx + 1}/{steps.length}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </MotionDiv>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
