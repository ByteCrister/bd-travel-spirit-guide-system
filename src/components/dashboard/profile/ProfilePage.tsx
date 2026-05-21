"use client";

import { useState, useEffect, useCallback } from "react";
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
import ProfileHeader from "./ProfileHeader";
import { AlertConfirmDialog } from "./AlertConfirmDialog";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
// Surface: #E7E5E4 | Primary: #006666 | Text: #1E2938
// Font: Space Mono (primary/display), JetBrains Mono (mono/body)
// Shadows: outer = convex raised; inner = concave pressed
const neu = {
  surface: "#E7E5E4",
  primary: "#006666",
  text: "#1E2938",
  muted: "#6B7280",
  danger: "#FF2157",
  // Outer shadow: raised element on surface
  shadowOut: "6px 6px 12px #c4c2c1, -6px -6px 12px #ffffff",
  shadowOutSm: "3px 3px 6px #c4c2c1, -3px -3px 6px #ffffff",
  // Inner shadow: pressed / inset element
  shadowIn: "inset 4px 4px 8px #c4c2c1, inset -4px -4px 8px #ffffff",
  shadowInSm: "inset 2px 2px 5px #c4c2c1, inset -2px -2px 5px #ffffff",
} as const;

const tabItems = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "security", label: "Security", icon: Lock },
  { id: "audit", label: "Audit Logs", icon: Clock },
] as const;

const breadcrumbItems = [
  { label: "Home", href: "/" },
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

  if ((baseMeta.loading && !baseUser?.role) || !initialLoadComplete) {
    return <ProfileLoading />;
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" });
      setTimeout(() => { window.location.href = "/"; }, 300);
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  // ─── Error State ────────────────────────────────────────────────────────────
  if (baseMeta.error || !baseUser) {
    return (
      <div
        className="container mx-auto p-2 sm:p-3 lg:p-5 max-w-2xl"
        style={{ fontFamily: "'Space Mono', monospace", background: neu.surface, minHeight: "100vh" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: neu.surface, boxShadow: neu.shadowOut }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <div
                className="h-24 w-24 rounded-2xl flex items-center justify-center"
                style={{ background: neu.surface, boxShadow: neu.shadowIn }}
              >
                <Shield className="h-12 w-12" style={{ color: neu.danger }} />
              </div>
            </motion.div>

            <h3
              className="text-2xl font-bold mb-3"
              style={{ color: neu.text, fontFamily: "'Space Mono', monospace" }}
            >
              Error Loading Profile
            </h3>
            <p className="mb-8" style={{ color: neu.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
              {baseMeta.error}
            </p>

            <button
              onClick={() => fetchBaseUser({ force: true })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: neu.surface,
                boxShadow: neu.shadowOut,
                color: neu.primary,
                fontFamily: "'Space Mono', monospace",
                border: "none",
                cursor: "pointer",
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = neu.shadowIn;
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = neu.shadowOut;
              }}
            >
              <Zap className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main Page ──────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="container mx-auto max-w-7xl px-4 pb-8"
        style={{ fontFamily: "'Space Mono', monospace", background: neu.surface, minHeight: "100vh" }}
      >
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mt-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ color: neu.text, fontFamily: "'Space Mono', monospace" }}
              >
                Account Settings
              </h1>
              <p style={{ color: neu.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                Manage your profile and account preferences
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <div
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: neu.surface,
                  boxShadow: neu.shadowOutSm,
                  color: neu.primary,
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "0.05em",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {baseUser.role}
              </div>

              {/* Refresh */}
              <NeuButton
                onClick={handleRefresh}
                disabled={fullMeta.loading}
                title="Refresh profile data"
              >
                <RefreshCw className={`h-4 w-4 ${fullMeta.loading ? "animate-spin" : ""}`} style={{ color: neu.primary }} />
                <span className="hidden sm:inline text-xs" style={{ color: neu.text }}>Refresh</span>
              </NeuButton>

              {/* Logout */}
              <NeuButton onClick={handleLogoutClick}>
                <LogOut className="h-4 w-4" style={{ color: neu.danger }} />
                <span className="hidden sm:inline text-xs" style={{ color: neu.danger }}>Logout</span>
              </NeuButton>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          {/* Tab Bar */}
          <div
            className="flex gap-2 p-2 rounded-2xl mb-8 w-full sm:w-auto"
            style={{ background: neu.surface, boxShadow: neu.shadowIn }}
          >
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 justify-center"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    background: neu.surface,
                    boxShadow: isActive ? neu.shadowIn : "none",
                    color: isActive ? neu.primary : neu.muted,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Profile Header */}
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div
                className="rounded-2xl p-6"
                style={{ background: neu.surface, boxShadow: neu.shadowOut }}
              >
                {activeTab === "profile" && (
                  <>
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
                  </>
                )}
                {activeTab === "security" && <PasswordUpdateForm />}
                {activeTab === "audit" && <AuditLogsSection />}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Mobile logout */}
        <div className="sm:hidden pb-6">
          <NeuButton onClick={handleLogoutClick} fullWidth>
            <LogOut className="h-4 w-4" style={{ color: neu.danger }} />
            <span className="text-xs font-bold" style={{ color: neu.danger, fontFamily: "'Space Mono', monospace" }}>
              Logout
            </span>
          </NeuButton>
        </div>
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

// ─── Reusable Neumorphic Button ───────────────────────────────────────────────
function NeuButton({
  children,
  onClick,
  disabled,
  title,
  fullWidth,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all active:scale-95 ${fullWidth ? "w-full justify-center" : ""}`}
      style={{
        background: "#E7E5E4",
        boxShadow: "3px 3px 6px #c4c2c1, -3px -3px 6px #ffffff",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseDown={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = "inset 2px 2px 5px #c4c2c1, inset -2px -2px 5px #ffffff";
      }}
      onMouseUp={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 6px #c4c2c1, -3px -3px 6px #ffffff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 6px #c4c2c1, -3px -3px 6px #ffffff";
      }}
    >
      {children}
    </button>
  );
}