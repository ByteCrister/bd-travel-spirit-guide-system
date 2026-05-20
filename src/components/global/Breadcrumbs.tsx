"use client";

import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import clsx from "clsx";
import React from "react";

export type BreadcrumbItemType = { label: string; href: string };

type BreadcrumbsProps = {
    items: BreadcrumbItemType[];
    className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    const breadcrumbs = React.useMemo(() => items, [items]);

    return (
        <Breadcrumb>
            <BreadcrumbList
                className={clsx(
                    "font-mono text-xs tracking-wide uppercase",
                    className
                )}
                style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
            >
                {breadcrumbs.map(({ href, label }, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <React.Fragment key={href}>
                            {index > 0 && (
                                <BreadcrumbSeparator
                                    className="text-[#1E2938]/30 select-none"
                                />
                            )}
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={href}
                                        aria-current={isLast ? "page" : undefined}
                                        className={clsx(
                                            "transition-colors duration-150 rounded px-1 py-0.5",
                                            isLast
                                                ? "text-[#1E2938]/50 cursor-default font-semibold pointer-events-none"
                                                : [
                                                    "text-[#006666] font-medium",
                                                    "hover:text-[#004d4d]",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-1",
                                                ]
                                        )}
                                    >
                                        {label}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}