"use client";

import {
  FaChartLine,
  FaMapMarkedAlt,
  FaPalette,
  FaUsersCog,
  FaUserShield,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Star, Shield, Zap } from "lucide-react";

export default function Advantages() {
  const features = [
    {
      icon: FaMapMarkedAlt,
      title: "Scalable Travel Management",
      desc: "Plan, publish, and operate tours at scale with robust workflows.",
      color: "emerald",
      accent: Star,
    },
    {
      icon: FaUsersCog,
      title: "Seamless Guide & Assistance Collaboration",
      desc: "Assign roles, coordinate tasks, and streamline communication.",
      color: "teal",
      accent: Zap,
    },
    {
      icon: FaUserShield,
      title: "Secure Admin Access",
      desc: "Role‑based access, audit trails, and protected admin actions.",
      color: "cyan",
      accent: Shield,
    },
    {
      icon: FaChartLine,
      title: "Data‑driven Insights for Tours",
      desc: "Analyze bookings, feedback, and performance for smarter decisions.",
      color: "emerald",
      accent: ArrowRight,
    },
    {
      icon: FaPalette,
      title: "Modern, Elegant UI/UX",
      desc: "Clean interfaces, high contrast, and accessible interactions.",
      color: "teal",
      accent: Star,
    },
    {
      icon: HiOutlineSparkles,
      title: "Exclusive Offers",
      desc: "Intro discounts, partner perks, and seasonal promotions.",
      color: "cyan",
      accent: Zap,
    },
  ] as const;

  const colorMap = {
    emerald: {
      ring: "ring-emerald-500/30",
      text: "text-emerald-700",
      textSoft: "text-emerald-600",
      grad: "from-emerald-500 to-teal-500",
      chipGrad: "from-emerald-500/10 to-teal-500/10",
      iconGrad: "from-emerald-500/20 to-teal-500/20",
      iconText: "text-emerald-600",
      shadow: "hover:shadow-emerald-500/25",
      glow: "group-hover:shadow-emerald-400/40",
    },
    teal: {
      ring: "ring-teal-500/30",
      text: "text-teal-700",
      textSoft: "text-teal-600",
      grad: "from-teal-500 to-cyan-500",
      chipGrad: "from-teal-500/10 to-cyan-500/10",
      iconGrad: "from-teal-500/20 to-cyan-500/20",
      iconText: "text-teal-600",
      shadow: "hover:shadow-teal-500/25",
      glow: "group-hover:shadow-teal-400/40",
    },
    cyan: {
      ring: "ring-cyan-500/30",
      text: "text-cyan-700",
      textSoft: "text-cyan-600",
      grad: "from-cyan-500 to-emerald-500",
      chipGrad: "from-cyan-500/10 to-emerald-500/10",
      iconGrad: "from-cyan-500/20 to-emerald-500/20",
      iconText: "text-cyan-600",
      shadow: "hover:shadow-cyan-500/25",
      glow: "group-hover:shadow-cyan-400/40",
    },
  } as const;

  return (
    <section
      id="features-section"
      aria-labelledby="advantages-title"
      className="relative py-20 overflow-hidden"
    >
      {/* Base background gradient applied directly to section for consistent visibility */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.06),transparent_55%)]" />
      </div>

      {/* Floating accents for depth (subtle, non-distracting) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 18, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-24 left-10 w-28 h-28 bg-teal-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl text-center mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-200/60 px-4 py-2 mb-6 shadow-sm">
            <Star className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              Premium Features
            </span>
          </div>

          <h2
            id="advantages-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6"
          >
            Advantages &{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Exclusive Offers
            </span>
          </h2>

          <p className="text-xl text-slate-600 leading-relaxed">
            Designed for professional Guides and their Assistances to
            collaborate securely and efficiently across tours with modern tools
            and premium features.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc, color, accent: AccentIcon }, idx) => {
            const c = colorMap[color as keyof typeof colorMap];

            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card
                  className={[
                    "h-full rounded-2xl overflow-hidden transition-all duration-300",
                    "bg-white/70 backdrop-blur-xl",
                    "border border-slate-200/70",
                    "shadow-sm hover:shadow-xl",
                    c.shadow,
                  ].join(" ")}
                >
                  {/* Top gradient bar with a subtle glow */}
                  <div className={`h-1.5 bg-gradient-to-r ${c.grad}`} />

                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Icon tile with ring and soft gradient */}
                        <div
                          className={[
                            "relative inline-flex h-14 w-14 items-center justify-center rounded-2xl",
                            "bg-gradient-to-br",
                            c.iconGrad,
                            "ring-4",
                            c.ring,
                            "shadow-md",
                            c.glow,
                            "transition-transform duration-300 group-hover:scale-105",
                          ].join(" ")}
                        >
                          {/* Inner subtle highlight */}
                          <div className="absolute inset-0 rounded-2xl bg-white/10" />
                          <Icon className={`relative z-10 h-7 w-7 ${c.iconText}`} aria-hidden="true" />
                        </div>

                        <div>
                          <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                            {title}
                          </CardTitle>

                          {/* Microcopy tag for clarity */}
                          <div className={`mt-1 text-xs font-medium ${c.textSoft}`}>
                            Built for reliability and scale
                          </div>
                        </div>
                      </div>

                      {/* Accent icon appears on hover */}
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.textSoft}`}>
                        <AccentIcon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0">
                    <p className="text-slate-600 leading-relaxed text-base">
                      {desc}
                    </p>

                    {/* Divider with subtle gradient tint for separation */}
                    <div className="mt-6 h-px bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

                    {/* Hover CTA */}
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                      <span className={c.textSoft}>Learn more</span>
                      <ArrowRight
                        className={`h-4 w-4 ${c.textSoft} transition-transform group-hover:translate-x-1`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
