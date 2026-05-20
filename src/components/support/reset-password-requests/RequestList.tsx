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

const PAGE_LIMIT_OPTIONS = [10, 20, 50, 100] as const;

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

  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    async (term: string) => {
      setIsSearching(true);
      const newQuery = {
        ...currentQuery,
        search: term.trim() || undefined,
        page: 1,
      };
      setQuery(newQuery);
      await fetchList(newQuery);
      setIsSearching(false);
    },
    300
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (debouncedSearch.cancel) debouncedSearch.cancel();
        setIsSearching(true);
        const newQuery = {
          ...currentQuery,
          search: searchTerm.trim() || undefined,
          page: 1,
        };
        setQuery(newQuery);
        fetchList(newQuery).finally(() => setIsSearching(false));
      }
    },
    [debouncedSearch, searchTerm, currentQuery, setQuery, fetchList]
  );

  const handleSearchClick = useCallback(() => {
    if (debouncedSearch.cancel) debouncedSearch.cancel();
    setIsSearching(true);
    const newQuery = {
      ...currentQuery,
      search: searchTerm.trim() || undefined,
      page: 1,
    };
    setQuery(newQuery);
    fetchList(newQuery).finally(() => setIsSearching(false));
  }, [debouncedSearch, searchTerm, currentQuery, setQuery, fetchList]);

  const clearSearch = useCallback(async () => {
    setSearchTerm("");
    if (debouncedSearch.cancel) debouncedSearch.cancel();
    setIsSearching(true);
    const newQuery = {
      ...currentQuery,
      search: undefined,
      page: 1,
    };
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
      const limit = parseInt(value, 10);
      void onLimitChange(limit);
    },
    [onLimitChange]
  );

  return (
    <section className="w-full space-y-6 px-4 py-6 md:px-6 lg:px-8 font-['Space_Mono'] bg-[#E7E5E4] dark:bg-[#1e293b] transition-colors">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 md:flex-row md:items-center rounded-2xl p-4
                   bg-[#E7E5E4] dark:bg-[#1e293b]
                   shadow-[8px_8px_16px_#d1cfce,-8px_-8px_16px_#fdfdfc]
                   dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]"
      >
        {/* Search input */}
        <div className="flex-1 min-w-0 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938] dark:text-slate-300 pointer-events-none" />
          <Input
            placeholder="Search by email, name or mobile..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search requests"
            className="pl-10 pr-24
                       bg-[#E7E5E4] dark:bg-[#1e293b]
                       border-none
                       rounded-full
                       shadow-[inset_4px_4px_8px_#d1cfce,inset_-4px_-4px_8px_#fdfdfc]
                       dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]
                       text-[#1E2938] dark:text-slate-300
                       focus:shadow-[inset_6px_6px_12px_#d1cfce,inset_-6px_-6px_12px_#fdfdfc]
                       dark:focus:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155]
                       transition-shadow"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm && (
              <button
                onClick={clearSearch}
                aria-label="Clear search"
                className="p-1.5 rounded-full text-[#1E2938] dark:text-slate-400 hover:text-[#006666] dark:hover:text-[#006666] hover:bg-[#d1cfce] dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              onClick={handleSearchClick}
              disabled={isSearching || isFetching}
              size="sm"
              aria-label="Execute search"
              className="rounded-full gap-1.5 px-3
                         bg-[#006666] text-white
                         shadow-[4px_4px_8px_#d1cfce,-4px_-4px_8px_#fdfdfc]
                         hover:shadow-[inset_4px_4px_8px_#004b4b,inset_-4px_-4px_8px_#00807f]
                         hover:bg-[#005555]
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="hidden md:inline font-medium">Search</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-[#1E2938] dark:text-slate-300 shrink-0" />
            <Select
              onValueChange={handleSelectValueChange}
              value={currentQuery.status ?? "all"}
            >
              <SelectTrigger
                className="w-[150px] h-9
                           bg-[#E7E5E4] dark:bg-[#1e293b]
                           border-none
                           rounded-lg
                           shadow-[4px_4px_8px_#d1cfce,-4px_-4px_8px_#fdfdfc]
                           dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155]
                           text-[#1E2938] dark:text-slate-300
                           focus:shadow-[inset_4px_4px_8px_#d1cfce,inset_-4px_-4px_8px_#fdfdfc]
                           dark:focus:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]"
              >
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

          <div className="flex items-center gap-1.5">
            <List className="h-4 w-4 text-[#1E2938] dark:text-slate-300 shrink-0" />
            <Select
              onValueChange={handleLimitChange}
              value={String(currentQuery.limit ?? 20)}
            >
              <SelectTrigger
                className="w-[130px] h-9
                           bg-[#E7E5E4] dark:bg-[#1e293b]
                           border-none
                           rounded-lg
                           shadow-[4px_4px_8px_#d1cfce,-4px_-4px_8px_#fdfdfc]
                           dark:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155]
                           text-[#1E2938] dark:text-slate-300
                           focus:shadow-[inset_4px_4px_8px_#d1cfce,inset_-4px_-4px_8px_#fdfdfc]
                           dark:focus:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]"
              >
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

          {revalidating && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ml-1"
            >
              <Badge
                variant="secondary"
                className="gap-1.5 px-2 py-0.5 h-7 bg-[#E7E5E4] dark:bg-[#1e293b] text-[#1E2938] dark:text-slate-300 border-none
                           shadow-[inset_2px_2px_4px_#d1cfce,inset_-2px_-2px_4px_#fdfdfc]
                           dark:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155]"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Refreshing</span>
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <div
        className="overflow-x-auto -mx-4 md:mx-0 rounded-2xl
                   bg-[#E7E5E4] dark:bg-[#1e293b]
                   shadow-[8px_8px_16px_#d1cfce,-8px_-8px_16px_#fdfdfc]
                   dark:shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]"
      >
        <Table>
          <TableHeader>
            <TableRow
              className="bg-[#E7E5E4] dark:bg-[#1e293b] hover:bg-[#E7E5E4] dark:hover:bg-[#1e293b]
                         border-b border-[#d1cfce] dark:border-slate-700"
            >
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-[#1E2938] dark:text-slate-300">
                Email
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-[#1E2938] dark:text-slate-300">
                Name
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-[#1E2938] dark:text-slate-300">
                Status
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-[#1E2938] dark:text-slate-300">
                Requested At
              </TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-[#1E2938] dark:text-slate-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isFetching && !revalidating ? (
              Array.from({ length: currentQuery.limit ?? 20 }).map((_, i) => (
                <RequestSkeletonRow key={i} />
              ))
            ) : rows.length === 0 ? (
              <TableRow className="bg-[#E7E5E4] dark:bg-[#1e293b]">
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full
                                 bg-[#E7E5E4] dark:bg-[#1e293b]
                                 shadow-[inset_4px_4px_8px_#d1cfce,inset_-4px_-4px_8px_#fdfdfc]
                                 dark:shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]
                                 flex items-center justify-center"
                    >
                      <Search className="w-8 h-8 text-[#1E2938] dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1E2938] dark:text-slate-300">
                        No requests found
                      </p>
                      <p className="text-sm text-[#1E2938]/70 dark:text-slate-400 mt-1">
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

      {rows.length > 0 && <PaginationControls />}
    </section>
  );
}