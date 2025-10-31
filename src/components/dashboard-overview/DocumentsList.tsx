// src/components/dashboard-overview/DocumentsList.tsx
'use client';

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Download,
    Trash2,
    File,
    FileText,
    Image as ImageIcon,
    Upload,
    CheckCircle2,
    FolderOpen,
    Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuideOverviewStore } from "@/store/useGuideOverviewStore";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import {
    GUIDE_DOCUMENT_TYPE,
    GUIDE_DOCUMENT_CATEGORY,
    GuideDocumentType,
    GuideDocumentCategory,
} from "@/constants/guide.const";
import { GuideDocument } from "@/types/overview.types";
import { processUploadFile } from "@/utils/helpers/fileUpload.overview";
import { toast } from "sonner";
import DocumentConfirmDialog from "./DocumentConfirmDialog";

type FileLike = File;
type ProcessResult =
    | { ok: true; doc: Omit<GuideDocument, "id"> }
    | { ok: false; error: string };

/** Helpers -------------------------------------------------- */
const isValidFileType = (t?: unknown): t is GuideDocumentType =>
    typeof t === "string" && Object.values(GUIDE_DOCUMENT_TYPE).includes(t as GuideDocumentType);

const isValidCategory = (c?: unknown): c is GuideDocumentCategory =>
    typeof c === "string" && Object.values(GUIDE_DOCUMENT_CATEGORY).includes(c as GuideDocumentCategory);

const normalizeFileType = (fileType?: unknown): GuideDocumentType =>
    isValidFileType(fileType) ? fileType : GUIDE_DOCUMENT_TYPE.DOCX;

const normalizeCategoryLabel = (category?: unknown): string =>
    isValidCategory(category) ? String(category).split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : "Unknown";

type UrlObject = { url: string };

/** type guard that validates object has a string `url` property */
function isUrlObject(value: unknown): value is UrlObject {
    return (
        typeof value === "object" &&
        value !== null &&
        // 'in' narrows down to object but we still must check the property type
        "url" in value &&
        typeof (value as Record<string, unknown>).url === "string"
    );
}

const getFileIcon = (fileType?: unknown) => {
    const t = normalizeFileType(fileType);
    switch (t) {
        case GUIDE_DOCUMENT_TYPE.PDF:
            return FileText;
        case GUIDE_DOCUMENT_TYPE.IMAGE:
            return ImageIcon;
        default:
            return File;
    }
};

const getFileTypeColor = (fileType?: unknown) => {
    const t = normalizeFileType(fileType);
    switch (t) {
        case GUIDE_DOCUMENT_TYPE.PDF:
            return "bg-red-500/10 text-red-500 border-red-500/20";
        case GUIDE_DOCUMENT_TYPE.IMAGE:
            return "bg-purple-500/10 text-purple-500 border-purple-500/20";
        default:
            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
};

export const normalizeHref = (fileUrl: string | UrlObject | null | undefined): string | null => {
    if (!fileUrl) return null;
    if (typeof fileUrl === "string") return fileUrl;
    if (isUrlObject(fileUrl)) return fileUrl.url;
    return null;
};

/** Component ------------------------------------------------ */
export default function DocumentsList({ documents }: { documents: GuideDocument[] }) {
    const { addDocument, removeDocument, markDirty } = useGuideOverviewStore();
    const uploadInputRef = useRef<HTMLInputElement | null>(null);

    // Document confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [pendingDelete, setPendingDelete] = useState<{ id: string; label?: string } | null>(null);

    const requestDelete = (idOrFallback: string, label?: string) => {
        setPendingDelete({ id: idOrFallback, label });
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!pendingDelete) {
            setConfirmOpen(false);
            return;
        }

        try {
            removeDocument(pendingDelete.id);
            markDirty("documents");
            toast.success("Document removed");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_blank) {
            toast.error("Delete failed");
        } finally {
            setConfirmOpen(false);
            setPendingDelete(null);
        }
    };

    const onChooseFiles = async (files: FileList | null, category: GuideDocumentCategory = GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO) => {
        if (!files || files.length === 0) return;

        for (const file of Array.from(files) as FileLike[]) {
            // processUploadFile has a typed signature; rely on its return type
            const result = (await processUploadFile({ file, category })) as ProcessResult;
            if (!result.ok) {
                toast.error(result.error ?? "Upload failed");
                continue;
            }

            const doc: GuideDocument = {
                ...result.doc,
                id: uuidv4(), // client temporary id until server persists
            };

            addDocument(doc);
            markDirty("documents");
            toast.success("Uploaded");
        }
    };

    const openFilePicker = () => uploadInputRef.current?.click();

    const exportAll = () => {
        for (const d of documents) {
            const href = normalizeHref(d.fileUrl);
            if (!href) continue;
            const a = document.createElement("a");
            a.href = href;
            const filename = d.fileName ?? `document.${d.fileType ?? "bin"}`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
        toast.info("Export started");
    };

    return (
        <div className="space-y-3">
            {/* Hidden file input */}
            <input
                ref={uploadInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.docx"
                style={{ display: "none" }}
                onChange={(e) => onChooseFiles(e.target.files)}
                multiple
            />

           {/* Top toolbar: Upload + Export */}
<div className="flex items-center justify-end gap-3 px-2 py-1 bg-transparent">
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => openFilePicker()}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold
                 bg-white/4 hover:bg-white/6 text-foreground transition-colors duration-150
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/25
                 shadow-sm hover:shadow-md"
    >
      <Upload className="w-4 h-4 text-current" />
      <span className="leading-none">Upload</span>
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={exportAll}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold
                 border border-muted/30 bg-transparent text-foreground transition-colors duration-150
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20
                 hover:bg-muted/6"
    >
      <Archive className="w-4 h-4 text-current" />
      <span className="leading-none">Export all</span>
    </Button>
  </div>
</div>


            <AnimatePresence mode="popLayout">
                {documents.length === 0 ? (
                    <motion.div
                        key="no-docs"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-16 border-2 border-dashed rounded-xl bg-gradient-to-br from-muted/30 to-muted/10"
                    >
                        <div className="relative inline-block mb-4">
                            <FolderOpen className="size-16 mx-auto text-muted-foreground/30" />
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-0 left-1/2 -translate-x-1/2"
                            >
                                <Upload className="size-6 text-primary/40" />
                            </motion.div>
                        </div>
                        <p className="text-base font-semibold text-foreground mb-1">No documents uploaded</p>
                        <p className="text-sm text-muted-foreground">Get started by uploading your first document</p>

                        {/* Empty-state CTA: reuse the same hidden input */}
                        <div className="mt-4">
                            <Button onClick={() => openFilePicker()} variant="default" size="sm">
                                <Upload className="size-4 mr-2" /> Upload a document
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    documents.map((d, idx) => {
                        const key = d.id ?? d.fileUrl ?? `doc-tmp-${idx}-${uuidv4()}`;
                        const Icon = getFileIcon(d.fileType);
                        const colorClasses = getFileTypeColor(d.fileType);
                        const href = normalizeHref(d.fileUrl);

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.28, delay: idx * 0.03 }}
                                layout
                            >
                                <div
                                    className={cn(
                                        "flex items-center justify-between gap-3 border rounded-xl p-4",
                                        "hover:border-primary/50 hover:shadow-md transition-all duration-200",
                                        "group relative overflow-hidden",
                                        colorClasses.replace("bg-", "hover:bg-").replace("/10", "/15")
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                                        <motion.div
                                            className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                                "border transition-all duration-200",
                                                "group-hover:scale-110",
                                                colorClasses
                                            )}
                                            whileHover={{ rotate: 5 }}
                                        >
                                            <Icon className="size-6" />
                                        </motion.div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate flex items-center gap-2">
                                                {d.fileName ?? d.fileType}
                                                <CheckCircle2 className="size-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="text-xs text-muted-foreground capitalize mt-0.5">
                                                {normalizeCategoryLabel(d.category)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 relative z-10">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10" asChild>
                                                <a
                                                    href={href ?? "#"}
                                                    target={href ? "_blank" : undefined}
                                                    rel={href ? "noreferrer noopener" : undefined}
                                                    aria-label={`Download ${d.fileName ?? d.fileType}`}
                                                >
                                                    <Download className="size-4" />
                                                </a>
                                            </Button>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => requestDelete(d.id ?? (typeof d.fileUrl === "string" ? d.fileUrl : key), d.fileName)}
                                                aria-label={`Delete ${d.fileName ?? d.fileType}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </AnimatePresence>

            {/* Document delete confirmation dialog (single instance) */}
            <DocumentConfirmDialog
                open={confirmOpen}
                onOpenChange={(v) => {
                    if (!v) setPendingDelete(null);
                    setConfirmOpen(v);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete document"
                description="This will remove the document from your draft. The removal will be persisted only after you save changes."
                confirmLabel="Delete"
                cancelLabel="Keep"
                context={pendingDelete?.label}
            />
        </div>
    );
}
