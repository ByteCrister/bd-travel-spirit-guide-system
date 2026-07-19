"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2, X, List } from "lucide-react";
import RequestRow from "./RequestRow";
import PaginationControls from "./PaginationControls";
import {
  REQUEST_STATUS,
  RequestStatus,
} from "@/constants/employee/reset-password-request.const";
import { useResetRequestsStore } from "@/store/reset-requests.store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResetRequestListQuery } from "@/types/employee/password-reset.types";
import RequestSkeletonRow from "./skeletons/RequestSkeletonRow";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const PAGE_LIMIT_OPTIONS = [10, 20, 50, 100] as const;

const TABLE_COLUMNS = ["Email", "Name", "Status", "Requested At", "Actions"] as const;

/* ─── Neumorphic style tokens ────────────────────────────────────────────── */
const N = {
  surface: "bg-[#E7E5E4] dark:bg-[#2A2A2A]",
  text: "text-[#1E2938] dark:text-white",
  textMuted: "text-[#1E2938]/70 dark:text-white/60",
  raisedLg:
    " dark:",
  raisedSm:
    " dark:",
  raisedXs:
    " dark:",
  pressedMd:
    "[box-shadow:inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff] dark:[box-shadow:inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#3a3a3a]",
  pressedSm:
    "[box-shadow:inset_2px_2px_4px_#cac8c7,inset_-2px_-2px_4px_#ffffff] dark:[box-shadow:inset_2px_2px_4px_#1a1a1a,inset_-2px_-2px_4px_#3a3a3a]",
  font: "font-['Space_Mono']",
} as const;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function RequestList() {
  const {
    currentQuery,
    setQuery,
    fetchList,
    currentPageIds,
    entities,
    isFetching,
    revalidating,
  } = useResetRequestsStore();

  const [searchTerm, setSearchTerm] = useState(currentQuery.search ?? "");
  const [isSearching, setIsSearching] = useState(false);

  /* ── Debounced search ── */
  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    setIsSearching(true);
    const newQuery = { ...currentQuery, search: term.trim() || undefined, page: 1 };
    setQuery(newQuery);
    await fetchList(newQuery);
    setIsSearching(false);
  }, 300);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const triggerSearch = useCallback(() => {
    if (debouncedSearch.cancel) debouncedSearch.cancel();
    setIsSearching(true);
    const newQuery = { ...currentQuery, search: searchTerm.trim() || undefined, page: 1 };
    setQuery(newQuery);
    fetchList(newQuery).finally(() => setIsSearching(false));
  }, [debouncedSearch, searchTerm, currentQuery, setQuery, fetchList]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") triggerSearch();
    },
    [triggerSearch]
  );

  const clearSearch = useCallback(async () => {
    setSearchTerm("");
    if (debouncedSearch.cancel) debouncedSearch.cancel();
    setIsSearching(true);
    const newQuery = { ...currentQuery, search: undefined, page: 1 };
    setQuery(newQuery);
    await fetchList(newQuery);
    setIsSearching(false);
  }, [debouncedSearch, currentQuery, setQuery, fetchList]);

  useEffect(() => {
    return () => {
      if (debouncedSearch.cancel) debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const rows = useMemo(
    () => currentPageIds.map((id) => entities[id]).filter(Boolean),
    [currentPageIds, entities]
  );

  const onStatusChange = useCallback(
    async (val?: ResetRequestListQuery["status"]) => {
      setQuery({ status: val, page: 1 });
      await fetchList({ ...currentQuery, status: val, page: 1 });
    },
    [currentQuery, setQuery, fetchList]
  );

  const onLimitChange = useCallback(
    async (limit: number) => {
      setQuery({ limit, page: 1 });
      await fetchList({ ...currentQuery, limit, page: 1 });
    },
    [currentQuery, setQuery, fetchList]
  );

  const handleSelectValueChange = useCallback(
    (value: string): void => {
      const mapped: ResetRequestListQuery["status"] =
        value === "all" ? "all" : (value as RequestStatus);
      void onStatusChange(mapped);
    },
    [onStatusChange]
  );

  const handleLimitChange = useCallback(
    (value: string): void => {
      void onLimitChange(parseInt(value, 10));
    },
    [onLimitChange]
  );

  /* ── Select trigger class (shared) ── */
  const selectTriggerClass = `
    h-9 border-none rounded-xl text-sm
    ${N.surface} ${N.text} ${N.raisedSm}
    focus:${N.pressedSm} transition-shadow duration-200
  `;

  return (
    <section className={`w-full space-y-5 p-4 md:p-6 lg:p-8 ${N.surface} ${N.font} transition-colors`}>

      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex flex-col gap-3 md:flex-row md:items-center
          rounded-2xl p-4 ${N.surface} ${N.raisedLg}
        `}
      >
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${N.textMuted}`} />
          <Input
            placeholder="Search by email, name or mobile…"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search requests"
            className={`
              pl-10 pr-28 border-none rounded-full
              ${N.surface} ${N.text} placeholder:text-[#1E2938]/40 dark:placeholder:text-white/30
              ${N.pressedMd}
              focus-visible:outline-none focus-visible:${N.pressedSm}
              transition-shadow duration-200
            `}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className={`
                  p-1.5 rounded-full ${N.textMuted} hover:text-[#006666]
                  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]
                `}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <Button
              onClick={triggerSearch}
              disabled={isSearching || isFetching}
              size="sm"
              aria-label="Execute search"
              className={`
                rounded-full gap-1.5 px-3 border-none
                bg-[#006666] text-white
                ${N.raisedSm}
                hover:${N.raisedXs} active:${N.pressedSm}
                disabled:opacity-60 disabled:pointer-events-none
                transition-all duration-150
              `}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="hidden md:inline text-xs font-semibold">Search</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className={`h-4 w-4 shrink-0 ${N.textMuted}`} />
            <Select
              onValueChange={handleSelectValueChange}
              value={currentQuery.status ?? "all"}
            >
              <SelectTrigger className={`w-[148px] ${selectTriggerClass}`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={REQUEST_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={REQUEST_STATUS.DENIED}>Denied</SelectItem>
                <SelectItem value={REQUEST_STATUS.FULFILLED}>Fulfilled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Per-page limit */}
          <div className="flex items-center gap-1.5">
            <List className={`h-4 w-4 shrink-0 ${N.textMuted}`} />
            <Select
              onValueChange={handleLimitChange}
              value={String(currentQuery.limit ?? 20)}
            >
              <SelectTrigger className={`w-[130px] ${selectTriggerClass}`}>
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Revalidating indicator */}
          {revalidating && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Badge
                variant="secondary"
                className={`
                  gap-1.5 px-2.5 py-1 h-7 border-none text-xs
                  ${N.surface} ${N.textMuted} ${N.pressedSm}
                `}
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Refreshing
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Table ── */}
      <div
        className={`
          overflow-x-auto -mx-4 md:mx-0 rounded-2xl
          ${N.surface} ${N.raisedLg}
        `}
      >
        <Table>
          <TableHeader>
            <TableRow
              className={`
                ${N.surface} hover:${N.surface}
                border-b border-[#cac8c7] dark:border-[#3a3a3a]
              `}
            >
              {TABLE_COLUMNS.map((col) => (
                <TableHead
                  key={col}
                  className={`text-xs font-bold uppercase tracking-widest py-3.5 ${N.textMuted} ${col === "Actions" ? "text-right" : ""}`}
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isFetching && !revalidating ? (
              /* Skeleton rows */
              Array.from({ length: currentQuery.limit ?? 20 }).map((_, i) => (
                <RequestSkeletonRow key={i} />
              ))
            ) : rows.length === 0 ? (
              /* Empty state */
              <TableRow className={`${N.surface} hover:${N.surface}`}>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center
                        ${N.surface} ${N.pressedSm}
                      `}
                    >
                      <Search className={`w-7 h-7 ${N.textMuted}`} />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className={`font-semibold ${N.text}`}>No requests found</p>
                      <p className={`text-sm ${N.textMuted}`}>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => <RequestRow key={r.id} entity={r} />)
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {rows.length > 0 && <PaginationControls />}
    </section>
  );
}