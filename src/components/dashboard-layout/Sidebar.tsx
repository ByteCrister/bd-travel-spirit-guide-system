"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiHeadphones,
  FiFileText,
  FiImage,
  FiGift,
  FiMenu,
  FiX,
  FiChevronRight
} from "react-icons/fi";
import { FaComments } from "react-icons/fa";
import { RiDashboardLine } from "react-icons/ri"
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
}

const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    icon: FiHome,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: FiHome },
      { href: "/dashboard/overview", label: "Company Overview", icon: RiDashboardLine },
    ],
  },
  {
    title: "Operations",
    icon: FiFileText,
    items: [
      { href: "/operations/tours", label: "Tours", icon: FiFileText },
      { href: "/operations/reports", label: "Reports", icon: FiFileText },
      { href: "/operations/reviews", label: "Reviews", icon: FaComments },
    ],
  },
  {
    title: "Support",
    icon: FiHeadphones,
    items: [
      { href: "/customer-support", label: "Customer Support", icon: FiHeadphones },
      { href: "/faqs", label: "FAQs", icon: FiFileText },
    ],
  },
  {
    title: "People",
    icon: FiUsers,
    items: [
      { href: "/employees", label: "Employees", icon: FiUsers },
    ],
  },
  {
    title: "Communications",
    icon: FiGift,
    items: [
      { href: "/advertising", label: "Advertising", icon: FiImage },
      { href: "/notifications", label: "Notifications", icon: FiGift },
    ],
  },
];


export function Sidebar({
  isMobile = false,
  onClose,
  isOpen = false,
  isCollapsed,
  setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  useEffect(() => {
    // find the group that matches the current route
    const activeGroup = navigationGroups.find(group =>
      group.items.some(item => pathname.startsWith(item.href))
    );

    if (activeGroup) {
      setExpandedGroups([activeGroup.title]);
    }
    // auto-collapse logic
    if (pathname.startsWith("/customer-support") && !hasAutoCollapsed) {
      if (isMobile && isOpen && onClose) {
        onClose();
      } else if (!isMobile && !isCollapsed) {
        setIsCollapsed(true);
      }
      setHasAutoCollapsed(true);
    } else if (!pathname.startsWith("/customer-support")) {
      setHasAutoCollapsed(false);
    }

  }, [hasAutoCollapsed, isCollapsed, isMobile, isOpen, onClose, pathname, setIsCollapsed])

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(title => title !== groupTitle)
        : [...prev, groupTitle]
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
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isMobile ? (isOpen ? "open" : "closed") : (isCollapsed ? "collapsed" : "expanded")}
        variants={isMobile ? mobileVariants : sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col",
          // subtle gradient background for modern feel
          "bg-gradient-to-b from-white/95 to-slate-50/90 dark:from-slate-900/95 dark:to-slate-950/90",
          "backdrop-blur-xl",
          "border-r border-slate-200/60 dark:border-slate-800/60",
          "shadow-lg shadow-blue-500/5",
          isMobile ? "w-80" : "w-80 lg:relative lg:z-auto"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={cn(
          "border-b border-slate-200/60 dark:border-slate-700/60 p-4",
          isCollapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between"
        )}>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-blue-500/25">
                  <Image
                    src="/images/website_logo/logo_1_airplane.png"
                    alt="Website Logo"
                    width={42}
                    height={42}
                    className="object-contain"
                  />
                </div>

                <div>
                  <h1 className="font-display text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    BD Travel Spirit
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Admin Dashboard</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shadow-blue-500/25"
              >
                <Image
                  src="/images/website_logo/logo_1_airplane.png"
                  alt="Website Logo"
                  width={42}
                  height={42}
                  className="object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          {!isMobile && (
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                isCollapsed && "mt-2"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <FiMenu className="h-4 w-4" /> : <FiX className="h-4 w-4" />}
            </motion.button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <motion.button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close sidebar"
            >
              <FiX className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className={cn("space-y-2", isCollapsed && "space-y-3")}>
            {navigationGroups.map((group) => (
              <div key={group.title}>
                {/* Group Header */}
                <motion.button
                  onClick={() => toggleGroup(group.title)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "font-display tracking-wide text-slate-500 dark:text-slate-400", // group titles modern font
                    "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950 dark:hover:to-indigo-900",
                    "hover:text-blue-600 dark:hover:text-blue-400",
                    expandedGroups.includes(group.title) &&
                    "bg-blue-50/60 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 shadow-sm",
                    isCollapsed && "justify-center px-2 py-3"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-expanded={expandedGroups.includes(group.title)}
                  aria-controls={`nav-group-${group.title.toLowerCase()}`}
                >
                  <group.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 text-slate-400 transition-colors duration-200",
                      "group-hover:text-blue-500",
                      isCollapsed && "h-6 w-6"
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
                          animate={{ rotate: expandedGroups.includes(group.title) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronRight className="h-4 w-4" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Group Items */}
                <AnimatePresence>
                  {(!isCollapsed && expandedGroups.includes(group.title)) && (
                    <motion.div
                      id={`nav-group-${group.title.toLowerCase()}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="ml-6 mt-1 space-y-1"
                      role="group"
                      aria-label={`${group.title} navigation items`}
                    >
                      {group.items.map((item) => (
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
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200/60 dark:border-slate-700/60 p-4">
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div
                key="expanded-footer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-xs text-slate-600 dark:text-slate-400">
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <span className="text-xs font-bold">TS</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
