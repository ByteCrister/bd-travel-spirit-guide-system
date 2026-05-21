"use client";

import { useFormikContext } from "formik";
import Image from "next/image";
import { useRef, ChangeEvent, useState } from "react";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { fileToBase64 } from "@/utils/helpers/file-conversion";
import { showToast } from "@/components/global/showToast";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 disabled:opacity-40 disabled:cursor-not-allowed";

const NEU_BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE_PRIMARY =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

// ── Constants ─────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface HeroAndGalleryUploadProps {
  heroImageError?: string;
  galleryError?: string;
}

export default function HeroAndGalleryUpload({
  heroImageError,
  galleryError,
}: HeroAndGalleryUploadProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<CreateTourDTO>();
  const [uploading, setUploading] = useState(false);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    files: FileList | File[],
    fieldName: "heroImage" | "gallery",
    isMultiple = false
  ) => {
    const fileArray = Array.from(files);

    if (fieldName === "heroImage" && fileArray.length > 1) {
      showToast.warning("Only one hero image is allowed");
    }

    if (
      fieldName === "gallery" &&
      (values.gallery?.length || 0) + fileArray.length > 10
    ) {
      showToast.warning("Maximum 10 images allowed in gallery");
      return;
    }

    const validFiles = fileArray.filter((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showToast.warning(`Unsupported image type: ${file.name}`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast.warning(`File too large (max 5MB): ${file.name}`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setUploading(true);
    try {
      const base64Images = await Promise.all(
        validFiles.map((file) =>
          fileToBase64(file, {
            compressImages: true,
            maxWidth: 1920,
            quality: 0.8,
            maxFileBytes: MAX_FILE_SIZE,
            allowedExtensions: ["jpg", "jpeg", "png", "webp"],
          })
        )
      );

      if (fieldName === "heroImage") {
        const heroImage = base64Images[0];
        if (heroImage) {
          setFieldValue("heroImage", heroImage);
          setFieldTouched("heroImage", true);
        }
      }

      if (fieldName === "gallery" && isMultiple) {
        const updatedGallery = [
          ...(values.gallery || []),
          ...base64Images,
        ].slice(0, 10);
        setFieldValue("gallery", updatedGallery);
        setFieldTouched("gallery", true);
      }

      showToast.success(
        `Uploaded ${base64Images.length} image${base64Images.length > 1 ? "s" : ""}`
      );
    } catch (err) {
      console.error("Image upload error:", err);
      showToast.error("Image upload failed");
    } finally {
      setUploading(false);
      if (heroInputRef.current) heroInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removeGalleryImage = (index: number) => {
    const updatedGallery = [...(values.gallery || [])];
    updatedGallery.splice(index, 1);
    setFieldValue("gallery", updatedGallery);
    setFieldTouched("gallery", true);
  };

  const handleHeroClick = () => heroInputRef.current?.click();
  const handleGalleryClick = () => galleryInputRef.current?.click();

  const handleHeroChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileUpload(e.target.files, "heroImage");
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length)
      handleFileUpload(e.target.files, "gallery", true);
  };

  const galleryCount = values.gallery?.length || 0;

  return (
    <div className={`${NEU_SURFACE} w-full space-y-6`}>
      {/* Section header */}
      <div className="space-y-1">
        <h3 className={`${NEU_HEADING} text-base`}>Images</h3>
        <p className={NEU_MUTED}>
          Upload a hero image and gallery images (max 5 MB each, up to 10 images in gallery)
        </p>
      </div>

      {/* ── Hero Image ──────────────────────────────────────── */}
      <div className={`${NEU_CARD} p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <span className={NEU_LABEL}>Hero Image</span>
          <span className={NEU_BADGE_PRIMARY}>Required</span>
        </div>

        <input
          type="file"
          ref={heroInputRef}
          onChange={handleHeroChange}
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="hidden"
        />

        {values.heroImage ? (
          <div className={`${NEU_CARD_SM} p-3 flex items-center gap-4`}>
            {/* Thumbnail */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]">
              <Image
                src={values.heroImage}
                alt="Hero preview"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <p className={`${NEU_HEADING} text-sm`}>Hero image uploaded</p>
              <p className={`${NEU_MUTED} text-xs`}>Click replace to change the image</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleHeroClick}
                disabled={uploading}
                className={`${NEU_BTN_GHOST} px-3 py-1.5 text-xs`}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  setFieldValue("heroImage", "");
                  setFieldTouched("heroImage", true);
                }}
                className={NEU_BTN_ICON}
                aria-label="Remove hero image"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleHeroClick}
            disabled={uploading}
            className={`w-full py-8 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#1E2938]/15 ${NEU_INSET} hover:border-[#006666]/40 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {uploading ? (
              <div className="w-8 h-8 rounded-full border-2 border-[#006666]/30 border-t-[#006666] animate-spin" />
            ) : (
              <div className="p-3 rounded-xl bg-[#006666]/10 group-hover:bg-[#006666]/15 transition-colors">
                <ImagePlus size={22} className="text-[#006666]" />
              </div>
            )}
            <div className="text-center space-y-0.5">
              <p className={`${NEU_HEADING} text-sm`}>
                {uploading ? "Uploading…" : "Upload Hero Image"}
              </p>
              <p className={`${NEU_MUTED} text-xs`}>JPG, PNG or WEBP · max 5 MB</p>
            </div>
          </button>
        )}

        {heroImageError && (
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157] mt-1">
            {heroImageError}
          </p>
        )}
      </div>

      {/* ── Gallery Images ──────────────────────────────────── */}
      <div className={`${NEU_CARD} p-5 space-y-4`}>
        <div className="flex items-center justify-between">
          <span className={NEU_LABEL}>Gallery Images</span>
          <span className={galleryCount >= 10 ? NEU_BADGE_DANGER : NEU_BADGE_PRIMARY}>
            {galleryCount} / 10
          </span>
        </div>

        <input
          type="file"
          ref={galleryInputRef}
          onChange={handleGalleryChange}
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
        />

        <button
          type="button"
          onClick={handleGalleryClick}
          disabled={uploading || galleryCount >= 10}
          className={`w-full py-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#1E2938]/15 ${NEU_INSET} hover:border-[#006666]/40 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {uploading ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#006666]/30 border-t-[#006666] animate-spin" />
          ) : (
            <Upload size={16} className="text-[#006666] group-hover:scale-110 transition-transform" />
          )}
          <span className={`${NEU_HEADING} text-sm`}>
            {uploading ? "Uploading…" : "Add Gallery Images"}
          </span>
        </button>

        {galleryError && (
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]">
            {galleryError}
          </p>
        )}

        {/* Gallery grid */}
        {galleryCount > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {values.gallery!.map((image, index) => (
              <div
                key={index}
                className={`${NEU_CARD_SM} relative aspect-square overflow-hidden group`}
              >
                <Image
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
                {/* overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl" />
                {/* delete button */}
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-lg bg-[#E7E5E4]/90 text-[#FF2157] shadow-[2px_2px_5px_#c8c6c5,-1px_-1px_3px_#ffffff] opacity-0 group-hover:opacity-100 hover:bg-[#FF2157] hover:text-white transition-all duration-200"
                  aria-label={`Remove gallery image ${index + 1}`}
                >
                  <Trash2 size={12} />
                </button>
                {/* index badge */}
                <span className="absolute bottom-1.5 left-1.5 font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-white bg-black/50 rounded-md px-1.5 py-0.5">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Max reached warning */}
        {galleryCount >= 10 && (
          <div className={`${NEU_INSET} rounded-xl px-4 py-3 flex items-center gap-2`}>
            <span className="w-2 h-2 rounded-full bg-[#FE9900] shrink-0" />
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70">
              Maximum of 10 gallery images reached. Remove some to add more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}