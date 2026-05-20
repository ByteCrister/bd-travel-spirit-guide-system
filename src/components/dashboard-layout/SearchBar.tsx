"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

interface SearchResult {
  title: string;
  route: string;
  ids: string[];
}

interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function SearchBar({ isMobile = false, onClose }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/v1/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setResults(json.data?.results ?? json.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useDebouncedCallback(fetchSearch, 300);

  useEffect(() => {
    if (!searchValue.trim()) { setResults([]); return; }
    debouncedFetch(searchValue.trim());
    return () => { debouncedFetch.cancel?.(); };
  }, [searchValue, debouncedFetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      debouncedFetch.cancel?.();
      fetchSearch(searchValue.trim());
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setResults([]);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = async (result: SearchResult) => {
    try {
      const encodedIds = await Promise.all(
        result.ids.map((id) => encodeId(encodeURIComponent(id)))
      );
      router.push(`${result.route}${encodedIds.join("/")}`);
      setSearchValue("");
      setResults([]);
      if (isMobile && onClose) onClose();
    } catch (err) {
      console.error("Failed to encrypt IDs:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandMode(true);
        if (isMobile) setIsExpanded(true);
        else inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  const InputField = (
    <div className="relative flex-1">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 h-10 transition-all duration-200",
          "font-[family-name:var(--font-jetbrains-mono)]",
          "bg-[#E7E5E4]",
          isFocused
            ? "shadow-[inset_3px_3px_7px_rgba(0,0,0,0.12),inset_-3px_-3px_7px_rgba(255,255,255,0.8)]"
            : "shadow-[3px_3px_8px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.9)]"
        )}
      >
        <Search className="h-4 w-4 flex-shrink-0 text-[#1E2938]/35" />

        <input
          ref={inputRef}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder={
            isCommandMode ? "Type a command..." : "Search users, tours..."
          }
          className={cn(
            "flex-1 bg-transparent text-xs text-[#1E2938] outline-none",
            "placeholder:text-[#1E2938]/35 placeholder:text-xs"
          )}
        />

        <div className="flex items-center gap-1.5">
          {searchValue && (
            <motion.button
              type="button"
              onClick={clearSearch}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[#1E2938]/35 hover:text-[#FF2157] transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}

          {!isMobile && (
            <>
              <kbd className={cn(
                "hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]",
                "font-[family-name:var(--font-space-mono)] text-[#1E2938]/40",
                "bg-[#E7E5E4]",
                "shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_3px_rgba(255,255,255,0.8)]"
              )}>
                ⌘K
              </kbd>

              <button
                type="button"
                onClick={() => setIsCommandMode((p) => !p)}
                className={cn(
                  "p-1 rounded-lg transition-all duration-150",
                  isCommandMode
                    ? "shadow-[inset_1px_1px_4px_rgba(0,0,0,0.15),inset_-1px_-1px_4px_rgba(255,255,255,0.6)] text-[#006666]"
                    : "shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_3px_rgba(255,255,255,0.8)] text-[#1E2938]/40"
                )}
                aria-label="Toggle command mode"
              >
                <Command className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-xl p-2",
              "bg-[#E7E5E4]",
              "shadow-[6px_6px_20px_rgba(0,0,0,0.14),-6px_-6px_20px_rgba(255,255,255,0.9)]",
              "border border-[#d0cecc]"
            )}
          >
            {loading && (
              <p className="p-2 text-xs text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)]">
                Loading...
              </p>
            )}
            {results.map((item, idx) => (
              <button
                key={`${item.route}-${item.ids.join("-")}-${idx}`}
                type="button"
                onClick={() => handleResultClick(item)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg mb-1 transition-all duration-150",
                  "font-[family-name:var(--font-jetbrains-mono)]",
                  "hover:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.08),inset_-1px_-1px_4px_rgba(255,255,255,0.6)]"
                )}
              >
                <p className="text-xs font-semibold text-[#1E2938]">{item.title}</p>
                <p className="text-[10px] text-[#1E2938]/40 truncate">{item.route}...</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isMobile) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "bg-[#E7E5E4] text-[#1E2938]",
            "shadow-[3px_3px_8px_rgba(0,0,0,0.13),-3px_-3px_8px_rgba(255,255,255,0.9)]",
            "hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
            "transition-all duration-200"
          )}
          whileTap={{ scale: 0.95 }}
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "absolute right-0 top-12 z-50 w-80 rounded-xl p-2",
                "bg-[#E7E5E4]",
                "shadow-[6px_6px_20px_rgba(0,0,0,0.14),-6px_-6px_20px_rgba(255,255,255,0.9)]",
                "border border-[#d0cecc]"
              )}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                {InputField}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSearch}
      className="relative flex-1 max-w-md"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {InputField}
    </motion.form>
  );
}