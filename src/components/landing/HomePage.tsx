"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Advantages from "./Advantages";
import JoinForgotSection from "./JoinForgotSection";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";
import { USER_ROLE } from "@/constants/user.const";

// Types
export type AdminRole = USER_ROLE.GUIDE | USER_ROLE.ASSISTANT;

export type JoinFormState = {
    email: string;
    password: string;
    role: AdminRole | "";
};

export type ForgotFormState = {
    email: string;
    role: AdminRole | "";
    reason: string;
};

export default function HomePage() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeForm, setActiveForm] = useState<"join" | "forgot">("join");

    const [join, setJoin] = useState<JoinFormState>({
        email: "",
        password: "",
        role: "",
    });
    const [joinErrors, setJoinErrors] = useState<Record<string, string>>({});

    const [forgot, setForgot] = useState<ForgotFormState>({
        email: "",
        role: "",
        reason: "",
    });
    const [forgotErrors, setForgotErrors] = useState<Record<string, string>>({});

    const emailRegex = useMemo(
        () =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        []
    );

    const validateJoin = () => {
        const e: Record<string, string> = {};
        if (!join.email || !emailRegex.test(join.email)) e.email = "Enter a valid email.";
        if (!join.password || join.password.length < 8)
            e.password = "Password must be at least 8 characters.";
        if (!join.role) e.role = "Select a role.";
        setJoinErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateForgot = () => {
        const e: Record<string, string> = {};
        if (!forgot.email || !emailRegex.test(forgot.email)) e.email = "Enter a valid email.";
        if (!forgot.role) e.role = "Select a role.";
        if (!forgot.reason || forgot.reason.trim().length < 12)
            e.reason = "Provide a brief explanation (min 12 characters).";
        setForgotErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleJoinSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validateJoin()) return;
        // TODO: Integrate with backend (API route /auth/join).
        // For now, simulate success:
        alert(`Welcome ${join.role}! Check your email for verification.`);
    };

    const handleForgotSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validateForgot()) return;
        // TODO: Integrate with backend (API route /auth/request-reset).
        alert("Reset request submitted. We will verify and contact you via email.");
    };

    const scrollToId = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setMobileOpen(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900">
            <Navbar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                onScroll={(id) => scrollToId(id)}
            />

            <main id="main-content">
                <Hero onJoinClick={() => scrollToId("join-section")} />

                <Advantages />

                <JoinForgotSection
                    activeForm={activeForm}
                    setActiveForm={setActiveForm}
                    join={join}
                    setJoin={setJoin}
                    joinErrors={joinErrors}
                    onJoinSubmit={handleJoinSubmit}
                    forgot={forgot}
                    setForgot={setForgot}
                    forgotErrors={forgotErrors}
                    onForgotSubmit={handleForgotSubmit}
                />

                <HowItWorks />

                <Testimonials />

                <FinalCTA onJoinClick={() => scrollToId("join-section")} />
            </main>

            <Footer />
        </div>
    );
}