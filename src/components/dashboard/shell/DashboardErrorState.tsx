'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

const brand = {
    primary: '#006666',
    danger: '#FF2157',
    surface: '#E7E5E4',
    text: '#1E2938',
    muted: '#6B7A8D',
    shadowOut: '8px 8px 16px #c8c6c4, -8px -8px 16px #ffffff',
    shadowIn: 'inset 4px 4px 8px #c8c6c4, inset -4px -4px 8px #ffffff',
    border: 'rgba(255,33,87,0.12)',
};

type DashboardErrorStateProps = {
    message: string;
    onRetry: () => void;
};

export function DashboardErrorState({ message, onRetry }: DashboardErrorStateProps) {
    return (
        <div
            className="relative overflow-hidden rounded-3xl px-6 py-16 text-center"
            style={{
                background: brand.surface,
                boxShadow: brand.shadowOut,
                border: `1px solid ${brand.border}`,
            }}
        >
            {/* Danger top accent */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${brand.danger}, #ff6688, ${brand.danger})` }}
                aria-hidden
            />

            <div className="relative flex flex-col items-center gap-6">
                {/* Icon */}
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                        background: 'rgba(255,33,87,0.08)',
                        boxShadow: brand.shadowIn,
                    }}
                >
                    <AlertTriangle className="h-8 w-8" style={{ color: brand.danger }} aria-hidden />
                </div>

                <div className="max-w-md space-y-2">
                    <h2
                        className="text-xl font-bold tracking-tight"
                        style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                    >
                        Something went wrong
                    </h2>
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                    >
                        {message}
                    </p>
                </div>

                <button
                    onClick={onRetry}
                    className="flex h-11 items-center gap-2 rounded-full px-8 text-xs font-bold transition-all"
                    style={{
                        background: brand.surface,
                        boxShadow: brand.shadowOut,
                        border: `1px solid rgba(255,33,87,0.2)`,
                        color: brand.danger,
                        fontFamily: 'var(--font-space-mono)',
                        letterSpacing: '0.08em',
                    }}
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Try again
                </button>
            </div>
        </div>
    );
}