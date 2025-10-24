"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

type Testimonial = {
    name: string;
    role: string;
    quote: string;
    avatar?: string; // url to avatar if available
};

const testimonials: Testimonial[] = [
    {
        name: "Shahin Ahmed",
        role: "Guide, Sylhet",
        quote:
            "The admin tools helped me coordinate with Assistances effortlessly. Our tour ratings improved in just two months.",
    },
    {
        name: "Rima Khatun",
        role: "Assistance, Cox's Bazar",
        quote:
            "Clear roles and permissions reduced confusion during peak season. The workflow is simple and reliable.",
    },
    {
        name: "Sabbir Hasan",
        role: "Guide, Dhaka",
        quote:
            "We planned and executed complex itineraries faster. The insights helped us optimize pricing and schedules.",
    },
    {
        name: "Fatima Begum",
        role: "Assistance, Chittagong",
        quote:
            "The collaboration features made it easy to coordinate with multiple guides. Our efficiency increased by 40%.",
    },
    {
        name: "Karim Uddin",
        role: "Guide, Rajshahi",
        quote:
            "The analytics dashboard helped us understand our customers better. We've seen a 25% increase in repeat bookings.",
    },
];

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play with pause on interaction
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const goToTestimonial = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    const current = testimonials[currentIndex];

    const initials = current.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <section
            aria-labelledby="testimonials-title"
            className="relative py-20 overflow-hidden"
        >
            {/* Base background with improved contrast and consistent theme */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.06),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.06),transparent_55%)]" />
            </div>

            {/* Subtle floating accents (tuned to avoid color clashes) */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-24 left-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"
                />
                <motion.div
                    animate={{ y: [0, 16, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-24 right-12 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-4xl mx-auto text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 backdrop-blur-sm border border-teal-200/60 px-4 py-2 mb-6 shadow-sm">
                        <Star className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-semibold text-teal-700">Customer stories</span>
                    </div>

                    <h2
                        id="testimonials-title"
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6"
                    >
                        What our{" "}
                        <span className="bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            users say
                        </span>
                    </h2>

                    <p className="text-xl text-slate-600 leading-relaxed">
                        Real experiences from Guides and Assistances using BD Travel Spirit Guide.
                    </p>
                </motion.div>

                {/* Carousel */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    {/* Main card */}
                    <div className="relative max-w-4xl mx-auto">
                        <Card className="rounded-2xl overflow-hidden transition-all duration-300 bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-sm hover:shadow-xl">
                            <CardContent className="p-8 sm:p-12">
                                <div className="text-center">
                                    {/* Quote icon */}
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 ring-4 ring-white/70 shadow-md mb-6">
                                        <Quote className="h-8 w-8 text-teal-700" />
                                    </div>

                                    {/* Content */}
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.45, ease: "easeOut" }}
                                    >
                                        <blockquote className="text-2xl sm:text-3xl font-medium text-slate-900 leading-relaxed mb-8">
                                            “{current.quote}”
                                        </blockquote>

                                        {/* Author */}
                                        <div className="flex items-center justify-center gap-4">
                                            {current.avatar ? (
                                                <div className="h-16 w-16 rounded-full ring-2 ring-teal-200 overflow-hidden">
                                                    <Image
                                                        src={current.avatar}
                                                        alt={`${current.name} avatar`}
                                                        width={64}
                                                        height={64}
                                                        className="h-full w-full object-cover"
                                                        sizes="64px"
                                                        priority={false}
                                                    />
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 text-teal-700 text-lg font-bold ring-2 ring-teal-200"
                                                >
                                                    {initials}
                                                </Badge>
                                            )}

                                            <div className="text-left">
                                                <div className="text-xl font-bold text-slate-900">{current.name}</div>
                                                <div className="text-slate-600">{current.role}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Divider + progress */}
                                <div className="mt-8 space-y-4">
                                    <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-xs font-semibold text-slate-600">
                                            {currentIndex + 1}/{testimonials.length}
                                        </span>
                                        <div className="h-2 w-48 rounded-full bg-slate-200">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"
                                                style={{
                                                    width: `${((currentIndex + 1) / testimonials.length) * 100}%`,
                                                    transition: "width 400ms ease",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Desktop navigation */}
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:block">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={prevTestimonial}
                                aria-label="Previous testimonial"
                                className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white hover:shadow-md transition-all"
                            >
                                <ChevronLeft className="h-6 w-6 text-slate-800" />
                            </Button>
                        </div>

                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden sm:block">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={nextTestimonial}
                                aria-label="Next testimonial"
                                className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white hover:shadow-md transition-all"
                            >
                                <ChevronRight className="h-6 w-6 text-slate-800" />
                            </Button>
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToTestimonial(index)}
                                className={[
                                    "h-3 w-3 rounded-full transition-all duration-300",
                                    index === currentIndex
                                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 scale-125 ring-2 ring-teal-200"
                                        : "bg-slate-300 hover:bg-slate-400",
                                ].join(" ")}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Mobile navigation */}
                    <div className="flex justify-center gap-4 mt-6 sm:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prevTestimonial}
                            className="bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2 text-slate-800" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={nextTestimonial}
                            className="bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2 text-slate-800" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
