// components/faqs/FaqFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FAQFilterParams } from '@/types/tour/faqs.types';

interface FaqFiltersProps {
    filters: FAQFilterParams;
    onFilterChange: (filters: Partial<FAQFilterParams>) => void;
}

// ─── Design Tokens ───────────────────────────────────────────────────────────
// surface: #E7E5E4 | text: #1E2938 | primary: #006666
// outer shadow:  6px 6px 12px #cac8c7, -6px -6px 12px #ffffff
// inset shadow:  inset 4px 4px 8px #cac8c7, inset -4px -4px 8px #ffffff
// pressed:       inset 3px 3px 6px #cac8c7, inset -3px -3px 6px #ffffff

const nm = {
    card: [
        'rounded-2xl bg-[#E7E5E4] p-5 space-y-4',
        '',
    ].join(' '),

    input: [
        'w-full rounded-xl border-0 bg-[#E7E5E4]',
        '',
        'text-[#1E2938] placeholder:text-[#1E2938]/40',
        'px-4 py-2.5 font-[family-name:var(--font-jetbrains-mono)] text-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-0',
        'transition-shadow duration-150',
    ].join(' '),

    btn: [
        'inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#E7E5E4]',
        '',
        'active:',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]',
        'transition-shadow duration-150 select-none',
    ].join(' '),

    badge: [
        'inline-flex items-center gap-1 rounded-full bg-[#E7E5E4]',
        'px-3 py-1 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]',
        '',
    ].join(' '),
} as const;

export function FaqFilters({ filters, onFilterChange }: FaqFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    useEffect(() => {
        setSearchInput(filters.search || '');
    }, [filters.search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange({ search: searchInput, page: 1 });
    };

    const clearSearch = () => {
        setSearchInput('');
        onFilterChange({ search: '', page: 1 });
    };

    const handleStatusChange = (value: string) => {
        onFilterChange({
            status: value === 'all' ? undefined : (value as 'pending' | 'approved' | 'rejected'),
            page: 1,
        });
    };

    const clearAllFilters = () => {
        setSearchInput('');
        onFilterChange({ search: '', status: undefined, page: 1 });
    };

    const hasActiveFilters = !!(filters.search || filters.status);

    return (
        <div className={nm.card} role="search" aria-label="Filter FAQs">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4]
                            "
                        aria-hidden="true"
                    >
                        <Filter className="h-3.5 w-3.5 text-[#1E2938]/60" />
                    </div>
                    <span className="font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-tight text-[#1E2938]">
                        Filters
                    </span>
                    {hasActiveFilters && (
                        <span
                            className="rounded-full bg-[#006666]/10 px-2 py-0.5
                                font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium text-[#006666]"
                            aria-live="polite"
                        >
                            Active
                        </span>
                    )}
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className={`${nm.btn} px-3.5 py-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70 hover:text-[#1E2938]`}
                        aria-label="Clear all active filters"
                    >
                        <X className="h-3 w-3" aria-hidden="true" />
                        Clear all
                    </button>
                )}
            </div>

            {/* Controls grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Search field */}
                <form onSubmit={handleSearchSubmit} className="relative" role="search">
                    <label htmlFor="faq-search" className="sr-only">Search FAQs by question or answer</label>
                    <input
                        id="faq-search"
                        type="search"
                        placeholder="Search by question or answer…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={`${nm.input} pr-[4.5rem]`}
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-10 top-1/2 -translate-y-1/2 rounded-lg p-1
                                text-[#1E2938]/40 transition-colors hover:text-[#1E2938]/70
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]"
                            aria-label="Clear search input"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        aria-label="Submit search"
                        className="absolute right-0 top-0 flex h-full w-10 items-center justify-center
                            rounded-r-xl text-[#1E2938]/60 transition-colors hover:text-[#006666]
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </form>

                {/* Status select */}
                <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                    <SelectTrigger
                        className={`${nm.input} pr-10`}
                        aria-label="Filter by status"
                    >
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 bg-[#E7E5E4] ">
                        {(['all', 'approved', 'pending', 'rejected'] as const).map((s) => (
                            <SelectItem
                                key={s}
                                value={s}
                                className="font-[family-name:var(--font-jetbrains-mono)] text-sm capitalize text-[#1E2938] focus:bg-[#006666]/10"
                            >
                                {s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-1" aria-label="Active filters" aria-live="polite">
                    {filters.search && (
                        <span className={nm.badge}>
                            <span className="text-[#1E2938]/50">Search:</span>
                            <span className="max-w-[160px] truncate">{filters.search}</span>
                            <button
                                type="button"
                                onClick={() => { setSearchInput(''); onFilterChange({ search: '', page: 1 }); }}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#006666]"
                                aria-label={`Remove search filter: ${filters.search}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.status && (
                        <span className={nm.badge}>
                            <span className="text-[#1E2938]/50">Status:</span>
                            <span className="capitalize">{filters.status}</span>
                            <button
                                type="button"
                                onClick={() => onFilterChange({ status: undefined, page: 1 })}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#006666]"
                                aria-label={`Remove status filter: ${filters.status}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}