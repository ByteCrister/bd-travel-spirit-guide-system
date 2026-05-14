'use client';

import { format } from 'date-fns';
import { Building2, MapPin, Phone, UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanyInfo, OwnerInfo } from '@/types/dashboard/dashboard.type';
import { getInitials } from '@/components/dashboard/shell/dashboard-shell-utils';

type DashboardProfileSectionProps = {
    companyInfo: CompanyInfo | null | undefined;
    ownerInfo: OwnerInfo | null | undefined;
};

export function DashboardProfileSection({ companyInfo, ownerInfo }: DashboardProfileSectionProps) {
    const owner = ownerInfo ?? companyInfo?.owner;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Company card */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/70 to-slate-100/50 shadow-md shadow-slate-200/50 dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/60 dark:shadow-slate-900/40">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-500 via-blue-400 to-cyan-300 opacity-70" aria-hidden />

                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20">
                        <Building2 className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Company</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {companyInfo ? (
                        <>
                            <div className="flex gap-4">
                                {companyInfo.logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={companyInfo.logoUrl}
                                        alt=""
                                        className="h-14 w-14 rounded-xl border border-slate-200 object-cover shadow-sm dark:border-slate-700"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-700">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className="truncate text-lg font-bold leading-tight text-slate-900 dark:text-slate-50">
                                        {companyInfo.companyName}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        Member since {format(new Date(companyInfo.createdAt), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                            </div>

                            {companyInfo.address ? (
                                <div className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-800/50">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                                    <address className="not-italic text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        {companyInfo.address.street ? <span>{companyInfo.address.street}, </span> : null}
                                        {companyInfo.address.city}
                                        <br />
                                        {[companyInfo.address.division, companyInfo.address.country]
                                            .filter(Boolean)
                                            .join(' · ')}
                                        {companyInfo.address.zip ? ` · ${companyInfo.address.zip}` : null}
                                    </address>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <p className="text-sm text-slate-400">No company profile loaded.</p>
                    )}
                </CardContent>
            </Card>

            {/* Owner card */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/70 to-slate-100/50 shadow-md shadow-slate-200/50 dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/60 dark:shadow-slate-900/40">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-300 opacity-70" aria-hidden />

                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
                        <UserCircle2 className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Owner</CardTitle>
                </CardHeader>

                <CardContent>
                    {owner ? (
                        <div className="flex gap-4">
                            <Avatar className="h-14 w-14 rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
                                <AvatarImage src={owner.user.avatar} alt="" />
                                <AvatarFallback className="rounded-xl bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {getInitials(owner.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="truncate font-bold leading-tight text-slate-900 dark:text-slate-50">
                                    {owner.user.name}
                                </p>
                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                    {owner.user.email}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Joined {format(new Date(owner.user.createdAt), 'MMMM d, yyyy')}
                                </p>
                                {owner.phone ? (
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{owner.phone}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No owner on file.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}