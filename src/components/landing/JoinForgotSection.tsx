"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { FaChartLine, FaUsersCog, FaUserShield, FaGoogle } from "react-icons/fa";
import { Loader2 } from "lucide-react"; // Import shadcn loader
import { useMemo, useState } from "react";
import api from "@/utils/axios/axios";
import { signIn } from "next-auth/react";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import { showToast } from "@/components/global/showToast";

import { USER_ROLE } from "@/constants/current-user/user.const";
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

const URLS = {
    VALIDATE_USER: `/auth/user/v1/validate`,
    FORGOT_PASSWORD: `/support/password-requests/v1`
}

export type JoinFormState = {
    email: string;
    password: string;
};

export type ForgotFormState = {
    email: string;
    reason: string;
};

export default function JoinForgotSection() {
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

            await api.post(URLS.VALIDATE_USER, {
                email: join.email,
                password: join.password,
            });

            await signIn("credentials", {
                redirect: true,
                email: join.email,
                password: join.password,
                callbackUrl: "/dashboard",
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
                callbackUrl: "/dashboard"
            });

            if (res?.error) {
                showToast.error("Google Login Failed", errorMap[res.error]);
            } else {
                showToast.success("Login successful", "Redirecting to dashboard...");
                // Redirect after successful login
                window.location.href = res?.url || "/dashboard";
            }
        } catch {
            showToast.error("Google Login Error", "Failed to sign in with Google. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validateForgot()) return;

        try {
            setIsSubmitting(true);

            // Make API call
            await api.post(URLS.FORGOT_PASSWORD, {
                email: forgot.email,
                description: forgot.reason,
            });

            showToast.success("Password reset request submitted successfully")
            setForgot({ email: "", reason: "" });

        } catch (err: unknown) {
            console.error("Unexpected error:", err);
            const message = extractErrorMessage(err)
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isJoin = activeForm === "join";

    return (
        <section
            id="join-section"
            aria-labelledby="join-title"
            className="relative overflow-hidden py-20"
        >
            {/* Soft themed background with subtle radial accents */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.06),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.06),transparent_55%)]" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-3xl">
                    <h2
                        id="join-title"
                        className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-900"
                    >
                        Join as Guide or Assistance
                    </h2>
                    <p className="mt-3 text-slate-700 max-w-2xl">
                        Create your admin access to coordinate tours, manage tasks, and
                        deliver reliable experiences.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mt-6 inline-flex gap-2 rounded-xl bg-emerald-50/60 p-1 border border-emerald-100">
                    <button
                        type="button"
                        onClick={() => setActiveForm("join")}
                        disabled={isSubmitting}
                        className={[
                            "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                            isJoin
                                ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200"
                                : "text-emerald-700 hover:bg-white/70 disabled:hover:bg-emerald-50/60",
                        ].join(" ")}
                    >
                        Join
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveForm("forgot")}
                        disabled={isSubmitting}
                        className={[
                            "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                            !isJoin
                                ? "bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200"
                                : "text-emerald-700 hover:bg-white/70 disabled:hover:bg-emerald-50/60",
                        ].join(" ")}
                    >
                        Forgot password
                    </button>
                </div>

                {/* Content */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-emerald-900">
                                        {isJoin ? "Join form" : "Forgot password"}
                                    </CardTitle>

                                    {/* Status chip */}
                                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <span
                                            className={[
                                                "h-2 w-2 rounded-full",
                                                isJoin ? "bg-emerald-500" : "bg-cyan-500",
                                            ].join(" ")}
                                        />
                                        {isJoin ? "Join" : "Request for password reset"}
                                        {isSubmitting && (
                                            <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                        )}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <AnimatePresence mode="wait">
                                    {isJoin ? (
                                        <motion.form
                                            key="join-form"
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 12 }}
                                            transition={{ duration: 0.25 }}
                                            onSubmit={handleJoinSubmit}
                                            noValidate
                                            className="space-y-6"
                                            aria-label="Join form"
                                        >
                                            {/* Email */}
                                            <div className="space-y-2">
                                                <Label htmlFor="join-email">Email</Label>
                                                <Input
                                                    id="join-email"
                                                    type="email"
                                                    value={join.email}
                                                    onChange={(e) =>
                                                        setJoin((s) => ({ ...s, email: e.target.value }))
                                                    }
                                                    placeholder="you@example.com"
                                                    disabled={isSubmitting}
                                                    aria-invalid={!!joinErrors.email}
                                                    aria-describedby={
                                                        joinErrors.email ? "join-email-error" : undefined
                                                    }
                                                    className="focus-visible:ring-emerald-500/70 focus-visible:border-emerald-500 transition-shadow disabled:opacity-70"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    If the email is registered, you will be logged in and redirected to the dashboard page.
                                                </p>
                                                {joinErrors.email && (
                                                    <p id="join-email-error" className="text-red-600 text-sm">
                                                        {joinErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Password */}
                                            <div className="space-y-2">
                                                <Label htmlFor="join-password">Password</Label>
                                                <Input
                                                    id="join-password"
                                                    type="password"
                                                    value={join.password}
                                                    onChange={(e) =>
                                                        setJoin((s) => ({ ...s, password: e.target.value }))
                                                    }
                                                    placeholder="••••••••"
                                                    disabled={isSubmitting}
                                                    aria-invalid={!!joinErrors.password}
                                                    aria-describedby={
                                                        joinErrors.password
                                                            ? "join-password-error"
                                                            : undefined
                                                    }
                                                    className="focus-visible:ring-emerald-500/70 focus-visible:border-emerald-500 transition-shadow disabled:opacity-70"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-slate-500">
                                                        At least 8 characters for security.
                                                    </p>
                                                    <span className="text-xs font-semibold text-emerald-700">
                                                        Secure
                                                    </span>
                                                </div>
                                                {joinErrors.password && (
                                                    <p
                                                        id="join-password-error"
                                                        className="text-red-600 text-sm"
                                                    >
                                                        {joinErrors.password}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Google Sign In Button */}
                                            <div className="space-y-3">
                                                <div className="relative flex items-center">
                                                    <div className="flex-grow border-t border-slate-300"></div>
                                                    <span className="mx-4 text-sm text-slate-500">or continue with</span>
                                                    <div className="flex-grow border-t border-slate-300"></div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-70"
                                                    onClick={handleGoogleLogin}
                                                >
                                                    <FaGoogle className="h-5 w-5" />
                                                    Sign in with Google
                                                </Button>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-4">
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white shadow-md hover:shadow-emerald-500/30 transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        "Join now"
                                                    )}
                                                </Button>

                                                <button
                                                    type="button"
                                                    onClick={() => setActiveForm("forgot")}
                                                    disabled={isSubmitting}
                                                    className="text-emerald-700 underline underline-offset-4 hover:text-emerald-800 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed w-fit"
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <motion.form
                                            key="forgot-form"
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -12 }}
                                            transition={{ duration: 0.25 }}
                                            onSubmit={handleForgotSubmit}
                                            noValidate
                                            className="space-y-6"
                                            aria-label="Forgot password form"
                                        >
                                            {/* Email */}
                                            <div className="space-y-2">
                                                <Label htmlFor="forgot-email">Email</Label>
                                                <Input
                                                    id="forgot-email"
                                                    type="email"
                                                    value={forgot.email}
                                                    onChange={(e) =>
                                                        setForgot((s) => ({ ...s, email: e.target.value }))
                                                    }
                                                    placeholder="you@example.com"
                                                    disabled={isSubmitting}
                                                    aria-invalid={!!forgotErrors.email}
                                                    aria-describedby={
                                                        forgotErrors.email ? "forgot-email-error" : undefined
                                                    }
                                                    className="focus-visible:ring-emerald-500/70 focus-visible:border-emerald-500 transition-shadow disabled:opacity-70"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    We&apos;ll contact you at this address after verification.
                                                </p>
                                                {forgotErrors.email && (
                                                    <p
                                                        id="forgot-email-error"
                                                        className="text-red-600 text-sm"
                                                    >
                                                        {forgotErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Reason */}
                                            <div className="space-y-2">
                                                <Label htmlFor="forgot-reason">Reason</Label>
                                                <Textarea
                                                    id="forgot-reason"
                                                    value={forgot.reason}
                                                    onChange={(e) =>
                                                        setForgot((s) => ({ ...s, reason: e.target.value }))
                                                    }
                                                    placeholder="Tell us briefly why you need a password reset..."
                                                    disabled={isSubmitting}
                                                    aria-invalid={!!forgotErrors.reason}
                                                    aria-describedby={
                                                        forgotErrors.reason ? "forgot-reason-error" : undefined
                                                    }
                                                    className="min-h-[100px] focus-visible:ring-emerald-500/70 focus-visible:border-emerald-500 transition-shadow disabled:opacity-70"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Provide enough detail to help us verify your request.
                                                </p>
                                                {forgotErrors.reason && (
                                                    <p
                                                        id="forgot-reason-error"
                                                        className="text-red-600 text-sm"
                                                    >
                                                        {forgotErrors.reason}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-4">
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 hover:from-emerald-800 hover:via-teal-800 hover:to-cyan-800 text-white shadow-md hover:shadow-emerald-500/30 transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        "Request reset"
                                                    )}
                                                </Button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveForm("join")}
                                                    disabled={isSubmitting}
                                                    className="text-emerald-700 underline underline-offset-4 hover:text-emerald-800 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed w-fit"
                                                >
                                                    Return to join form
                                                </button>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Why join column */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="space-y-5">
                            <h3 className="text-xl font-semibold text-emerald-900">
                                Why join?
                            </h3>
                            <p className="text-slate-700">
                                Admin access lets Guides and Assistances collaborate with clear
                                roles, secure permissions, and data-driven insights.
                            </p>

                            <Separator className="bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200" />

                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                        <FaUserShield className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <span className="text-slate-700">
                                        Verified onboarding and protected actions.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                                        <FaUsersCog className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <span className="text-slate-700">
                                        Task delegation and collaboration flow built-in.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                                        <FaChartLine className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <span className="text-slate-700">
                                        Tour metrics to improve performance over time.
                                    </span>
                                </li>
                            </ul>

                            {/* Inline reassurance card */}
                            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <p className="text-sm text-emerald-800 font-medium">
                                    Your data is handled with care.
                                </p>
                                <p className="text-sm text-emerald-700/80">
                                    Role-based access and audit trails keep your operations secure.
                                </p>
                                {isSubmitting && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Processing your request securely...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}