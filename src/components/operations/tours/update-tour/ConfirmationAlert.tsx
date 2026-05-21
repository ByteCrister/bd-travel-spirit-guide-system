'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Send, ShieldCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const NEU = {
    surface: '#E7E5E4',
    card: 'bg-[#E7E5E4] rounded-2xl shadow-[8px_8px_20px_#c8c6c4,-8px_-8px_20px_#ffffff] border-0',
    iconBox: 'rounded-xl shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] flex items-center justify-center bg-[#E7E5E4]',
    primaryText: 'text-[#1E2938]',
    mutedText: 'text-[#718096]',
    labelFont: 'font-[Space_Mono,monospace] tracking-wide',
    bodyFont: 'font-[JetBrains_Mono,monospace]',
    btnCancel: [
        'bg-[#E7E5E4]',
        'shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff]',
        'hover:shadow-[2px_2px_6px_#c8c6c4,-2px_-2px_6px_#ffffff]',
        'active:shadow-[inset_3px_3px_8px_#c8c6c4,inset_-3px_-3px_8px_#ffffff]',
        'border-0 rounded-xl transition-all duration-200',
        'text-[#4a5568] font-semibold',
    ].join(' '),
    btnSubmit: [
        'bg-[#006666] text-white rounded-xl',
        'shadow-[4px_4px_10px_#004d4d,-4px_-4px_10px_#008080]',
        'hover:shadow-[2px_2px_6px_#004d4d,-2px_-2px_6px_#008080]',
        'active:shadow-[inset_2px_2px_6px_#004d4d,inset_-2px_-2px_6px_#008080]',
        'border-0 transition-all duration-200 font-semibold',
    ].join(' '),
    divider: 'border-t border-[#d1cfcd]',
};

interface ConfirmationAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export default function ConfirmationAlert({
    open,
    onOpenChange,
    onConfirm,
    title = 'Submit for Approval',
    description = 'Are you sure you want to submit this tour for approval? Once submitted, it will be reviewed by moderators.',
    confirmText = 'Submit for Approval',
    cancelText = 'Cancel',
    isLoading = false,
}: ConfirmationAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                className={`${NEU.card} p-0 max-w-md w-full gap-0 overflow-hidden`}
                style={{ background: NEU.surface }}
            >
                {/* ── Close hint bar ──────────────────────────────────────────── */}
                <div className="flex justify-end px-5 pt-4">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => onOpenChange(false)}
                        className={[
                            'w-8 h-8 flex items-center justify-center rounded-lg',
                            'bg-[#E7E5E4] shadow-[3px_3px_7px_#c8c6c4,-3px_-3px_7px_#ffffff]',
                            'hover:shadow-[1px_1px_4px_#c8c6c4,-1px_-1px_4px_#ffffff]',
                            'active:shadow-[inset_2px_2px_5px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]',
                            'transition-all duration-200 disabled:opacity-40',
                        ].join(' ')}
                        aria-label="Close"
                    >
                        <X className="h-4 w-4 text-[#718096]" />
                    </button>
                </div>

                {/* ── Header ─────────────────────────────────────────────────── */}
                <AlertDialogHeader className="px-6 pb-5 pt-1">
                    <div className="flex items-center gap-3 mb-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.35, type: 'spring', stiffness: 200 }}
                            className={`${NEU.iconBox} w-12 h-12 flex-shrink-0`}
                        >
                            <ShieldCheck className="w-5 h-5" style={{ color: '#006666' }} />
                        </motion.div>
                        <AlertDialogTitle
                            className={`text-lg sm:text-xl font-bold ${NEU.primaryText} ${NEU.labelFont} leading-tight`}
                        >
                            {title}
                        </AlertDialogTitle>
                    </div>

                    {/* Inner well for description */}
                    <div
                        className="rounded-xl px-4 py-3"
                        style={{
                            background: NEU.surface,
                            boxShadow: 'inset 3px 3px 8px #c8c6c4, inset -3px -3px 8px #ffffff',
                        }}
                    >
                        <AlertDialogDescription
                            className={`text-sm leading-relaxed ${NEU.mutedText} ${NEU.bodyFont}`}
                        >
                            {description}
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>

                {/* ── Footer ─────────────────────────────────────────────────── */}
                <AlertDialogFooter
                    className={`px-6 py-5 ${NEU.divider} flex flex-col-reverse sm:flex-row gap-3`}
                >
                    <AlertDialogCancel
                        disabled={isLoading}
                        className={`${NEU.btnCancel} h-11 px-6 text-sm flex-1 sm:flex-none disabled:opacity-50 ${NEU.labelFont}`}
                    >
                        {cancelText}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`${NEU.btnSubmit} h-11 px-6 text-sm flex-1 sm:flex-none flex items-center justify-center gap-2 disabled:opacity-60 ${NEU.labelFont}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Submitting…</span>
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                <span>{confirmText}</span>
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}