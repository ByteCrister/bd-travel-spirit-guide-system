"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    EmployeesListResponse,
    EmployeesQuery,
    EmployeeSortKey,
} from "@/types/employee/employee.types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmployeeSummary } from "./EmployeeSummary";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { PaginationControls } from "./PaginationControls";
import { Breadcrumbs } from "../../global/Breadcrumbs";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { useEmployeeStore } from "@/store/employee.store";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export default function EmployeesPage() {
    const router = useRouter();
    const store = useEmployeeStore();
    const [retryLoading, setRetryLoading] = useState<string | null>(null);

    const [query, setQuery] = useState<EmployeesQuery>({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        filters: {},
    });
    const [list, setList] = useState<EmployeesListResponse | null>(null);

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Employees", href: "/users/employees" },
    ];

    useEffect(() => {
        let mounted = true;
        store
            .fetchEmployees(query)
            .then((res) => mounted && setList(res))
            .catch(() => mounted && setList(null));
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const summary = useMemo(() => {
        const docs = list?.docs ?? [];
        const total = list?.total ?? 0;
        const active = docs.filter((d) => d.status === "active").length;
        const onLeave = docs.filter((d) => d.status === "onLeave").length;
        const suspended = docs.filter((d) => d.status === "suspended").length;
        const terminated = docs.filter((d) => d.status === "terminated").length;
        return { total, active, onLeave, suspended, terminated };
    }, [list]);

    const onRowClick = async (id: string) => {
        router.push(`/users/employees/${encodeId(encodeURIComponent(id))}`);
    };

    const onSort = (sortBy: EmployeeSortKey, sortOrder: "asc" | "desc") =>
        setQuery((q) => ({ ...q, sortBy, sortOrder }));

    const onPageChange = (page: number) => setQuery((q) => ({ ...q, page }));

    const onLimitChange = (limit: number) =>
        setQuery((q) => ({ ...q, limit, page: 1 }));

    const handleRetryPayment = async (employeeId: string) => {
        setRetryLoading(employeeId);
        await store.retryEmployeeSalaryPayment(employeeId);
        setRetryLoading(null);
    };

    return (
        /* Page shell — monochromatic #E7E5E4 surface, compact density */
        <div
            className={cn(
                spaceMono.variable,
                jetbrainsMono.variable,
                "min-h-screen bg-[#E7E5E4] px-6 py-5 space-y-5"
            )}
            style={{ fontFamily: "var(--font-space-mono), monospace" }}
        >
            <Breadcrumbs items={breadcrumbItems} />

            {/* Page header */}
            <div className="flex items-center justify-between">
                <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{
                        color: "#1E2938",
                        fontFamily: "var(--font-space-mono), monospace",
                    }}
                >
                    Employees
                </h1>

                {/* Neumorphic primary action button */}
                <Button
                    onClick={() => router.push(`/users/employees/add-employee`)}
                    aria-label="Add new employee"
                    style={{
                        fontFamily: "var(--font-space-mono), monospace",
                        background: "#006666",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        border: "none",
                        borderRadius: "10px",
                        padding: "0 16px",
                        height: "36px",
                        boxShadow:
                            "4px 4px 8px rgba(0,0,0,0.18), -2px -2px 6px rgba(255,255,255,0.55)",
                        transition: "box-shadow 0.15s ease, transform 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "2px 2px 5px rgba(0,0,0,0.22), -1px -1px 4px rgba(255,255,255,0.45)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "4px 4px 8px rgba(0,0,0,0.18), -2px -2px 6px rgba(255,255,255,0.55)";
                    }}
                    onMouseDown={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "inset 2px 2px 5px rgba(0,0,0,0.2), inset -1px -1px 4px rgba(255,255,255,0.4)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px)";
                    }}
                    onMouseUp={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "4px 4px 8px rgba(0,0,0,0.18), -2px -2px 6px rgba(255,255,255,0.55)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    }}
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add employee
                </Button>
            </div>

            {/* Summary cards */}
            <EmployeeSummary summary={summary} loading={store.loadingList} />

            {/* Filters — neumorphic inset panel */}
            <div
                style={{
                    background: "#E7E5E4",
                    borderRadius: "14px",
                    boxShadow:
                        "inset 3px 3px 7px rgba(0,0,0,0.12), inset -3px -3px 7px rgba(255,255,255,0.7)",
                    padding: "16px",
                }}
            >
                <EmployeeFilters
                    query={query}
                    onChange={setQuery}
                    loading={store.loadingList}
                    fetchEnums={store.fetchEnums}
                />
            </div>

            {/* Table — elevated neumorphic card */}
            <div
                style={{
                    background: "#E7E5E4",
                    borderRadius: "16px",
                    boxShadow:
                        "6px 6px 14px rgba(0,0,0,0.14), -4px -4px 10px rgba(255,255,255,0.75)",
                    overflow: "hidden",
                }}
            >
                <EmployeeTable
                    list={list}
                    loading={store.loadingList}
                    onRowClick={onRowClick}
                    onSort={onSort}
                    sortBy={query.sortBy ?? "createdAt"}
                    sortOrder={query.sortOrder ?? "desc"}
                    onRetryPayment={handleRetryPayment}
                    retryLoading={retryLoading || undefined}
                />
            </div>

            {/* Pagination */}
            <PaginationControls
                page={list?.page ?? query.page ?? 1}
                pages={list?.pages ?? 1}
                limit={query.limit ?? 20}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
                loading={store.loadingList}
            />
        </div>
    );
}