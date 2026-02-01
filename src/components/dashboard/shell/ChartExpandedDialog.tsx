// components/dashboard/ChartExpandedDialog.tsx
"use client";

import React, { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

import type { DashboardChart } from "@/types/dashboard.types";
import ChartLazy from "./ChartLazy";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // shadcn dialog wrapper

interface ChartExpandedDialogProps {
  chart: DashboardChart;
  trigger?: React.ReactNode;
  openClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
  defaultOpen?: boolean;
}

export default function ChartExpandedDialog({
  chart,
  trigger,
  openClassName,
  onOpen,
  onClose,
  defaultOpen = false,
}: ChartExpandedDialogProps) {
  const title = chart.title ?? chart.id;
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadPNG = useCallback(async () => {
    try {
      const el = contentRef.current;
      if (!el) throw new Error("Expanded chart not ready for export");

      const canvas = el.querySelector("canvas");
      if (canvas instanceof HTMLCanvasElement) {
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (!b) return reject(new Error("Canvas export failed"));
            saveAs(b, `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`);
            resolve();
          }, "image/png");
        });
        return;
      }

      const svg = el.querySelector("svg");
      if (svg instanceof SVGSVGElement) {
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svg);
        if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
          svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        saveAs(blob, `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.svg`);
        return;
      }

      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      document.body.appendChild(clone);
      const canvasExport = await html2canvas(clone, { scale: Math.min(window.devicePixelRatio || 1, 2) });
      document.body.removeChild(clone);

      await new Promise<void>((resolve, reject) => {
        canvasExport.toBlob((b) => {
          if (!b) return reject(new Error("Canvas toBlob failed"));
          saveAs(b, `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`);
          resolve();
        }, "image/png");
      });
    } catch (err) {
      console.error("Export failed", err);
      try {
        alert("Export failed. Try again or use another format.");
      } catch {
        // noop
      }
    }
  }, [title]);

  return (
    <Dialog defaultOpen={defaultOpen} onOpenChange={(open) => (open ? onOpen?.() : onClose?.())}>
      <DialogTrigger asChild>
        <div className={openClassName ?? ""} aria-haspopup="dialog" aria-label={`Expand ${title}`}>
          {trigger ?? (
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label={`Expand ${title}`}
            >
              <span className="sr-only">Expand chart</span>
            </button>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-6xl w-full p-0 rounded-2xl shadow-2xl z-50">
        {/* Ensure Radix finds a DialogTitle at mount time for accessibility.
            Hidden visually so we can render a styled visible heading separately. */}
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`expanded-${chart.id}-visible-title`}
          className="bg-white rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div>
              {/* Visible heading — not DialogTitle to avoid Radix duplication */}
              <h2 id={`expanded-${chart.id}-visible-title`} className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
              <DialogDescription className="text-sm text-muted-foreground">Expanded view</DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm text-slate-700 hover:bg-slate-50"
                aria-label="Download chart as image"
              >
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>

          <div ref={contentRef} className="p-4 h-[60vh] min-h-[360px]">
            <div className="h-full w-full">
              <ChartLazy chart={chart} />
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
