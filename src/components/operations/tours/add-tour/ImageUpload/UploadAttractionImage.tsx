"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { filesToDocumentDTOs } from "@/utils/helpers/file-conversion";
import { showToast } from "@/components/global/showToast";
import Image from "next/image";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4]  border border-white/60";
const NEU_INSET =
    "bg-[#E7E5E4] ";
const NEU_INSET_SM =
    "bg-[#E7E5E4] ";

const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover:bg-[#FF2157]/10 hover: " +
    "transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE_PRIMARY =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] ";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] ";

// ── Card animation variants ───────────────────────────────────
const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// ── Props ─────────────────────────────────────────────────────
interface UploadAttractionImageProps {
    imageIds: string[];
    onImagesChange: (newImages: string[]) => void;
    maxImages?: number;
    maxSizeMB?: number;
    disabled?: boolean;
}

export default function UploadAttractionImage({
    imageIds = [],
    onImagesChange,
    maxImages = 10,
    maxSizeMB = 5,
    disabled = false,
}: UploadAttractionImageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = async (files: FileList | File[]) => {
        if (disabled || isUploading) return;

        const fileArray = Array.from(files);

        if (imageIds.length + fileArray.length > maxImages) {
            showToast.warning(
                "Maximum images exceeded",
                `You can only upload up to ${maxImages} images. Currently have ${imageIds.length}.`
            );
            return;
        }

        const maxBytes = maxSizeMB * 1024 * 1024;
        const oversizedFiles = fileArray.filter((f) => f.size > maxBytes);
        if (oversizedFiles.length > 0) {
            showToast.error(
                "File too large",
                `Some files exceed ${maxSizeMB}MB limit. Please select smaller files.`
            );
            return;
        }

        setIsUploading(true);
        try {
            const documentDTOs = await filesToDocumentDTOs(fileArray, {
                compressImages: true,
                maxWidth: 1200,
                quality: 0.8,
                maxFileBytes: maxBytes,
            });

            const newBase64Images = documentDTOs
                .map((doc) => doc.url as string)
                .filter((url) => url && url.startsWith("data:image"));

            if (newBase64Images.length > 0) {
                const updatedImages = [...imageIds, ...newBase64Images].slice(0, maxImages);
                onImagesChange(updatedImages);
                showToast.success(
                    "Images uploaded successfully",
                    `${newBase64Images.length} image(s) added.`
                );
            } else {
                showToast.error("No valid images", "No valid images could be processed.");
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            showToast.error(
                "Upload failed",
                error instanceof Error ? error.message : "Failed to upload images"
            );
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (index: number) => {
        const updated = [...imageIds];
        updated.splice(index, 1);
        onImagesChange(updated);
        showToast.success("Image removed", "Image has been removed successfully.");
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled || isUploading) return;
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/")
        );
        if (!files.length) {
            showToast.error("No images found", "Please drop image files only.");
            return;
        }
        await handleFileSelect(files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled && !isUploading) setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    const atMax = imageIds.length >= maxImages;

    return (
        <div className={`${NEU_SURFACE} w-full space-y-5`}>
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files || [])}
                className="hidden"
                disabled={disabled || isUploading}
            />

            {/* ── Drop zone ──────────────────────────────────────── */}
            <motion.div
                whileHover={{ scale: disabled || isUploading ? 1 : 1.005 }}
                whileTap={{ scale: disabled || isUploading ? 1 : 0.995 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <button
                    type="button"
                    disabled={disabled || isUploading || atMax}
                    onClick={() => fileInputRef.current?.click()}
                    className={[
                        "w-full rounded-2xl border-2 border-dashed py-10 px-6",
                        "flex flex-col items-center gap-4 text-center",
                        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
                        dragOver
                            ? "border-[#006666]/60 bg-[#006666]/5 "
                            : "border-[#1E2938]/15 " + NEU_INSET,
                        disabled || atMax ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[#006666]/40",
                    ].join(" ")}
                >
                    {/* Icon */}
                    <div
                        className={[
                            "p-4 rounded-2xl transition-colors duration-200",
                            dragOver
                                ? "bg-[#006666]/20 "
                                : "bg-[#006666]/10 ",
                        ].join(" ")}
                    >
                        {isUploading ? (
                            <div className="w-8 h-8 rounded-full border-2 border-[#006666]/30 border-t-[#006666] animate-spin" />
                        ) : (
                            <Upload
                                size={28}
                                className={dragOver ? "text-[#006666]" : "text-[#006666]/70"}
                            />
                        )}
                    </div>

                    {/* Text */}
                    <div className="space-y-1">
                        <p className={`${NEU_HEADING} text-base`}>
                            {dragOver
                                ? "Drop images here"
                                : isUploading
                                    ? "Uploading…"
                                    : "Upload attraction images"}
                        </p>
                        <p className={NEU_MUTED}>Drag & drop or click to browse</p>
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                            Max {maxImages} images · Max {maxSizeMB} MB each · JPG, PNG, GIF, WEBP
                        </p>
                    </div>

                    {/* Counter chip */}
                    {imageIds.length > 0 && (
                        <span className={atMax ? NEU_BADGE_WARNING : NEU_BADGE_PRIMARY}>
                            {imageIds.length} / {maxImages} images
                        </span>
                    )}
                </button>
            </motion.div>

            {/* ── Gallery grid ───────────────────────────────────── */}
            <AnimatePresence mode="popLayout">
                {imageIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {/* Header row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-[#006666]/10 ">
                                    <ImageIcon size={14} className="text-[#006666]" />
                                </div>
                                <span className={`${NEU_HEADING} text-sm`}>
                                    Uploaded Images ({imageIds.length})
                                </span>
                            </div>

                            {/* Clear all */}
                            <button
                                type="button"
                                disabled={disabled || imageIds.length === 0}
                                onClick={() => {
                                    if (imageIds.length > 0) {
                                        onImagesChange([]);
                                        showToast.success("All images removed", "All attraction images have been cleared.");
                                    }
                                }}
                                className={`${NEU_BTN_DANGER} flex items-center gap-1.5 px-3 py-1.5 text-xs`}
                            >
                                <Trash2 size={12} />
                                Clear all
                            </button>
                        </div>

                        {/* Image grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            <AnimatePresence mode="popLayout">
                                {imageIds.map((image, index) => (
                                    <motion.div
                                        key={index}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        layout
                                        className={`${NEU_CARD_SM} relative aspect-square overflow-hidden group`}
                                    >
                                        {/* Image - using Next.js Image component */}
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={image}
                                                alt={`Attraction image ${index + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                                unoptimized // required for base64 or external URLs without optimization
                                            />
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl" />

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            disabled={disabled}
                                            aria-label={`Remove image ${index + 1}`}
                                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-[#E7E5E4]/90 text-[#FF2157]  opacity-0 group-hover:opacity-100 hover:bg-[#FF2157] hover:text-white transition-all duration-200 disabled:cursor-not-allowed"
                                        >
                                            <X size={12} />
                                        </button>

                                        {/* Index + check label */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl">
                                            <span className="font-[family-name:var(--font-space-mono)] text-[10px] text-white flex items-center gap-1">
                                                <CheckCircle size={10} />
                                                Image {index + 1}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Uploading indicator ─────────────────────────────── */}
            {isUploading && (
                <div className={`${NEU_INSET_SM} rounded-xl px-4 py-3 flex items-center gap-2`}>
                    <div className="w-4 h-4 rounded-full border-2 border-[#006666]/30 border-t-[#006666] animate-spin shrink-0" />
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60">
                        Compressing and uploading images…
                    </p>
                </div>
            )}

            {/* ── Max reached warning ──────────────────────────────── */}
            {atMax && (
                <div className={`${NEU_INSET} rounded-xl px-4 py-3 flex items-center gap-2.5`}>
                    <AlertCircle size={16} className="text-[#FE9900] shrink-0" />
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70">
                        Maximum of {maxImages} images reached. Remove some to add more.
                    </p>
                </div>
            )}
        </div>
    );
}