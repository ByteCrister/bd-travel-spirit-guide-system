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
      <BreadcrumbList className={className ?? ""}>
        {breadcrumbs.map(({ href, label }, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={href}
                    aria-current={isLast ? "page" : undefined}
                    className={clsx(
                      isLast
                        ? "font-display text-muted-foreground cursor-default font-semibold"
                        : "font-sans hover:underline text-foreground",
                      "transition-colors"
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