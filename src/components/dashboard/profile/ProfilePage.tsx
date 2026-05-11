"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Clock, LogOut, Lock, UserCircle, Zap, Sparkles, RefreshCw } from "lucide-react";
import { useCurrentUserStore } from "@/store/current-user.store";
import ProfileLoading from "./skeletons/ProfileLoading";
import AuditLogsSection from "./AuditLogsSection";
import PasswordUpdateForm from "./PasswordUpdateForm";
import ProfileForm from "./ProfileForm";
import { IEmployeeInfo, IOwnerGuideInfo } from "@/types/current-user.types";
import { USER_ROLE } from "@/constants/current-user/user.const";
import SupportEmployeeInfo from "./SupportEmployeeInfo";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import ProfileHeader from "./ProfileHeader";
import { AlertConfirmDialog } from "./AlertConfirmDialog";

const tabItems = [
    { id: "profile", label: "Profile Information", icon: UserCircle, color: "from-slate-600 to-slate-700" },
    { id: "security", label: "Security", icon: Lock, color: "from-blue-600 to-blue-700" },
    { id: "audit", label: "Audit Logs", icon: Clock, color: "from-violet-600 to-violet-700" },
] as const;

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Profile", href: "/dashboard/profile" },
];

export default function ProfilePage() {
    const {
        baseUser,
        fullUser,
        fetchBaseUser,
        fetchFullUser,
        baseMeta,
        fullMeta,
    } = useCurrentUserStore();

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "audit">("profile");
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const handleLogoutClick = useCallback(() => setShowLogoutConfirm(true), []);
    const handleLogoutCancel = useCallback(() => setShowLogoutConfirm(false), []);

    const handleRefresh = useCallback(() => {
        if (baseUser?.role) {
            fetchFullUser(baseUser.role, { force: true });
        }
    }, [baseUser?.role, fetchFullUser]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (baseUser && baseUser.role) {
                    await fetchFullUser(baseUser.role);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setInitialLoadComplete(true);
            }
        };

        if (!initialLoadComplete || !baseUser) {
            loadUserData();
        }
    }, [fetchBaseUser, fetchFullUser, initialLoadComplete, baseUser]);

    if (baseMeta.loading && !baseUser?.role || !initialLoadComplete) {
        return <ProfileLoading />;
    }

    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({ callbackUrl: "/" });
            setTimeout(() => {
                window.location.href = "/";
            }, 300);
        } catch (err) {
            console.error("Logout error:", err);
            setIsLoggingOut(false);
        }
    };

    if (baseMeta.error || !baseUser) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="relative border-2 border-destructive/20 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-destructive/5 to-background" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent_50%)]" />

                        <CardContent className="relative pt-12 pb-12">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                                    className="relative inline-block mb-6"
                                >
                                    <div className="absolute inset-0 bg-destructive/30 blur-3xl rounded-full animate-pulse" />
                                    <div className="relative h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-destructive/20 via-destructive/10 to-destructive/5 flex items-center justify-center border-2 border-destructive/30 shadow-xl">
                                        <Shield className="h-12 w-12 text-destructive" />
                                    </div>
                                </motion.div>
                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold mb-3 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text"
                                >
                                    Error Loading Profile
                                </motion.h3>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-muted-foreground mb-8 max-w-md mx-auto text-lg"
                                >
                                    {baseMeta.error}
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        onClick={() => fetchBaseUser({ force: true })}
                                        size="lg"
                                        className="shadow-lg hover:shadow-2xl transition-all px-8 py-6 text-base font-semibold"
                                    >
                                        <Zap className="mr-2 h-5 w-5" />
                                        Try Again
                                    </Button>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto max-w-7xl px-1 sm:px-1 lg:px-2 pb-2">
                {/* Decorative background elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                </div>

                <Breadcrumbs items={breadcrumbItems} />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 mt-2"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text"
                            >
                                Account Settings
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-muted-foreground text-base sm:text-lg"
                            >
                                Manage your profile and account preferences
                            </motion.p>
                        </div>
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                <Badge variant="outline" className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-lg border-2 bg-gradient-to-r from-background to-muted/30">
                                    <Sparkles className="h-4 w-4" />
                                    {baseUser.role}
                                </Badge>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35, type: "spring" }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={fullMeta.loading}
                                    className="gap-2 border-slate-300 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-primary/5"
                                    title="Refresh profile data"
                                >
                                    <RefreshCw className={`h-4 w-4 ${fullMeta.loading ? "animate-spin" : ""}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-slate-300 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400"
                                    onClick={handleLogoutClick}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
                        className="w-full"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <TabsList className="grid w-full sm:w-auto grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                {tabItems.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-2 py-2 px-3">
                                                <Icon className="h-4 w-4" />
                                                <span className="font-medium">{tab.label}</span>
                                            </div>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            {/* Mobile Logout Button */}
                            <div className="sm:hidden">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 border-slate-300 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400"
                                    onClick={handleLogoutClick}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        </div>

                        {/* Profile Header - Shows in all tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-8"
                        >
                            <ProfileHeader baseUser={baseUser} fullUser={fullUser} />
                        </motion.div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                <Card className="shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        {activeTab === "profile" && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {baseUser.role === USER_ROLE.ASSISTANT ? (
                                                    <SupportEmployeeInfo
                                                        employeeInfo={fullUser as IEmployeeInfo}
                                                        isLoading={fullMeta.loading}
                                                    />
                                                ) : (
                                                    <ProfileForm
                                                        fullUser={fullUser as IOwnerGuideInfo}
                                                        isLoading={fullMeta.loading}

                                                        updateUserName={useCurrentUserStore.getState().updateUserName}
                                                        updateCompanyName={useCurrentUserStore.getState().updateCompanyName}
                                                        updateCompanyLogo={useCurrentUserStore.getState().updateCompanyLogo}
                                                        updateOwnerProfile={useCurrentUserStore.getState().updateOwnerProfile}
                                                        updateAvatar={useCurrentUserStore.getState().updateAvatar}
                                                        updateAvatarMeta={useCurrentUserStore.getState().updateAvatarMeta}

                                                        updateNameMeta={useCurrentUserStore.getState().updateNameMeta}
                                                        updateCompanyNameMeta={useCurrentUserStore.getState().updateCompanyNameMeta}
                                                        updateCompanyLogoMeta={useCurrentUserStore.getState().updateCompanyLogoMeta}
                                                        updateOwnerProfileMeta={useCurrentUserStore.getState().updateOwnerProfileMeta}
                                                    />
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === "security" && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <PasswordUpdateForm />
                                            </motion.div>
                                        )}

                                        {activeTab === "audit" && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <AuditLogsSection />
                                            </motion.div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>
            </div>

            <AlertConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={handleLogoutCancel}
                onConfirm={handleConfirmLogout}
                title="Confirm Action"
                description="Do you want to proceed with this action?"
                isLoading={isLoggingOut}
            />
        </>
    );
}