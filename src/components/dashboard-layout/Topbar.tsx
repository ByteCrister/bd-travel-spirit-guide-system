"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { NotificationMenu } from "./NotificationMenu";
import { AdminAvatars } from "./AdminAvatars";
import { ProfilePopover } from "./ProfilePopover";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onLogout?: () => void;
}

export function Topbar({
  onMenuClick,
  isMobile = false,
  isCollapsed = false,
  onLogout,
}: TopbarProps) {
  const desktopLeft = isCollapsed ? "lg:left-20" : "lg:left-72";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed top-0 right-0 z-50 flex h-16 items-center justify-between",
        // Neumorphic surface
        "bg-[#E7E5E4]",
        "border-b border-[#d0cecc]",
        "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        "font-[family-name:var(--font-jetbrains-mono)]",
        isMobile ? "px-4 left-0" : `px-6 ${desktopLeft}`
      )}
      role="banner"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <motion.button
            onClick={onMenuClick}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "bg-[#E7E5E4] text-[#006666]",
              "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
              "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
              "transition-all duration-200 focus:outline-none"
            )}
            whileTap={{ scale: 0.95 }}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:block"
        >
          <h1 className="font-[family-name:var(--font-space-mono)] text-lg font-bold tracking-tight text-[#1E2938]">
            Dashboard
          </h1>
          <p className="text-[10px] tracking-widest uppercase text-[#006666] font-semibold">
            Welcome back, Admin
          </p>
        </motion.div>
      </div>

      {/* Center — Search */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 max-w-md mx-4"
      >
        <SearchBar isMobile={isMobile} />
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <NotificationMenu />

        <div className="hidden lg:block">
          <AdminAvatars />
        </div>

        <ProfilePopover onLogout={onLogout} />
      </motion.div>
    </motion.header>
  );
}