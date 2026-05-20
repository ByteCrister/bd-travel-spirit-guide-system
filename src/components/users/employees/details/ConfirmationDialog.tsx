"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, RotateCcw, AlertTriangle, CheckCircle2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (s: boolean) => void;
  onConfirm: (reason: string) => void | Promise<void>;
  mode: "delete" | "restore";
  employeeName: string;
}

// Neumorphic shadow constants – tweak these to adjust extrusion depth
const NEU_RAISED =
  "8px 8px 16px #B0AEAD, -8px -8px 16px #FFFFFF";
const NEU_PRESSED =
  "inset 4px 4px 8px #B0AEAD, inset -4px -4px 8px #FFFFFF";

export default function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  employeeName,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const validateReason = (value: string): string => {
    if (!value.trim()) return "Reason is required";
    if (value.trim().length < 10)
      return "Reason must be at least 10 characters";
    if (value.trim().length > 500)
      return "Reason must be less than 500 characters";
    return "";
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    if (touched) {
      setError(validateReason(value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateReason(reason));
  };

  const resetForm = () => {
    setReason("");
    setError("");
    setTouched(false);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    setTouched(true);

    const validationError = validateReason(reason);
    if (mode === "delete" && validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await onConfirm(reason.trim());
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error(`${mode} failed:`, err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const config = {
    delete: {
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Delete Employee Record?",
      description:
        "This will soft delete the employee record. The record can be restored later if needed.",
      infoBg: "bg-amber-50 border-amber-200",
      infoText: "text-amber-800",
      accentColor: "#FF2157", // danger token
      buttonIcon: Flame,
      buttonText: "Delete Record",
      loadingText: "Deleting...",
      placeholder: "Enter reason for deletion (minimum 10 characters)...",
    },
    restore: {
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Restore Employee Record?",
      description:
        "This will restore the employee record and make it active again in the system.",
      infoBg: "bg-green-50 border-green-200",
      infoText: "text-green-800",
      accentColor: "#00A63D", // success token
      buttonIcon: RotateCcw,
      buttonText: "Restore Record",
      loadingText: "Restoring...",
      placeholder: "Enter reason for restoration (minimum 10 characters)...",
    },
  };

  const current = config[mode];
  const Icon = current.icon;
  const ButtonIcon = current.buttonIcon;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}
    >
      <AlertDialogContent
        className="sm:max-w-md p-6 border-0"
        style={{
          background: "#E7E5E4", // surface token
          boxShadow: NEU_RAISED,
          borderRadius: "1.5rem",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              className="space-y-6"
            >
              <AlertDialogHeader>
                {/* Icon circle – convex neumorphic look */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className={`mx-auto mb-4 w-16 h-16 rounded-full ${current.iconBg} flex items-center justify-center`}
                  style={{
                    boxShadow: NEU_RAISED,
                  }}
                >
                  <Icon className={`h-8 w-8 ${current.iconColor}`} />
                </motion.div>

                <AlertDialogTitle
                  className="text-center text-xl font-bold"
                  style={{ color: "#1E2938" }}
                >
                  {current.title}
                </AlertDialogTitle>

                <AlertDialogDescription asChild>
                  <div className="space-y-3 text-center">
                    <span
                      className="text-sm"
                      style={{ color: "#1E2938", opacity: 0.7 }}
                    >
                      {current.description}
                    </span>

                    {employeeName && (
                      <div
                        className={`mt-3 p-3 ${current.infoBg} rounded-xl border`}
                        style={{
                          boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.05), inset -2px -2px 4px rgba(255,255,255,0.5)",
                        }}
                      >
                        <div
                          className={`text-sm font-medium ${current.infoText}`}
                        >
                          Employee: {employeeName}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              {mode === "delete" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium mb-1"
                      style={{ color: "#1E2938" }}
                    >
                      Reason *
                    </label>

                    <textarea
                      id="reason"
                      value={reason}
                      onChange={handleReasonChange}
                      onBlur={handleBlur}
                      placeholder={current.placeholder}
                      rows={4}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl resize-none transition-shadow duration-200"
                      style={{
                        background: "#E7E5E4",
                        border: "none",
                        boxShadow: error && touched
                          ? "inset 4px 4px 8px #B0AEAD, inset -4px -4px 8px #FFFFFF, 0 0 0 2px #FF2157"
                          : NEU_PRESSED,
                        color: "#1E2938",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        if (!error || !touched) {
                          e.currentTarget.style.boxShadow = "inset 4px 4px 8px #B0AEAD, inset -4px -4px 8px #FFFFFF, 0 0 0 2px #006666";
                        }
                      }}
                    />

                    <div className="flex justify-between mt-1.5">
                      {error && touched && (
                        <p className="text-sm" style={{ color: "#FF2157" }}>
                          {error}
                        </p>
                      )}
                      <p
                        className={`text-sm ml-auto ${
                          reason.length > 500
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {reason.length}/500
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <AlertDialogFooter className="flex-row justify-center gap-3 mt-4 sm:mt-6">
                <AlertDialogCancel
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="sm:w-auto inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2"
                  style={{
                    background: "#E7E5E4",
                    boxShadow: NEU_RAISED,
                    color: "#1E2938",
                    border: "none",
                    opacity: isLoading ? 0.5 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                  onMouseDown={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.boxShadow = NEU_PRESSED;
                    }
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = NEU_RAISED;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = NEU_RAISED;
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </AlertDialogCancel>

                {/* Primary action button – neumorphic with semantic color */}
                <button
                  type="submit"
                  disabled={isLoading || !!error}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-bold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2"
                  style={{
                    background: "#E7E5E4",
                    boxShadow: isLoading ? NEU_PRESSED : NEU_RAISED,
                    color: current.accentColor,
                    border: "none",
                    opacity: isLoading || !!error ? 0.7 : 1,
                    cursor: isLoading || !!error ? "not-allowed" : "pointer",
                  }}
                  onMouseDown={(e) => {
                    if (!isLoading && !error) {
                      e.currentTarget.style.boxShadow = NEU_PRESSED;
                    }
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = NEU_RAISED;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = NEU_RAISED;
                  }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                      />
                      {current.loadingText}
                    </>
                  ) : (
                    <>
                      <ButtonIcon className="mr-2 h-4 w-4" />
                      {current.buttonText}
                    </>
                  )}
                </button>
              </AlertDialogFooter>
            </form>
          </motion.div>
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  );
}