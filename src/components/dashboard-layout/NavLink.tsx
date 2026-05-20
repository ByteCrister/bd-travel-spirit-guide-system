"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

function useIsActive(href: string, pathname: string | null | undefined) {
  if (!pathname) return false;

  const normalizedHref =
    href.endsWith("/") && href !== "/" ? href.replace(/\/+$/, "") : href;
  const normalizedPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.replace(/\/+$/, "")
      : pathname;

  if (normalizedPath === normalizedHref) return true;
  if (normalizedHref === "/") return false;

  const segmentCount = normalizedHref.split("/").filter(Boolean).length;
  if (
    segmentCount >= 2 &&
    normalizedPath.startsWith(normalizedHref + "/")
  ) {
    return true;
  }
  return false;
}

export function NavLink({
  href,
  icon: Icon,
  label,
  isCollapsed = false,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = useIsActive(href, pathname);

  return (
    <Link
      href={href}
      onClick={onClick}
      className="block"
      aria-current={isActive ? "page" : undefined}
    >
      <motion.div
        className={cn(
          "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
          "font-[family-name:var(--font-jetbrains-mono)]",
          "cursor-pointer select-none",
          isActive
            ? [
                "bg-[#E7E5E4] text-[#006666]",
                "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.12),inset_-2px_-2px_5px_rgba(255,255,255,0.75)]",
              ]
            : [
                "bg-[#E7E5E4] text-[#1E2938]/60",
                "shadow-[1px_1px_4px_rgba(0,0,0,0.08),-1px_-1px_4px_rgba(255,255,255,0.7)]",
                "hover:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.08),inset_-1px_-1px_4px_rgba(255,255,255,0.6)]",
                "hover:text-[#1E2938]",
              ]
        )}
        whileTap={{ scale: 0.97 }}
        role="menuitem"
        tabIndex={0}
      >
        {/* Active bar */}
        {isActive && (
          <motion.span
            layoutId="navActiveBar"
            className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-[#006666]"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          />
        )}

        {/* Icon */}
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-colors duration-200",
            isActive ? "text-[#006666]" : "text-[#1E2938]/40"
          )}
        />

        {/* Label */}
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="truncate tracking-wide"
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
}