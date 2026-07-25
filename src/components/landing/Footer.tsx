"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaDiscord,
} from "react-icons/fa";
import { ScrollToTopButton } from "./ScrollToTopButton";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Globe,
  Award,
  Shield,
  Heart,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { SocialLink, LocationInfo } from "@/types/landing-page.types";

interface FooterProps {
  socialLinks?: SocialLink[];
  locations?: LocationInfo[];
}

export default function Footer({ socialLinks = [], locations = [] }: FooterProps) {
  const IconMap: Record<string, React.ElementType> = {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTwitter,
    FaYoutube,
    FaTiktok,
    FaDiscord,
    facebook: FaFacebook,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
    twitter: FaTwitter,
    youtube: FaYoutube,
    tiktok: FaTiktok,
    discord: FaDiscord,
  };
  return (
    <footer className="relative overflow-hidden" role="contentinfo">
      {/* Premium gradient background with enhanced depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.05),transparent_80%)]" />
      </div>

      {/* Enhanced floating decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 8, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-12 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/15 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -6, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-16 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/15 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-400/10 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 12, 0], x: [0, -8, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-gradient-to-br from-pink-400/15 to-purple-400/10 blur-2xl"
        />
      </div>

      {/* Main content with enhanced spacing and layout */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        {/* Top section (NEW GRID: 2-column on lg) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Logo + Trust indicators (lg: span 4) */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-6">
              <div className="relative group">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl font-inter">BD</span>
                </div>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300" />
              </div>

              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-white">BD Travel Spirit Guide</div>
                <div className="text-sm text-slate-300 mt-1">Professional Guides</div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 justify-center lg:justify-start">
                {[Shield, Award, Heart, Star].map((Icon, i) => {
                  const labels = ["Secure Platform", "Certified Guides", "24/7 Support", "5-Star Rated"];
                  const colors = ["text-emerald-400", "text-yellow-400", "text-red-400", "text-orange-400"];
                  return (
                    <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                      <Icon className={`h-5 w-5 ${colors[i]}`} />
                      <span className="font-medium">{labels[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Heading + Description (lg: span 8) */}
            <div className="lg:col-span-8">
              <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Empowering travel experiences across Bangladesh
                </h2>

                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <div className="h-1 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                  <span className="text-sm text-slate-300 font-medium">Professional Guides</span>
                  <div className="h-1 w-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
                </div>

                <p className="text-slate-300 text-lg leading-relaxed">
                  Empowering travel experiences across Bangladesh with professional guides and seamless tour management. Join a trusted platform where safety, quality and memorable journeys come first.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- Rest of footer unchanged --- */}

        {/* Enhanced grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" />
              Company
            </h3>

            <ul className="space-y-4">
              {["About Us", "Our Team", "Careers", "Blog", "Press Kit"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-slate-300 hover:text-emerald-400 transition-colors group flex items-center gap-2 text-base"
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              Support
            </h3>

            <ul className="space-y-4">
              {["Help Center", "FAQs", "User Guides", "Community", "Contact Us"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-slate-300 hover:text-cyan-400 transition-colors group flex items-center gap-2 text-base"
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="h-5 w-5 text-teal-400" />
              Contact
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="h-5 w-5 text-emerald-400" />
                <span className="text-base">info@bdtravelspirit.com</span>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="h-5 w-5 text-emerald-400" />
                <span className="text-base">+880 123 456 789</span>
              </div>

              {locations.length > 0 ? (
                locations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                    <span className="text-base">{loc.city ? `${loc.city}, ` : ''}{loc.country}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <span className="text-base">Sylhet, Bangladesh</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Newsletter
            </h3>

            <p className="text-slate-300 text-base mb-6 leading-relaxed">
              Get the latest travel tips, platform updates, and exclusive offers delivered to your inbox.
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col sm:flex-row items-stretch w-full gap-3 sm:gap-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 h-12 px-4 rounded-xl sm:rounded-l-2xl sm:rounded-r-none text-base text-slate-900 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all"
                />

                <Button
                  type="submit"
                  className="h-12 rounded-xl sm:rounded-r-2xl sm:rounded-l-none bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-emerald transition-all duration-300"
                >
                  Subscribe
                </Button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                We respect your privacy. Unsubscribe at any time. No spam, ever.
              </p>
            </form>
          </motion.div>
        </div>

        {/* Enhanced separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-12"
        />

        {/* Bottom section with enhanced social media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          {/* Copyright */}
          <div className="text-center lg:text-left">
            <p className="text-slate-300 text-base mb-2">
              © {new Date().getFullYear()} BD Travel Spirit Guide. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-emerald-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Enhanced social media */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-300 text-sm font-medium">Follow us</p>

            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.length > 0 ? (
                socialLinks.map((link, i) => {
                  const Icon = IconMap[link.icon] || IconMap[link.icon?.toLowerCase()] || Globe;
                  return (
                    <motion.a
                      key={i}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label || "Social Link"}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  );
                })
              ) : (
                [
                  { icon: FaFacebook, label: "Facebook", color: "hover:text-blue-500", bg: "hover:bg-blue-500/10" },
                  { icon: FaTwitter, label: "Twitter/X", color: "hover:text-sky-400", bg: "hover:bg-sky-500/10" },
                  { icon: FaInstagram, label: "Instagram", color: "hover:text-pink-500", bg: "hover:bg-pink-500/10" },
                  { icon: FaLinkedin, label: "LinkedIn", color: "hover:text-blue-600", bg: "hover:bg-blue-600/10" },
                  { icon: FaYoutube, label: "YouTube", color: "hover:text-red-500", bg: "hover:bg-red-500/10" },
                  { icon: FaTiktok, label: "TikTok", color: "hover:text-black", bg: "hover:bg-black/10" },
                  { icon: FaDiscord, label: "Discord", color: "hover:text-indigo-500", bg: "hover:bg-indigo-500/10" },
                ].map(({ icon: Icon, label, color, bg }, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    href="#"
                    aria-label={label}
                    className={`p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 text-slate-300 ${color} ${bg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Button */}
      <div className="relative z-20">
        <ScrollToTopButton />
      </div>
    </footer>
  );
}
