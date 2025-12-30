"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { IoMdClose, IoMdMenu } from "react-icons/io";
import { ExternalLink } from "lucide-react";
import { FaUserTie } from "react-icons/fa";

export default function Navbar({
    mobileOpen,
    setMobileOpen,
    onScroll,
}: {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    onScroll: (id: string) => void;
}) {
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const onScrollWin = () => {
            const y = window.scrollY;
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
            
            setScrolled(y > 8);
            setScrollProgress(p);
            
            // Auto-hide on scroll down
            if (y > lastScrollY && y > 100) {
                setHidden(true);
            } else {
                setHidden(false);
            }
            setLastScrollY(y);
        };
        onScrollWin();
        window.addEventListener("scroll", onScrollWin, { passive: true });
        return () => window.removeEventListener("scroll", onScrollWin);
    }, [lastScrollY]);

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{ y: hidden ? -100 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={[
                "sticky top-0 z-50 backdrop-blur-xl transition-all duration-300",
                scrolled
                    ? "bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20"
                    : "bg-transparent",
            ].join(" ")}
            role="banner"
        >
            {/* Skip link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded-xl bg-white/90 backdrop-blur-sm px-4 py-2 text-emerald-700 font-medium shadow-lg"
            >
                Skip to content
            </a>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="group flex items-center gap-3 font-bold tracking-tight hover-glow"
                    aria-label="BD Travel Spirit Guide home"
                >
                    {/* Square gradient logo */}
                    <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-emerald group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold text-lg font-inter">BD</span>
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:via-teal-500 group-hover:to-cyan-500 transition-all duration-300">
                            BD Travel Spirit Guide
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="h-0.5 w-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                            <span className="text-xs font-medium text-slate-500 group-hover:text-emerald-500 transition-colors">
                                Professional Guides
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-8">
                        {[
                            { label: "Features", id: "features-section" },
                            { label: "How it works", id: "how-section" },
                            { label: "Join", id: "join-section" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onScroll(item.id)}
                                className="relative text-slate-600 hover:text-emerald-600 transition-colors group font-medium"
                            >
                                {item.label}
                                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all group-hover:w-full rounded-full" />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="https://www.example.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group hidden lg:flex items-center gap-2 rounded-2xl px-5 py-2 bg-white/5 text-slate-900 border border-white/10 font-semibold hover:shadow-md transition-all duration-200"
                        >
                            Main Website
                            <ExternalLink className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        </Link>

                        {/* Register as Guide CTA */}
                        <Link
                            href="/register-guide"
                            className="flex items-center gap-2 rounded-2xl px-5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                            aria-label="Register as Guide"
                        >
                            <FaUserTie className="h-4 w-4" />
                            <span className="hidden sm:inline">Register as Guide</span>
                        </Link>
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    className="md:hidden text-slate-600 hover:bg-white/20 focus-visible:ring-emerald-600 rounded-xl h-12 w-12"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <motion.div
                        animate={{ rotate: mobileOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {mobileOpen ? (
                            <IoMdClose className="h-6 w-6" />
                        ) : (
                            <IoMdMenu className="h-6 w-6" />
                        )}
                    </motion.div>
                </Button>
            </div>

            {/* Scroll progress bar */}
            <div className="h-1 w-full bg-transparent">
                <motion.div
                    className="h-1 origin-left bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                    style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                    aria-hidden="true"
                />
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="md:hidden bg-white/10 backdrop-blur-xl border-t border-white/20"
                    >
                        <div className="px-6 py-4 space-y-3">
                            {[
                                { label: "Features", id: "features-section" },
                                { label: "How it works", id: "how-section" },
                                { label: "Join", id: "join-section" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onScroll(item.id);
                                        setMobileOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-3 text-slate-700 hover:bg-white/20 hover:text-slate-900 rounded-xl font-medium transition-colors"
                                >
                                    {item.label}
                                </button>
                            ))}

                            <Link
                                href="/register-guide"
                                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl font-semibold mt-1 hover:scale-105 transition-transform"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Register as Guide"
                            >
                                <FaUserTie className="h-5 w-5" />
                                <span>Register as Guide</span>
                            </Link>

                            <Link
                                href="https://www.example.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl font-semibold mt-2 hover:scale-105 transition-transform"
                            >
                                Main Website
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
