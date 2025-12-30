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
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import { showToast } from "../global/showToast";
import { signIn } from "next-auth/react";
// Types
export type AdminRole = USER_ROLE.GUIDE | USER_ROLE.ASSISTANT;

const errorMap: Record<string, string> = {
    EMAIL_AND_PASS_REQUIRED: "Email and password required.",
    TOO_MANY_ATTEMPTS: "Too many attempts. Try again in a minute.",
    TOO_MANY_ATTEMPTS_TO_THIS_ACCOUNT: "Too many attempts on this account. Try again soon.",
    EMAIL_AND_PASSWORD_REQUIRED: "Email and password required.",
    NO_ACCOUNT_FOUND: "No account found with this email address.",
    INVALID_PASSWORD: "Invalid email or password.",
    GOOGLE_EMAIL_NOT_FOUND: "Google account email not found.",
    USER_NOT_EXIST_WITH_THIS_GOOGLE_EMAIL: "No account found for this Google email. Please sign up first.",
};

export type JoinFormState = {
    email: string;
    password: string;
};

export type ForgotFormState = {
    email: string;
    reason: string;
};

export default function HomePage() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeForm, setActiveForm] = useState<"join" | "forgot">("join");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [join, setJoin] = useState<JoinFormState>({
        email: "",
        password: "",
    });
    const [joinErrors, setJoinErrors] = useState<Record<string, string>>({});

    const [forgot, setForgot] = useState<ForgotFormState>({
        email: "",
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
        setJoinErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateForgot = () => {
        const e: Record<string, string> = {};
        if (!forgot.email || !emailRegex.test(forgot.email)) e.email = "Enter a valid email.";
        if (!forgot.reason || forgot.reason.trim().length < 12)
            e.reason = "Provide a brief explanation (min 12 characters).";
        setForgotErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleJoinSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validateJoin()) return;

        setIsSubmitting(true);

        try {

            await api.post("/auth/user/v1/validate", {
                email: join.email,
                password: join.password,
            });

            await signIn("credentials", {
                redirect: true,
                email: join.email,
                password: join.password,
                callbackUrl: "/dashboard/overview",
            });

        } catch (error: unknown) {

            showToast.error("Login Failed", extractErrorMessage(error) as string);

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        try {
            const res = await signIn("google", {
                redirect: false,
                callbackUrl: "/dashboard/overview"
            });

            if (res?.error) {
                showToast.error("Google Login Failed", errorMap[res.error]);
            } else {
                showToast.success("Login successful", "Redirecting to dashboard...");
                // Redirect after successful login
                window.location.href = res?.url || "/dashboard/overview";
            }
        } catch {
            showToast.error("Google Login Error", "Failed to sign in with Google. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validateForgot()) return;

        setIsSubmitting(true);
        // TODO: Integrate with backend (API route /auth/request-reset).
        alert("Reset request submitted. We will verify and contact you via email.");
        setIsSubmitting(false);
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
                    isSubmitting={isSubmitting}
                    activeForm={activeForm}
                    setActiveForm={setActiveForm}
                    join={join}
                    setJoin={setJoin}
                    joinErrors={joinErrors}
                    onJoinSubmit={handleJoinSubmit}
                    onGoogleSubmit={handleGoogleLogin}
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