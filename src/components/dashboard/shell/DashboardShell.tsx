'use client';

import Dashboard from './Dashboard';

export default function DashboardShell() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/50 dark:from-background dark:via-background dark:to-orange-950/25">
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <Dashboard />
            </div>
        </main>
    );
}
