'use client';

import React from 'react'
import LoadingBdTravel from '../global/LoadingBDTravel';
import { Toaster } from '../ui/sonner';
import { DashboardProvider } from './DashboardProvider';

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    const loading = false;

    if (loading) return <LoadingBdTravel />;

    return (
        <DashboardProvider>
            {children}
            <Toaster
                position="bottom-right"
                richColors
                duration={5000}
            />
        </DashboardProvider>
    )
}

export default GlobalProvider;