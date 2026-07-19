// DestinationImageUploader.tsx
"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { IMAGE_EXTENSIONS } from "@/utils/helpers/file-conversion";
import Image from "next/image";

// ── Neumorphic Style Tokens ──────────────────────────────────────────────────
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4]  border border-white/60";

const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] ";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl " +
  "bg-[#006666] text-white font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-wide " +
  " " +
  "hover: hover:bg-[#007777] " +
  "active: " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl " +
  "bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm font-bold " +
  " " +
  "hover: " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BADGE =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold " +
  "font-[family-name:var(--font-space-mono)] bg-[#E7E5E4] text-[#006666] " +
  "";

const NEU_BADGE_WARNING =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold " +
  "font-[family-name:var(--font-space-mono)] bg-[#FE9900]/10 text-[#FE9900] " +
  "";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight text-sm";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";

const NEU_LABEL =
  "font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-bold text-[#1E2938]/40 uppercase tracking-widest";

const NEU_REMOVE_BTN =
  "absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-lg " +
  "bg-[#E7E5E4]/90 text-[#FF2157] opacity-0 group-hover:opacity-100 " +
  " " +
  "hover:bg-[#FF2157] hover:text-white hover:shadow-none " +
  "transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2157]";

const NEU_WARNING_BANNER =
  "flex items-start gap-2.5 rounded-xl p-3.5 " +
  "bg-[#FE9900]/8 border border-[#FE9900]/30 " +
  "";

// ── Props ────────────────────────────────────────────────────────────────────
interface DestinationImageUploaderProps {
  imageIds: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function DestinationImageUploader({
  imageIds,
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5,
}: DestinationImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = IMAGE_EXTENSIONS;
  const maxFileBytes = maxSizeMB * 1024 * 1024;
  const isAtLimit = imageIds.length >= maxImages;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (imageIds.length + files.length > maxImages) {
      toast.warning(
        `Maximum ${maxImages} images allowed. You can add ${maxImages - imageIds.length} more.`
      );
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        if (
          !allowedExtensions.includes(
            extension as "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp"
          )
        ) {
          toast.warning(
            `Skipped ${file.name}: Only ${allowedExtensions.join(", ")} files are allowed.`
          );
          continue;
        }
        if (file.size > maxFileBytes) {
          toast.warning(`Skipped ${file.name}: File size exceeds ${maxSizeMB}MB limit.`);
          continue;
        }
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (error) {
        toast.warning(
          `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...imageIds, ...newImages]);
      toast.success(`Added ${newImages.length} image(s) successfully.`);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const removeImage = (index: number) => {
    const updated = [...imageIds];
    updated.splice(index, 1);
    onImagesChange(updated);
    toast.info("Image removed.");
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const getFileExtension = (base64String: string): string => {
    const match = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    return match ? match[1] : "unknown";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className={NEU_HEADING}>Images</h4>
          <p className={NEU_MUTED}>
            Up to {maxImages} images &middot; {allowedExtensions.join(", ")} &middot; Max {maxSizeMB}MB each
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Count badge */}
          <span className={isAtLimit ? NEU_BADGE_WARNING : NEU_BADGE}>
            {imageIds.length} / {maxImages}
          </span>

          {/* Upload trigger button */}
          <button
            type="button"
            className={NEU_BTN_GHOST}
            onClick={triggerFileInput}
            disabled={isUploading || isAtLimit}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      {/* ── Hidden file input ────────────────────────────────────────────── */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowedExtensions.map((ext) => `.${ext}`).join(",")}
        multiple
        className="hidden"
        disabled={isUploading || isAtLimit}
      />

      {/* ── Image grid / Empty state ─────────────────────────────────────── */}
      {imageIds.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {imageIds.map((image, index) => (
            <div key={index} className={`${NEU_CARD_SM} p-2 group`}>
              {/* Thumbnail */}
              <div className="aspect-square relative overflow-hidden rounded-lg bg-[#d0cecd]">
                <Image
                  src={image || "/placeholder-image.svg"}
                  alt={`Destination image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-image.svg";
                  }}
                />

                {/* Remove button (appears on hover) */}
                <button
                  type="button"
                  className={NEU_REMOVE_BTN}
                  onClick={() => removeImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* File type label */}
              <p className={`${NEU_LABEL} mt-1.5 truncate text-center`}>
                {getFileExtension(image).toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div
          className={`${NEU_SURFACE_INSET} rounded-2xl border border-white/40 py-10 flex flex-col items-center justify-center gap-3 cursor-pointer`}
          onClick={triggerFileInput}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
          aria-label="Upload images"
        >
          <div className="p-4 rounded-2xl bg-[#E7E5E4] ">
            <ImageIcon className="w-8 h-8 text-[#1E2938]/30" />
          </div>
          <div className="text-center">
            <p className={`${NEU_HEADING} mb-0.5`}>No images uploaded yet</p>
            <p className={NEU_MUTED}>Click to browse or drag &amp; drop</p>
          </div>
          <button
            type="button"
            className={NEU_BTN_PRIMARY}
            onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" />
            Upload Images
          </button>
        </div>
      )}

      {/* ── At-limit warning ─────────────────────────────────────────────── */}
      {isAtLimit && (
        <div className={NEU_WARNING_BANNER}>
          <span className="text-[#FE9900] mt-0.5 flex-shrink-0">⚠</span>
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70">
            Maximum of <span className="font-bold text-[#FE9900]">{maxImages}</span> images reached.
            Remove some images to add more.
          </p>
        </div>
      )}
    </div>
  );
}