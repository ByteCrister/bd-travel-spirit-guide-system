'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X } from 'lucide-react';
import { useState } from 'react';

interface InitialDataBannerProps {
    visible: boolean;
}

/**
 * Shown when the dashboard is displaying fallback/demo data because no
 * records were found in the selected date range.
 * Dismissible per session but reappears if the store sets isInitialData again.
 */
export function InitialDataBanner({ visible }: InitialDataBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    const show = visible && !dismissed;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="initial-data-banner"
                    initial={{ opacity: 0, y: -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative flex items-start gap-3 rounded-2xl border px-4 py-3 sm:px-5 sm:py-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,102,102,0.07) 0%, rgba(6,182,212,0.07) 100%)',
                        borderColor: 'rgba(0,102,102,0.18)',
                        boxShadow: '0 2px 12px rgba(0,102,102,0.08)',
                    }}
                    role="status"
                    aria-live="polite"
                >
                    {/* Icon */}
                    <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: 'rgba(0,102,102,0.12)' }}
                    >
                        <BarChart3 className="h-4 w-4" style={{ color: '#006666' }} />
                    </span>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-sm font-semibold"
                            style={{ color: '#006666', fontFamily: 'var(--font-space-mono)' }}
                        >
                            Showing initial demo data
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: '#4B6571' }}>
                            No records were found for the selected date range. Displaying the most
                            recent available data for your company. Change the date range to load
                            specific data.
                        </p>
                    </div>

                    {/* Dismiss */}
                    <button
                        type="button"
                        aria-label="Dismiss initial data notice"
                        onClick={() => setDismissed(true)}
                        className="shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5"
                    >
                        <X className="h-4 w-4" style={{ color: '#6B7A8D' }} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
