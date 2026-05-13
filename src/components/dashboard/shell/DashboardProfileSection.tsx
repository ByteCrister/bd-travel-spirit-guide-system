'use client';

import { format } from 'date-fns';
import { Building2, Phone, UserCircle2 } from 'lucide-react';
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
            <Card className="rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">Company</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {companyInfo ? (
                        <>
                            <div className="flex gap-4">
                                {companyInfo.logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element -- remote logo URL from API
                                    <img
                                        src={companyInfo.logoUrl}
                                        alt=""
                                        className="h-14 w-14 rounded-xl border object-cover shadow-sm"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className="truncate text-lg font-semibold leading-tight">
                                        {companyInfo.companyName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Member since {format(new Date(companyInfo.createdAt), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                            {companyInfo.address ? (
                                <address className="not-italic text-sm leading-relaxed text-muted-foreground">
                                    {companyInfo.address.street ? <span>{companyInfo.address.street}, </span> : null}
                                    {companyInfo.address.city}
                                    <br />
                                    {[companyInfo.address.division, companyInfo.address.country]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    {companyInfo.address.zip ? ` · ${companyInfo.address.zip}` : null}
                                </address>
                            ) : null}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No company profile loaded.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <UserCircle2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">Owner</CardTitle>
                </CardHeader>
                <CardContent>
                    {owner ? (
                        <div className="flex gap-4">
                            <Avatar className="h-14 w-14 rounded-xl border shadow-sm">
                                <AvatarImage src={owner.user.avatar} alt="" />
                                <AvatarFallback className="rounded-xl text-sm font-semibold">
                                    {getInitials(owner.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="truncate font-semibold leading-tight">{owner.user.name}</p>
                                <p className="truncate text-sm text-muted-foreground">{owner.user.email}</p>
                                <p className="text-xs text-muted-foreground">
                                    Joined {format(new Date(owner.user.createdAt), 'MMMM d, yyyy')}
                                </p>
                                {owner.phone ? (
                                    <p className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                        {owner.phone}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No owner on file.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
