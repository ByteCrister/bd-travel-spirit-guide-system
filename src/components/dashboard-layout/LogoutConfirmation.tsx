"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, AlertTriangle, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUserStore } from "@/store/current-user.store";
import userProfilePreview from "@/utils/helpers/user-profile-preview";
import { cn } from "@/lib/utils";

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export function LogoutConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmationProps) {
  const { baseUser, fullUser } = useCurrentUserStore();
  userProfilePreview.setUsers(baseUser, fullUser);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1E2938]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full max-w-md rounded-2xl overflow-hidden",
              "bg-[#E7E5E4]",
              "shadow-[12px_12px_32px_rgba(0,0,0,0.18),-12px_-12px_32px_rgba(255,255,255,0.85)]",
              "border border-[#d0cecc]"
            )}
          >
            {/* Header band */}
            <div className={cn(
              "relative px-6 py-5",
              "bg-[#E7E5E4]",
              "shadow-[inset_0_-3px_8px_rgba(0,0,0,0.06)]",
              "border-b border-[#d0cecc]"
            )}>
              <button
                onClick={onClose}
                disabled={isLoggingOut}
                className={cn(
                  "absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg",
                  "bg-[#E7E5E4] text-[#1E2938]/50",
                  "shadow-[2px_2px_6px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.85)]",
                  "hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.75)]",
                  "hover:text-[#FF2157] transition-all duration-150",
                  "disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                )}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  "bg-[#E7E5E4]",
                  "shadow-[3px_3px_8px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.85)]"
                )}>
                  <AlertTriangle className="h-6 w-6 text-[#FF2157]" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-space-mono)] text-base font-bold text-[#1E2938]">
                    Confirm Logout
                  </h3>
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-0.5">
                    Are you sure you want to sign out?
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* User card */}
              <div className={cn(
                "flex items-center gap-4 rounded-xl p-3",
                "bg-[#E7E5E4]",
                "shadow-[inset_2px_2px_6px_rgba(0,0,0,0.09),inset_-2px_-2px_6px_rgba(255,255,255,0.75)]"
              )}>
                <Avatar className="h-10 w-10 ring-2 ring-[#006666]/20">
                  <AvatarImage
                    src={userProfilePreview.getAvatar()}
                    alt={userProfilePreview.getDisplayName()}
                  />
                  <AvatarFallback className="bg-[#006666] text-white font-[family-name:var(--font-space-mono)] text-sm font-bold">
                    {getInitials(userProfilePreview.getDisplayName())}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]">
                    {userProfilePreview.getDisplayName()}
                  </p>
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/45">
                    {baseUser?.email}
                  </p>
                </div>
              </div>

              <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/55 leading-relaxed">
                You will be signed out and redirected to the login page. Any unsaved changes will be lost.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoggingOut}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-xs font-bold tracking-wide",
                    "font-[family-name:var(--font-space-mono)] text-[#1E2938]",
                    "bg-[#E7E5E4]",
                    "shadow-[3px_3px_8px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.9)]",
                    "hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
                    "transition-all duration-150 focus:outline-none",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={isLoggingOut}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold tracking-wide",
                    "font-[family-name:var(--font-space-mono)] text-white",
                    "bg-[#FF2157]",
                    "shadow-[3px_3px_10px_rgba(255,33,87,0.4),-1px_-1px_4px_rgba(255,255,255,0.2)]",
                    "hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.2),inset_-1px_-1px_4px_rgba(255,100,120,0.3)]",
                    "transition-all duration-150 focus:outline-none",
                    "disabled:opacity-70 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}