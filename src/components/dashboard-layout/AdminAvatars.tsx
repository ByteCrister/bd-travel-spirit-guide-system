"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useOnlineAgentsStore } from "@/store/online-agents.store";
import { Agent } from "@/constants/current-user/agent";

export function AdminAvatars() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredAdmin, setHoveredAdmin] = useState<string | null>(null);

  const { agents, fetchOnlineAgents } = useOnlineAgentsStore();

  useEffect(() => {
    fetchOnlineAgents();
  }, [fetchOnlineAgents]);

  const onlineAdmins: Agent[] = Object.values(agents);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      <motion.div
        className="flex items-center"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => { setIsExpanded(false); setHoveredAdmin(null); }}
        role="group"
        aria-label="Online administrators"
      >
        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          {onlineAdmins.slice(0, 3).map((admin, index) => (
            <motion.div
              key={admin.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 220, damping: 18 }}
              className="relative"
              onMouseEnter={() => setHoveredAdmin(admin.id)}
              onMouseLeave={() => setHoveredAdmin(null)}
            >
              <div
                className={cn(
                  "rounded-full p-0.5",
                  "bg-[#E7E5E4]",
                  ""
                )}
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback className="text-[10px] bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold">
                    {getInitials(admin.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Online pulse dot */}
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#E7E5E4] bg-[#00A63D]"
                animate={{ scale: [1, 1.25, 1], opacity: [1, 0.65, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredAdmin === admin.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "absolute -top-10 left-1/2 -translate-x-1/2 z-20",
                      "px-2 py-1 rounded-lg whitespace-nowrap",
                      "font-[family-name:var(--font-space-mono)] text-[10px] font-bold",
                      "text-[#E7E5E4] bg-[#1E2938]",
                      ""
                    )}
                  >
                    {admin.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1E2938]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* +N badge */}
        {onlineAdmins.length > 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "ml-2 flex h-6 w-6 items-center justify-center rounded-full",
              "font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#006666]",
              "bg-[#E7E5E4]",
              ""
            )}
          >
            +{onlineAdmins.length - 3}
          </motion.div>
        )}
      </motion.div>

      {/* Expanded list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "absolute right-0 top-10 z-50 w-60 rounded-2xl p-2",
              "bg-[#E7E5E4]",
              "",
              "border border-[#d0cecc]"
            )}
          >
            <p className={cn(
              "px-3 pb-2 text-[10px] tracking-widest uppercase font-bold",
              "font-[family-name:var(--font-space-mono)] text-[#006666]"
            )}>
              Online Now
            </p>
            <div className="space-y-1">
              {onlineAdmins.map((admin, index) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-2 cursor-pointer transition-all duration-150",
                    "",
                    "hover:"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={admin.avatar} alt={admin.name} />
                      <AvatarFallback className="text-[10px] bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold">
                        {getInitials(admin.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#E7E5E4] bg-[#00A63D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold truncate text-[#1E2938]">
                      {admin.name}
                    </p>
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] text-[#1E2938]/45 truncate">
                      {admin.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}