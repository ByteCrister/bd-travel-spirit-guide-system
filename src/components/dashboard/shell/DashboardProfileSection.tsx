'use client';

import { format } from 'date-fns';
import { Building2, MapPin, Phone, UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CompanyInfo, OwnerInfo } from '@/types/dashboard/dashboard.type';
import { getInitials } from '@/components/dashboard/shell/dashboard-shell-utils';

const brand = {
    primary: '#006666',
    surface: '#E7E5E4',
    text: '#1E2938',
    muted: '#6B7A8D',
    shadowOut: '6px 6px 12px #c8c6c4, -6px -6px 12px #ffffff',
    shadowIn: 'inset 3px 3px 6px #c8c6c4, inset -3px -3px 6px #ffffff',
    border: 'rgba(0,102,102,0.10)',
};

type DashboardProfileSectionProps = {
    companyInfo: CompanyInfo | null | undefined;
    ownerInfo: OwnerInfo | null | undefined;
};

function ProfileCard({
    title,
    icon: Icon,
    accentColor,
    children,
}: {
    title: string;
    icon: React.ElementType;
    accentColor: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
                background: brand.surface,
                boxShadow: brand.shadowOut,
                border: `1px solid ${brand.border}`,
            }}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                style={{ background: accentColor }}
                aria-hidden
            />

            <div className="mb-4 flex items-center gap-3">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                        background: `${accentColor}18`,
                        boxShadow: brand.shadowIn,
                    }}
                >
                    <Icon className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                <p
                    className="text-sm font-bold"
                    style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                >
                    {title}
                </p>
            </div>
            {children}
        </div>
    );
}

export function DashboardProfileSection({ companyInfo, ownerInfo }: DashboardProfileSectionProps) {
    const owner = ownerInfo ?? companyInfo?.owner;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Company card */}
            <ProfileCard title="Company" icon={Building2} accentColor={brand.primary}>
                {companyInfo ? (
                    <>
                        <div className="flex gap-4">
                            {companyInfo.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={companyInfo.logoUrl}
                                    alt=""
                                    className="h-14 w-14 rounded-xl object-cover"
                                    style={{
                                        boxShadow: brand.shadowOut,
                                        border: `1px solid ${brand.border}`,
                                    }}
                                />
                            ) : (
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-xl"
                                    style={{
                                        background: 'rgba(0,102,102,0.08)',
                                        boxShadow: brand.shadowIn,
                                    }}
                                >
                                    <Building2 className="h-6 w-6" style={{ color: brand.primary }} />
                                </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                                <p
                                    className="truncate text-base font-bold leading-tight"
                                    style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                                >
                                    {companyInfo.companyName}
                                </p>
                                <p
                                    className="text-[11px]"
                                    style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                >
                                    Member since {format(new Date(companyInfo.createdAt), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>

                        {companyInfo.address && (
                            <div
                                className="mt-4 flex items-start gap-2 rounded-xl px-3 py-3"
                                style={{
                                    background: 'rgba(0,102,102,0.04)',
                                    boxShadow: brand.shadowIn,
                                    border: `1px solid ${brand.border}`,
                                }}
                            >
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: brand.primary }} aria-hidden />
                                <address
                                    className="not-italic text-xs leading-relaxed"
                                    style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                >
                                    {companyInfo.address.street ? <span>{companyInfo.address.street}, </span> : null}
                                    {companyInfo.address.city}
                                    <br />
                                    {[companyInfo.address.division, companyInfo.address.country]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    {companyInfo.address.zip ? ` · ${companyInfo.address.zip}` : null}
                                </address>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-xs" style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}>
                        No company profile loaded.
                    </p>
                )}
            </ProfileCard>

            {/* Owner card */}
            <ProfileCard title="Owner" icon={UserCircle2} accentColor="#9966cc">
                {owner ? (
                    <div className="flex gap-4">
                        <Avatar
                            className="h-14 w-14 rounded-xl"
                            style={{
                                boxShadow: brand.shadowOut,
                            }}
                        >
                            <AvatarImage src={owner.user.avatar} alt="" />
                            <AvatarFallback
                                className="rounded-xl text-sm font-bold"
                                style={{
                                    background: 'rgba(153,102,204,0.15)',
                                    color: '#9966cc',
                                    fontFamily: 'var(--font-space-mono)',
                                }}
                            >
                                {getInitials(owner.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-1">
                            <p
                                className="truncate font-bold leading-tight"
                                style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                            >
                                {owner.user.name}
                            </p>
                            <p
                                className="truncate text-xs"
                                style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                            >
                                {owner.user.email}
                            </p>
                            <p
                                className="text-[11px]"
                                style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                            >
                                Joined {format(new Date(owner.user.createdAt), 'MMMM d, yyyy')}
                            </p>
                            {owner.phone && (
                                <div className="flex items-center gap-1.5 pt-1">
                                    <Phone className="h-3 w-3 shrink-0" style={{ color: brand.primary }} aria-hidden />
                                    <span className="text-xs" style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}>
                                        {owner.phone}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-xs" style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}>
                        No owner on file.
                    </p>
                )}
            </ProfileCard>
        </div>
    );
}