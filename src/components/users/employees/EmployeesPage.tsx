"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    EmployeesListResponse,
    EmployeesQuery,
    EmployeeSortKey,
    EmployeeListItemDTO,
} from "@/types/employee/employee.types";
import { Button } from "@/components/ui/button";
import { Plus, Banknote, X } from "lucide-react";
import { EmployeeSummary } from "./EmployeeSummary";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { PaginationControls } from "./PaginationControls";
import ManualPayrollConfirmDialog from "./ManualPayrollConfirmDialog";
import { Breadcrumbs } from "../../global/Breadcrumbs";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { useEmployeeStore } from "@/store/employee.store";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import {
    getPayableManualEmployees,
    sumPayrollAmount,
} from "@/utils/helpers/manual-payroll.helpers";

export default function EmployeesPage() {
    const router = useRouter();
    const store = useEmployeeStore();
    const [retryLoading, setRetryLoading] = useState<string | null>(null);
    const [manualPayLoading, setManualPayLoading] = useState<string | null>(null);
    const [bulkPayLoading, setBulkPayLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [payDialogEmployees, setPayDialogEmployees] = useState<EmployeeListItemDTO[]>([]);

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

    const refreshList = async () => {
        const res = await store.fetchEmployees(query, true);
        setList(res);
    };

    useEffect(() => {
        let mounted = true;
        store
            .fetchEmployees(query)
            .then((res) => mounted && setList(res))
            .catch(() => mounted && setList(null));
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const selectedEmployees = useMemo(() => {
        const docs = list?.docs ?? [];
        return docs.filter((d) => selectedIds.has(d.id));
    }, [list?.docs, selectedIds]);

    const payableOnPage = useMemo(
        () => getPayableManualEmployees(list?.docs ?? []),
        [list?.docs]
    );

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
        try {
            await store.retryEmployeeSalaryPayment(employeeId);
            await refreshList();
        } finally {
            setRetryLoading(null);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = (ids: string[]) => {
        setSelectedIds((prev) => {
            const allSelected = ids.every((id) => prev.has(id));
            const next = new Set(prev);
            if (allSelected) {
                ids.forEach((id) => next.delete(id));
            } else {
                ids.forEach((id) => next.add(id));
            }
            return next;
        });
    };

    const openPayDialog = (employees: EmployeeListItemDTO[]) => {
        setPayDialogEmployees(employees);
        setPayDialogOpen(true);
    };

    const handleManualPaySingle = (employee: EmployeeListItemDTO) => {
        openPayDialog([employee]);
    };

    const handleBulkPaySelected = () => {
        if (selectedEmployees.length === 0) return;
        openPayDialog(selectedEmployees);
    };

    const handleSelectAllPayable = () => {
        const ids = payableOnPage.map((e) => e.id);
        setSelectedIds(new Set(ids));
    };

    const handleConfirmManualPay = async (manualReference?: string) => {
        const employees = payDialogEmployees;
        if (employees.length === 0) return;

        if (employees.length === 1) {
            setManualPayLoading(employees[0].id);
            try {
                await store.markManualPayrollPaid(employees[0].id, { manualReference });
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(employees[0].id);
                    return next;
                });
                await refreshList();
            } finally {
                setManualPayLoading(null);
            }
            return;
        }

        setBulkPayLoading(true);
        try {
            await store.bulkMarkManualPayrollPaid({
                employeeIds: employees.map((e) => e.id),
                manualReference,
            });
            setSelectedIds(new Set());
            await refreshList();
        } finally {
            setBulkPayLoading(false);
        }
    };

    const { total: selectedTotal, currency: selectedCurrency } =
        sumPayrollAmount(selectedEmployees);

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

            {selectedIds.size > 0 && (
                <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
                    style={{
                        background: "rgba(0,102,102,0.1)",
                        border: "1px solid rgba(0,102,102,0.2)",
                        boxShadow:
                            "inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.7)",
                    }}
                >
                    <div className="space-y-0.5">
                        <p
                            className="text-sm font-bold"
                            style={{ fontFamily: "var(--font-space-mono), monospace", color: "#006666" }}
                        >
                            {selectedIds.size} manual employee{selectedIds.size !== 1 ? "s" : ""} selected
                        </p>
                        <p
                            className="text-xs"
                            style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#1E2938", opacity: 0.6 }}
                        >
                            Total: {selectedCurrency} {selectedTotal.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={handleBulkPaySelected}
                            disabled={bulkPayLoading}
                            style={{ background: "#006666", color: "#fff" }}
                        >
                            <Banknote className="h-4 w-4 mr-1.5" />
                            {bulkPayLoading ? "Processing…" : `Pay Selected (${selectedIds.size})`}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setSelectedIds(new Set())}
                        >
                            <X className="h-4 w-4 mr-1.5" />
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {payableOnPage.length > 0 && selectedIds.size === 0 && (
                <div className="flex justify-end">
                    <Button type="button" variant="ghost" onClick={handleSelectAllPayable}>
                        Select all manual due ({payableOnPage.length})
                    </Button>
                </div>
            )}

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
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onManualPay={handleManualPaySingle}
                    manualPayLoading={manualPayLoading || undefined}
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

            <ManualPayrollConfirmDialog
                open={payDialogOpen}
                onOpenChange={setPayDialogOpen}
                employees={payDialogEmployees}
                onConfirm={handleConfirmManualPay}
            />
        </div>
    );
}