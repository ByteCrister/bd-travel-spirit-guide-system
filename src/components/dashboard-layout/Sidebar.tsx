"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Headphones,
  FileText,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  ShieldQuestion,
  User,
  MessageSquare,
  Compass,
  Settings,
  CreditCard,
} from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useCurrentUserStore } from "@/store/current-user.store";
import { USER_ROLE } from "@/constants/current-user/user.const";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  isOpen?: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    icon: Home,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/profile", label: "Profile", icon: User },
    ],
  },
  {
    title: "Operations",
    icon: FileText,
    items: [
      { href: "/operations/tours", label: "Tours", icon: FileText },
      { href: "/operations/bookings", label: "Bookings", icon: BookOpen },
      { href: "/operations/reports", label: "Reports", icon: FileText },
      { href: "/operations/reviews", label: "Reviews", icon: MessageSquare },
    ],
  },
  {
    title: "Support",
    icon: Headphones,
    items: [
      {
        href: "/support/travelers",
        label: "Customer Support",
        icon: Headphones,
      },
      { href: "/support/faqs", label: "FAQs", icon: FileText },
      {
        href: "/support/reset-password-requests",
        label: "Password Requests",
        icon: ShieldQuestion,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Users",
    icon: Users,
    items: [
      {
        href: "/users/employees",
        label: "Employees",
        icon: Users,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      {
        href: "/settings/payment-accounts",
        label: "Payment Accounts",
        icon: CreditCard,
        adminOnly: true,
      },
    ],
  },
];

export function Sidebar({
  isMobile = false,
  onClose,
  isOpen = false,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.map((g) => g.title),
  );
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  const { baseUser } = useCurrentUserStore();
  const isGuide = baseUser?.role === USER_ROLE.GUIDE;

  useEffect(() => {
    const activeGroup = navigationGroups.find((group) =>
      group.items.some((item) => pathname.startsWith(item.href)),
    );
    // if (activeGroup) setExpandedGroups([activeGroup.title]);
    if (activeGroup) {
      setExpandedGroups((prev) =>
        prev.includes(activeGroup.title) ? prev : [...prev, activeGroup.title],
      );
    }

    if (pathname.startsWith("/customer-support") && !hasAutoCollapsed) {
      if (isMobile && isOpen && onClose) onClose();
      else if (!isMobile && !isCollapsed) setIsCollapsed(true);
      setHasAutoCollapsed(true);
    } else if (!pathname.startsWith("/customer-support")) {
      setHasAutoCollapsed(false);
    }
  }, [
    hasAutoCollapsed,
    isCollapsed,
    isMobile,
    isOpen,
    onClose,
    pathname,
    setIsCollapsed,
  ]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupTitle)
        ? prev.filter((t) => t !== groupTitle)
        : [...prev, groupTitle],
    );
  };

  const sidebarVariants = {
    expanded: { width: 288 },
    collapsed: { width: 80 },
  };

  const mobileVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };

  return (
    <motion.aside
      initial={false}
      animate={
        isMobile
          ? isOpen
            ? "open"
            : "closed"
          : isCollapsed
            ? "collapsed"
            : "expanded"
      }
      variants={isMobile ? mobileVariants : sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col",
        "font-[family-name:var(--font-jetbrains-mono)]",
        // Neumorphic surface
        "bg-[#E7E5E4]",
        "border-r border-[#d0cecc]",
        // Outer shadow to create raised effect
        "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]",
        isMobile ? "w-80" : "w-80 lg:relative lg:z-auto",
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div
        className={cn(
          "border-b border-[#d0cecc] p-4",
          isCollapsed
            ? "flex flex-col items-center gap-3"
            : "flex items-center justify-between",
        )}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              {/* Brand icon — neumorphic inset pill */}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  "bg-[#E7E5E4]",
                  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]",
                )}
              >
                <Compass className="h-5 w-5 text-[#006666]" strokeWidth={2} />
              </div>

              <div>
                <h1 className="font-[family-name:var(--font-space-mono)] text-base font-bold tracking-tight text-[#1E2938]">
                  BD Travel Spirit
                </h1>
                <p className="text-[10px] tracking-widest uppercase text-[#006666] font-semibold">
                  Guide Dashboard
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-[#E7E5E4]",
                "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]",
              )}
            >
              <Compass className="h-6 w-6 text-[#006666]" strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        {!isMobile && (
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "bg-[#E7E5E4] text-[#1E2938]",
              "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
              "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
              "transition-all duration-200 focus:outline-none",
              isCollapsed && "mt-2",
            )}
            whileTap={{ scale: 0.95 }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </motion.button>
        )}

        {isMobile && (
          <motion.button
            onClick={onClose}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              "bg-[#E7E5E4] text-[#1E2938]",
              "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
              "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
              "transition-all duration-200 focus:outline-none",
            )}
            whileTap={{ scale: 0.95 }}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#c8c6c4] scrollbar-track-transparent">
        <div className={cn("space-y-2", isCollapsed && "space-y-3")}>
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly) return isGuide;
              return true;
            });
            if (visibleItems.length === 0) return null;

            const isExpanded = expandedGroups.includes(group.title);

            return (
              <div key={group.title}>
                {/* Group Header */}
                <motion.button
                  onClick={() => toggleGroup(group.title)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-200",
                    "font-[family-name:var(--font-space-mono)]",
                    isExpanded
                      ? [
                          "text-[#006666]",
                          "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                          "bg-[#E7E5E4]",
                        ]
                      : [
                          "text-[#1E2938]/60",
                          "bg-[#E7E5E4]",
                          "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
                          "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                          "hover:text-[#1E2938]",
                        ],
                    isCollapsed && "justify-center px-2 py-3",
                  )}
                  whileTap={{ scale: 0.97 }}
                  aria-expanded={isExpanded}
                  aria-controls={`nav-group-${group.title.toLowerCase()}`}
                >
                  <group.icon
                    className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      isCollapsed ? "h-5 w-5" : "h-4 w-4",
                      isExpanded ? "text-[#006666]" : "text-[#1E2938]/50",
                    )}
                  />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-1 items-center justify-between"
                      >
                        <span>{group.title}</span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Group Items */}
                <AnimatePresence>
                  {!isCollapsed && isExpanded && (
                    <motion.div
                      id={`nav-group-${group.title.toLowerCase()}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="ml-5 mt-1.5 space-y-1 border-l-2 border-[#006666]/20 pl-3"
                      role="group"
                      aria-label={`${group.title} navigation items`}
                    >
                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.href}
                          href={item.href}
                          icon={item.icon}
                          label={item.label}
                          onClick={isMobile ? onClose : undefined}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#d0cecc] p-4">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              key="expanded-footer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <p className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#1E2938]/40 uppercase">
                Travel Spirit Admin v1.0
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-footer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  "bg-[#E7E5E4]",
                  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                )}
              >
                <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#006666]">
                  TS
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
