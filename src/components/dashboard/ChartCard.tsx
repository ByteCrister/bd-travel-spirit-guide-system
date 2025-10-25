// components/dashboard/ChartCard.tsx
"use client";

import React, { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

import {
  FiMoreHorizontal,
  FiMaximize2,
  FiDownload,
  FiCopy,
  FiShare2,
  FiRefreshCw,
  FiImage,
  FiFileText
} from "react-icons/fi";

import type { DashboardChart } from "@/types/dashboard.types";
import ChartLazy from "./ChartLazy";

interface ChartCardProps {
  chart: DashboardChart;
  onChartClick?: (chart: DashboardChart) => void;
  className?: string;
  "data-test-id"?: string;
}

import type { TimeSeriesPoint } from "@/types/dashboard.types";
import ChartSettings from "./ChartSettings";
import ChartExpandedDialog from "./ChartExpandedDialog";

// helper type guards (place near top of file)
function isTimeSeriesArray(v: unknown): v is TimeSeriesPoint[] {
  return Array.isArray(v) && v.length > 0 && typeof (v[0] as TimeSeriesPoint).timestamp === "number";
}

function isCategorySeriesArray(v: unknown): v is Array<{ category: string; value: number }> {
  return Array.isArray(v) && v.length > 0 && typeof (v[0] as { category?: unknown }).category === "string";
}

export default function ChartCard({ chart, onChartClick, className, "data-test-id": testId }: ChartCardProps) {
  const prefersReduced = useReducedMotion();
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "svg" | "csv">("png");
  const chartRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const title = chart.title ?? chart.id;

  // close dropdown on outside click / Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showMoreOptions) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMoreOptions(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowMoreOptions(false);
      }
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showMoreOptions]);

  // Helper: sanitize filename
  const makeFileName = (ext: string) =>
    `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${ext}`;

  // Robust download handler: CSV, SVG (serialize), PNG (canvas export via canvas or html2canvas)
  const handleDownload = useCallback(
    async (format: "png" | "svg" | "csv"): Promise<void> => {
      setIsDownloading(true);
      setDownloadFormat(format);
      try {
        // CSV export
        if (format === "csv") {
          const s = chart.series;
          if (isTimeSeriesArray(s)) {
            const hasValue2 = s.some((p) => typeof p.value2 === "number");
            const headers = hasValue2 ? ["timestamp", "value", "value2"] : ["timestamp", "value"];
            const csvRows = s.map((pt) =>
              headers
                .map((h) => {
                  if (h === "timestamp") return new Date(pt.timestamp).toISOString();
                  return String((pt as Record<string, unknown>)[h] ?? "");
                })
                .join(",")
            );
            const content = `${headers.join(",")}\n${csvRows.join("\n")}`;
            const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, makeFileName("csv"));
            return;
          }
          if (isCategorySeriesArray(s)) {
            const headers = ["category", "value"];
            const csvRows = s.map((pt) => `${pt.category},${pt.value}`);
            const content = `${headers.join(",")}\n${csvRows.join("\n")}`;
            const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, makeFileName("csv"));
            return;
          }
          // empty or unknown series shape
          throw new Error("Unsupported series shape for CSV export");
        }

        // Need DOM element for SVG/PNG
        const el = chartRef.current;
        if (!el) throw new Error("Chart element not available for export");

        // Detect canvas first (fastest raster path)
        const canvas = el.querySelector("canvas");
        if (canvas instanceof HTMLCanvasElement && format === "png") {
          await new Promise<void>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error("Canvas export failed"));
              saveAs(blob, makeFileName("png"));
              resolve();
            }, "image/png");
          });
          return;
        }

        // SVG export path
        if (format === "svg") {
          const svg = el.querySelector("svg");
          if (svg instanceof SVGSVGElement) {
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svg);
            if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
              svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if (!svgString.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
              svgString = svgString.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }
            const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            saveAs(blob, makeFileName("svg"));
            return;
          }
          // fallback to PNG if no SVG found
        }

        // Fallback: html2canvas raster export (PNG)
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.position = "fixed";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        clone.style.width = `${el.clientWidth}px`;
        clone.style.height = `${el.clientHeight}px`;
        const computed = window.getComputedStyle(el);
        clone.style.background = computed.backgroundColor || "#ffffff";
        document.body.appendChild(clone);

        const maxScale = Math.min(window.devicePixelRatio || 1, 2);
        const canvasExport = await html2canvas(clone, { scale: maxScale, backgroundColor: null });
        document.body.removeChild(clone);

        await new Promise<void>((resolve, reject) => {
          canvasExport.toBlob((blob) => {
            if (!blob) return reject(new Error("Canvas toBlob failed"));
            saveAs(blob, makeFileName("png"));
            resolve();
          }, "image/png");
        });
      } catch (err: unknown) {
        // ensure err is handled as Error-like
        const message = err instanceof Error ? err.message : String(err);
        console.error("Download failed:", message);
        try {
          // user-facing minimal feedback
          alert("Download failed. Please try again or use a different export format.");
        } catch {
          // no-op in non-browser tests
        }
      } finally {
        setIsDownloading(false);
        setShowMoreOptions(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chart, title]
  );

  const handleCopyData = useCallback(async () => {
    try {
      const dataString = JSON.stringify(chart.series, null, 2);
      await navigator.clipboard.writeText(dataString);
      const button = document.querySelector(`[data-copy-button="${chart.id}"]`);
      if (button instanceof HTMLElement) {
        const original = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = original;
        }, 1500);
      }
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Copy failed. Please try again.");
    }
  }, [chart]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Check out this chart: ${title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Chart URL copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, [title]);


  const motionEntrance = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } };

  return (
    <>
      <motion.section
        {...(motionEntrance)}
        whileHover={prefersReduced ? undefined : { y: -2, transition: { duration: 0.12 } }}
        aria-labelledby={`chart-${chart.id}-title`}
        className={`group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 ${className ?? ""}`}
        data-test-id={testId}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 id={`chart-${chart.id}-title`} className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Live data</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload("png")}
                disabled={isDownloading}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all disabled:opacity-50"
                title="Download chart as PNG"
                aria-label="Download chart as PNG"
              >
                {isDownloading && downloadFormat === "png" ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
              </motion.button>

              <ChartExpandedDialog
                chart={chart}
                trigger={
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all"
                    title="Expand chart"
                    aria-label="Expand chart"
                  >
                    <FiMaximize2 className="w-4 h-4" />
                  </motion.button>
                }
              />
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMoreOptions((s) => !s)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all"
                  title="More options"
                  aria-haspopup="menu"
                  aria-expanded={showMoreOptions}
                  aria-controls={`chart-${chart.id}-menu`}
                >
                  <FiMoreHorizontal className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showMoreOptions && (
                    <motion.div
                      id={`chart-${chart.id}-menu`}
                      role="menu"
                      initial={{ opacity: 0, scale: 0.98, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: -6 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                    >
                      <button
                        role="menuitem"
                        onClick={() => handleDownload("png")}
                        disabled={isDownloading}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 disabled:opacity-50"
                      >
                        <FiImage className="w-4 h-4" /> Download as PNG
                        {isDownloading && downloadFormat === "png" && <FiRefreshCw className="w-3 h-3 animate-spin ml-auto" />}
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => handleDownload("svg")}
                        disabled={isDownloading}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 disabled:opacity-50"
                      >
                        <FiFileText className="w-4 h-4" /> Download as SVG
                        {isDownloading && downloadFormat === "svg" && <FiRefreshCw className="w-3 h-3 animate-spin ml-auto" />}
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => handleDownload("csv")}
                        disabled={isDownloading}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 disabled:opacity-50"
                      >
                        <FiFileText className="w-4 h-4" /> Export as CSV
                        {isDownloading && downloadFormat === "csv" && <FiRefreshCw className="w-3 h-3 animate-spin ml-auto" />}
                      </button>

                      <div className="border-t border-slate-200 my-1" />

                      <button role="menuitem" onClick={handleCopyData} data-copy-button={chart.id} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                        <FiCopy className="w-4 h-4" /> Copy data
                      </button>

                      <button role="menuitem" onClick={handleShare} className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                        <FiShare2 className="w-4 h-4" /> Share chart
                      </button>

                      <div className="border-t border-slate-200 my-1" />

                      <ChartSettings chartId={chart.id} />

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="min-h-[280px] relative" ref={chartRef}>
            <Suspense fallback={
              <div className="h-72 w-full flex items-center justify-center" aria-busy="true">
                <div className="space-y-4 w-full max-w-2xl px-4">
                  <div className="h-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-teal-200 to-cyan-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gradient-to-r from-cyan-200 to-blue-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            }>
              <ChartLazy chart={chart} />
            </Suspense>
          </div>
        </div>

        <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-emerald-100/50 to-teal-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
      </motion.section>
    </>
  );
}
