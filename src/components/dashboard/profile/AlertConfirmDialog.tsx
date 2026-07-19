"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX, FiCheck, FiInfo } from "react-icons/fi";
import { Spinner } from "@/components/ui/spinner";

interface AlertConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "info" | "success";
  icon?: React.ReactNode;
}

const variantConfig = {
  destructive: {
    iconColor: "text-[#FF2157]",
    buttonBg: "bg-[#FF2157] hover:bg-[#e01046]",
    accentBorder: "border-l-[#FF2157]",
    glow: "",
  },
  warning: {
    iconColor: "text-[#FE9900]",
    buttonBg: "bg-[#FE9900] hover:bg-[#e08800]",
    accentBorder: "border-l-[#FE9900]",
    glow: "",
  },
  info: {
    iconColor: "text-[#006666]",
    buttonBg: "bg-[#006666] hover:bg-[#005555]",
    accentBorder: "border-l-[#006666]",
    glow: "",
  },
  success: {
    iconColor: "text-[#00A63D]",
    buttonBg: "bg-[#00A63D] hover:bg-[#008f34]",
    accentBorder: "border-l-[#00A63D]",
    glow: "",
  },
};

const defaultIcons = {
  destructive: <FiAlertTriangle className="h-5 w-5" />,
  warning: <FiAlertTriangle className="h-5 w-5" />,
  info: <FiInfo className="h-5 w-5" />,
  success: <FiCheck className="h-5 w-5" />,
};

export function AlertConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  icon,
}: AlertConfirmDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = icon || defaultIcons[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1E2938]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
              scale: { type: "spring", stiffness: 320, damping: 28 },
            }}
            className={`relative w-full max-w-md rounded-2xl overflow-hidden border-l-4 ${config.accentBorder}
                            bg-[#E7E5E4]
                            
                            ${config.glow}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-5 bg-[#E7E5E4]">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-xl text-[#1E2938]/50
                                    
                                    hover:
                                    active:
                                    transition-all duration-150"
              >
                <FiX className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 pr-8">
                <div
                  className={`p-3 rounded-xl ${config.iconColor}
                                    bg-[#E7E5E4]
                                    `}
                >
                  {IconComponent}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E2938]">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-sm text-[#1E2938]/60 mt-1 font-[var(--font-jetbrains-mono)]">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 bg-[#E7E5E4] space-y-4">
              <div className="flex gap-3">
                {/* Cancel — inset/pressed neumorphic */}
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-[#1E2938]/70
                                        bg-[#E7E5E4]
                                        
                                        hover:text-[#1E2938]
                                        active:
                                        disabled:opacity-40 transition-all duration-150"
                >
                  {cancelText}
                </button>

                {/* Confirm */}
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white
                                        ${config.buttonBg}
                                        
                                        active:
                                        disabled:opacity-40 transition-all duration-150`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner className="size-4 text-white" />
                      Processing…
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-[#1E2938]/40 font-[var(--font-jetbrains-mono)]">
                This action cannot be undone.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
