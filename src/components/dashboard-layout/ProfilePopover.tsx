"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUserStore } from "@/store/current-user.store";
import userProfilePreview from "@/utils/helpers/user-profile-preview";
import { cn } from "@/lib/utils";

interface ProfilePopoverProps {
  onLogout?: () => void;
}

export function ProfilePopover({ onLogout }: ProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { fullUser, baseUser } = useCurrentUserStore();
  userProfilePreview.setUsers(baseUser, fullUser);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogoutClick = () => {
    onLogout?.();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-xl p-1.5",
          "bg-[#E7E5E4]",
          "shadow-[3px_3px_8px_rgba(0,0,0,0.13),-3px_-3px_8px_rgba(255,255,255,0.9)]",
          "hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
          "transition-all duration-200 focus:outline-none"
        )}
        whileTap={{ scale: 0.97 }}
        aria-label={`Profile menu for ${userProfilePreview.getDisplayName()}`}
        aria-expanded={isOpen}
      >
        <Avatar className="h-8 w-8 ring-2 ring-[#006666]/20">
          <AvatarImage
            src={userProfilePreview.getAvatar()}
            alt={userProfilePreview.getDisplayName()}
          />
          <AvatarFallback className="text-xs bg-[#006666] text-white font-[family-name:var(--font-space-mono)]">
            {getInitials(userProfilePreview.getDisplayName())}
          </AvatarFallback>
        </Avatar>

        <div className="hidden md:block text-left">
          <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold truncate max-w-24 text-[#1E2938]">
            {userProfilePreview.getDisplayName()}
          </p>
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[#006666] truncate max-w-24 tracking-wide">
            {baseUser?.role}
          </p>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden md:block"
        >
          <ChevronDown className="h-3.5 w-3.5 text-[#1E2938]/50" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn(
                "absolute right-0 top-12 z-50 w-64 rounded-2xl overflow-hidden",
                "bg-[#E7E5E4]",
                "shadow-[6px_6px_20px_rgba(0,0,0,0.14),-6px_-6px_20px_rgba(255,255,255,0.9)]",
                "border border-[#d0cecc]"
              )}
              role="dialog"
              aria-label="Profile menu"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12 ring-2 ring-[#006666]/25">
                  <AvatarImage
                    src={userProfilePreview.getAvatar()}
                    alt={userProfilePreview.getDisplayName()}
                  />
                  <AvatarFallback className="bg-[#006666] text-white font-[family-name:var(--font-space-mono)] text-sm">
                    {getInitials(userProfilePreview.getDisplayName())}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold truncate text-[#1E2938]">
                    {userProfilePreview.getDisplayName()}
                  </p>
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-[#1E2938]/50 truncate">
                    {baseUser?.email}
                  </p>
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[#006666] mt-0.5 tracking-wide uppercase font-semibold">
                    {baseUser?.role}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#d0cecc]" />

              {/* Logout */}
              <div className="p-2">
                <motion.button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold",
                    "font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]",
                    "shadow-[1px_1px_4px_rgba(0,0,0,0.08),-1px_-1px_4px_rgba(255,255,255,0.7)]",
                    "hover:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_4px_rgba(255,255,255,0.65)]",
                    "transition-all duration-150 focus:outline-none"
                  )}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogoutClick}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}