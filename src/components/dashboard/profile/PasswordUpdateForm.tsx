"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Key, RefreshCw, Shield, CheckCircle2, XCircle, AlertTriangle, Lock, Zap } from "lucide-react";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { useCurrentUserStore } from "@/store/current-user.store";

// Reusable neumorphic input with toggle
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  show,
  onToggle,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <div className="rounded-xl bg-[#E7E5E4]
        shadow-[inset_4px_4px_9px_rgba(0,0,0,0.13),inset_-4px_-4px_9px_rgba(255,255,255,0.72)]">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-13 px-4 pr-12 py-3.5 text-sm font-medium text-[#1E2938]
            bg-transparent rounded-xl outline-none placeholder:text-[#1E2938]/30
            font-[var(--font-jetbrains-mono)] disabled:opacity-40"
        />
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
          text-[#1E2938]/40 hover:text-[#1E2938]/70
          transition-colors duration-150"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function PasswordUpdateForm() {
  const { updateUserPassword, updatePasswordMeta } = useCurrentUserStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGeneratePassword = () => {
    const p = generateStrongPassword();
    setFormData((prev) => ({ ...prev, newPassword: p, confirmPassword: p }));
    setShowNew(true);
    setShowConfirm(true);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { label: "", pct: 0, color: "bg-[#E7E5E4]", textColor: "text-[#1E2938]/40" };
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    if (score < 40) return { label: "Weak", pct: score, color: "bg-[#FF2157]", textColor: "text-[#FF2157]" };
    if (score < 70) return { label: "Medium", pct: score, color: "bg-[#FE9900]", textColor: "text-[#FE9900]" };
    return { label: "Strong", pct: score, color: "bg-[#00A63D]", textColor: "text-[#00A63D]" };
  };

  const strength = getPasswordStrength(formData.newPassword);

  const requirements = [
    { met: formData.newPassword.length >= 8, label: "8+ characters" },
    { met: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword), label: "Upper & lower" },
    { met: /\d/.test(formData.newPassword), label: "Number" },
    { met: /[^a-zA-Z0-9]/.test(formData.newPassword), label: "Special char" },
  ];

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) { setError("New passwords do not match"); return false; }
    if (formData.newPassword.length < 8) { setError("Password must be at least 8 characters"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setShowSuccess(false);
    if (!validateForm()) return;
    await updateUserPassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
    if (!updatePasswordMeta?.error) {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const Field = ({ label, id, icon: Icon, ...rest }: {
    label: string; id: string; icon: React.ElementType;
    value: string; onChange: (v: string) => void; placeholder: string;
    disabled?: boolean; show: boolean; onToggle: () => void;
  }) => (
    <div className="space-y-2.5">
      <label htmlFor={id} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest
        text-[#1E2938]/50 font-[var(--font-space-mono)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      <PasswordInput id={id} {...rest} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Card */}
      <div className="rounded-2xl bg-[#E7E5E4]
        shadow-[10px_10px_24px_rgba(0,0,0,0.16),-8px_-8px_20px_rgba(255,255,255,0.9)]
        overflow-hidden">

        {/* Header */}
        <div className="px-8 py-7 border-b border-[#1E2938]/8 bg-[#E7E5E4]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-[#E7E5E4]
              shadow-[5px_5px_12px_rgba(0,0,0,0.14),-4px_-4px_10px_rgba(255,255,255,0.85)]">
              <Shield className="h-6 w-6 text-[#006666]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E2938] font-[var(--font-space-mono)] tracking-tight">
                Change Password
              </h2>
              <p className="text-sm text-[#1E2938]/50 mt-0.5 font-[var(--font-jetbrains-mono)]">
                Keep your account secure
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-7">
          {/* Current password */}
          <Field
            label="Current Password" id="currentPassword" icon={Key}
            value={formData.currentPassword}
            onChange={(v) => setFormData((p) => ({ ...p, currentPassword: v }))}
            placeholder="Enter current password"
            disabled={updatePasswordMeta?.loading}
            show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)}
          />

          {/* New password + generate */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="newPassword" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest
                text-[#1E2938]/50 font-[var(--font-space-mono)]">
                <Lock className="h-3.5 w-3.5" />
                New Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  text-[#006666] font-[var(--font-space-mono)]
                  bg-[#E7E5E4]
                  shadow-[3px_3px_7px_rgba(0,0,0,0.12),-2px_-2px_5px_rgba(255,255,255,0.8)]
                  hover:shadow-[4px_4px_9px_rgba(0,0,0,0.15),-3px_-3px_7px_rgba(255,255,255,0.85)]
                  active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.6)]
                  transition-all duration-150"
              >
                <RefreshCw className="h-3 w-3" />
                Generate
              </button>
            </div>
            <PasswordInput
              id="newPassword" value={formData.newPassword}
              onChange={(v) => setFormData((p) => ({ ...p, newPassword: v }))}
              placeholder="Enter new password"
              disabled={updatePasswordMeta?.loading}
              show={showNew} onToggle={() => setShowNew(!showNew)}
            />

            {/* Strength bar */}
            <AnimatePresence>
              {formData.newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-[#1E2938]/50 font-[var(--font-space-mono)]">
                      <Zap className="h-3 w-3" /> Strength
                    </span>
                    <span className={`text-xs font-bold font-[var(--font-space-mono)] ${strength.textColor}`}>
                      {strength.label}
                    </span>
                  </div>
                  {/* Track — inset */}
                  <div className="h-2 rounded-full bg-[#E7E5E4]
                    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.65)]
                    overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.pct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`h-full rounded-full ${strength.color}`}
                    />
                  </div>

                  {/* Requirements grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {requirements.map((req, i) => (
                      <motion.div
                        key={req.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs
                          font-[var(--font-jetbrains-mono)]
                          bg-[#E7E5E4]
                          ${req.met
                            ? "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.09),inset_-2px_-2px_4px_rgba(255,255,255,0.65)] text-[#00A63D]"
                            : "shadow-[3px_3px_7px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,0.75)] text-[#1E2938]/40"
                          }`}
                      >
                        {req.met
                          ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          : <XCircle className="h-3.5 w-3.5 shrink-0" />
                        }
                        {req.label}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm password */}
          <div className="space-y-2.5">
            <label htmlFor="confirmPassword" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest
              text-[#1E2938]/50 font-[var(--font-space-mono)]">
              <Lock className="h-3.5 w-3.5" />
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword" value={formData.confirmPassword}
              onChange={(v) => setFormData((p) => ({ ...p, confirmPassword: v }))}
              placeholder="Confirm new password"
              disabled={updatePasswordMeta?.loading}
              show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)}
            />
            <AnimatePresence>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-[#FF2157]
                    font-[var(--font-jetbrains-mono)] border-l-2 border-[#FF2157]
                    bg-[#E7E5E4] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.09),inset_-2px_-2px_4px_rgba(255,255,255,0.65)]">
                  <XCircle className="h-4 w-4 shrink-0" /> Passwords do not match
                </motion.div>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-[#00A63D]
                    font-[var(--font-jetbrains-mono)] border-l-2 border-[#00A63D]
                    bg-[#E7E5E4] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.09),inset_-2px_-2px_4px_rgba(255,255,255,0.65)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Passwords match
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#00A63D]
                  font-[var(--font-jetbrains-mono)] border-l-2 border-[#00A63D]
                  bg-[#E7E5E4] shadow-[inset_3px_3px_7px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.65)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Password updated successfully!
                </div>
              </motion.div>
            )}
            {(error || updatePasswordMeta?.error) && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#FF2157]
                  font-[var(--font-jetbrains-mono)] border-l-2 border-[#FF2157]
                  bg-[#E7E5E4] shadow-[inset_3px_3px_7px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.65)]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error || updatePasswordMeta?.error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              updatePasswordMeta?.loading ||
              !formData.currentPassword || !formData.newPassword || !formData.confirmPassword ||
              formData.newPassword !== formData.confirmPassword
            }
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white
              font-[var(--font-space-mono)] tracking-wide
              bg-[#006666]
              shadow-[5px_5px_12px_rgba(0,0,0,0.2),-3px_-3px_8px_rgba(255,255,255,0.4)]
              hover:bg-[#005555]
              active:shadow-[inset_3px_3px_9px_rgba(0,0,0,0.25)]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150"
          >
            <AnimatePresence mode="wait">
              {updatePasswordMeta?.loading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" /> Update Password
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}