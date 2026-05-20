'use client';

import Dashboard from './Dashboard';

export default function DashboardShell() {
    return (
        <main
            className="min-h-screen"
            style={{
                background: 'linear-gradient(135deg, #E7E5E4 0%, #F1F2F5 50%, #e0f0f0 100%)',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
        >
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <Dashboard />
            </div>
        </main>
    );
}