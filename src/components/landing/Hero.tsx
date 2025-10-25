"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import CountUp from "react-countup";
import {
  FaUsers,
  FaUserShield,
  FaSuitcase,
  FaStar,
  FaGlobeAsia,
  FaHandshake,
} from "react-icons/fa";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";

import formatHeroStat from "@/utils/helpers/formatHeroStat.landing";

type Stat = {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
};

export default function Hero({ onJoinClick }: { onJoinClick: () => void }) {
  const stats: Stat[] = [
    { icon: FaUsers, label: "Registered Guides", value: 1200 },
    { icon: FaUserShield, label: "Assistances Verified", value: 2800 },
    { icon: FaSuitcase, label: "Tours Managed", value: 8500 },
    { icon: FaStar, label: "Avg. Satisfaction", value: 4.8, suffix: "/5" },
    { icon: FaGlobeAsia, label: "Cities Covered", value: 60 },
    { icon: FaHandshake, label: "Partners & Vendors", value: 200 },
  ];

  return (
    <section
      aria-labelledby="hero-title"
      className="
        relative min-h-screen flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500
      "
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-slate-900/70" />

      {/* Radial accent overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.15),transparent_50%)]" />

      {/* Floating decorative motion blobs (sit above overlays, below content) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-16 h-16 bg-red-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-1/4 w-24 h-24 bg-green-500/20 rounded-full blur-xl"
        />
      </div>

      {/* Content wrapper (above everything) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 mb-8"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                Professional Travel Management
              </span>
            </motion.div>

            {/* Main heading */}
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
            >
              Empowering Travel Experiences with{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                BD Travel Spirit Guide
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-200 leading-relaxed mb-12 max-w-3xl mx-auto">
              Connect Guides and Assistances to manage tours, collaborate
              seamlessly, and deliver trusted travel experiences across
              Bangladesh.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onJoinClick}
                  size="lg"
                  className="group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-emerald transition-all duration-300 touch-manipulation"
                >
                  Join as Admin
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="#features-section"
                  className="group flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("features-section");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Explore features
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {stats.map(({ icon: Icon, label, value, suffix, prefix }, i) => {
              const { displayValue, suffix: s } = formatHeroStat(value, {
                suffix,
                prefix,
              });

              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="group"
                >
                  <Card className="h-full bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300 rounded-2xl overflow-hidden shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>

                      <div className="text-2xl font-bold text-white mb-1">
                        <CountUp
                          start={0}
                          end={displayValue}
                          duration={2.5}
                          decimals={displayValue % 1 !== 0 ? 1 : 0}
                          separator=","
                        >
                          {({ countUpRef }) => <span ref={countUpRef} />}
                        </CountUp>
                        {s}
                      </div>

                      <div className="text-xs font-medium text-slate-200 uppercase tracking-wider">
                        {label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-sm font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 scroll-indicator" />
        </motion.div>
      </motion.div>
    </section>
  );
}
