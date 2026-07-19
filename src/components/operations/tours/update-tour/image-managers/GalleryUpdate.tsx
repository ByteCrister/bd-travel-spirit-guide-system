'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Trash2, Upload, Save, Loader2,
  Images, X, RefreshCw, AlertCircle
} from 'lucide-react';
import {
  fileToBase64,
  IMAGE_EXTENSIONS,
  isAllowedExtension,
} from '@/utils/helpers/file-conversion';
import api from '@/utils/axios/axios';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { TourDetailDTO } from '@/types/tour/tour.types';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiResponse } from '@/types/common/api.types';

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_CARD = 'rounded-2xl bg-[#E7E5E4]  border border-white/60';
const NEU_INSET = 'bg-[#E7E5E4] ';
const NEU_DIVIDER = 'border-[#1E2938]/10';
const NEU_HEADING = 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL = 'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED = 'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_ICON_WELL = 'p-2.5 rounded-xl bg-[#E7E5E4] ';

const NEU_BTN_PRIMARY =
  'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold ' +
  ' ' +
  'hover: hover:bg-[#007777] ' +
  'active: ' +
  'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';

const NEU_BTN_GHOST =
  'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] ' +
  ' border border-white/60 ' +
  'hover: ' +
  'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';

const NEU_BTN_DANGER =
  'rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] ' +
  ' border border-white/60 ' +
  'hover:bg-[#FF2157]/10 hover: ' +
  'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';

const NEU_IMAGE_TILE =
  'relative group rounded-xl overflow-hidden ' +
  ' border border-white/60 ' +
  'hover: transition-all duration-300';

const NEU_ALERT_WARNING = 'rounded-xl bg-[#FE9900]/8 border border-[#FE9900]/25 ';
const NEU_ALERT_INFO = 'rounded-xl bg-[#006666]/5 border border-[#006666]/20 ';

const NEU_BADGE =
  'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
  'bg-[#E7E5E4] text-[#1E2938]/60 ';

// ── Constants ─────────────────────────────────────────────────
const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface GalleryUpdateProps {
  tourId: string;
  currentGallery: string[];
  updateData: (updates: Partial<TourDetailDTO>) => void;
}

const getApiUrl = (tourId: string) => `/operations/tours/v1/${tourId}/gallery`;

export default function GalleryUpdate({ tourId, currentGallery, updateData }: GalleryUpdateProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [localGallery, setLocalGallery] = useState<string[]>(currentGallery);
  const [isGalleryModified, setIsGalleryModified] = useState(false);

  React.useEffect(() => {
    setLocalGallery(currentGallery);
    setIsGalleryModified(false);
  }, [currentGallery]);

  const updateMutation = useMutation({
    mutationFn: async (galleryBase64: string[]) => {
      const response = await api.patch<ApiResponse<string[]>>(getApiUrl(tourId), {
        gallery: galleryBase64,
      });
      return response.data;
    },
    onSuccess: (data) => {
      updateData({ gallery: data?.data });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      showToast.success('Gallery updated successfully');
      setIsGalleryModified(false);
    },
    onError: (error) => {
      showToast.error(`Failed to update gallery: ${extractErrorMessage(error)}`);
    },
  });

  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    try {
      const validatedFiles: File[] = [];
      const validationErrors: string[] = [];

      files.forEach((file) => {
        if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
          validationErrors.push(`Invalid file type: ${file.name}`);
          return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          validationErrors.push(
            `${file.name} exceeds ${MAX_FILE_SIZE_MB}MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
          );
          return;
        }
        validatedFiles.push(file);
      });

      if (validationErrors.length > 0)
        showToast.warning(`Some files were skipped:\n${validationErrors.join('\n')}`);
      if (validatedFiles.length === 0) {
        showToast.warning('No valid image files selected');
        return [];
      }

      const base64Images = await Promise.all(
        validatedFiles.map((file) =>
          fileToBase64(file, {
            compressImages: true,
            maxWidth: 1920,
            quality: 0.8,
            maxFileBytes: MAX_FILE_SIZE_BYTES,
          })
        )
      );
      return base64Images.filter((img) => img !== null);
    } catch (error) {
      showToast.error(`Image processing failed: ${extractErrorMessage(error)}`);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const remainingSlots = MAX_IMAGES - localGallery.length;
    if (remainingSlots <= 0) {
      showToast.warning(`Gallery is full. Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots)
      showToast.warning(`Only ${remainingSlots} more image(s) allowed (max ${MAX_IMAGES} total)`);

    const newImages = await convertFilesToBase64(filesToProcess);
    if (newImages.length > 0) {
      setLocalGallery((prev) => [...prev, ...newImages]);
      setIsGalleryModified(true);
    }
  };

  const handleReplaceAll = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    if (files.length > MAX_IMAGES)
      showToast.warning(`Maximum ${MAX_IMAGES} images. Only the first ${MAX_IMAGES} will be processed.`);

    const newImages = await convertFilesToBase64(files.slice(0, MAX_IMAGES));
    if (newImages.length > 0) {
      setLocalGallery(newImages);
      setIsGalleryModified(true);
    }
  };

  const handleRemoveImage = (index: number) => {
    setLocalGallery((prev) => prev.filter((_, i) => i !== index));
    setIsGalleryModified(true);
  };

  const handleRemoveAll = () => {
    if (!localGallery.length) return;
    if (window.confirm('Are you sure you want to remove all gallery images?')) {
      setLocalGallery([]);
      setIsGalleryModified(true);
    }
  };

  const handleSaveGallery = () => {
    if (!isGalleryModified) { showToast.warning('No changes to save'); return; }
    if (localGallery.length > MAX_IMAGES) {
      showToast.warning(`Maximum ${MAX_IMAGES} images allowed.`); return;
    }
    updateMutation.mutate(localGallery);
  };

  const handleCancelChanges = () => {
    setLocalGallery(currentGallery);
    setIsGalleryModified(false);
  };

  const isProcessing = updateMutation.isPending || isUploading;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const imageItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-6">
      <div className={NEU_CARD}>

        {/* ── Header ── */}
        <div className={`flex flex-row items-center justify-between p-5 border-b ${NEU_DIVIDER} flex-wrap gap-3`}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className={NEU_ICON_WELL}>
                <Images className="h-5 w-5 text-[#006666]" />
              </div>
              <h3 className={`text-base ${NEU_HEADING}`}>Gallery Images</h3>
            </div>
            <div className="ml-[52px] flex items-center gap-2">
              <span className={NEU_BADGE}>
                {localGallery.length} / {MAX_IMAGES}
              </span>
              <AnimatePresence>
                {isGalleryModified && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-space-mono)] text-[#FE9900]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FE9900]" />
                    Unsaved changes
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Hidden inputs */}
            <input
              accept="image/*" className="hidden" id="gallery-add" type="file" multiple
              onChange={handleFileChange}
              disabled={isProcessing || localGallery.length >= MAX_IMAGES}
            />
            <input
              accept="image/*" className="hidden" id="gallery-replace" type="file" multiple
              onChange={handleReplaceAll} disabled={isProcessing}
            />

            <label htmlFor="gallery-add">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${isProcessing || localGallery.length >= MAX_IMAGES
                    ? 'opacity-40 pointer-events-none'
                    : ''
                  } ${NEU_BTN_GHOST}`}
              >
                <Upload className="h-4 w-4" />
                Add Images
                {localGallery.length >= MAX_IMAGES && (
                  <span className="text-xs text-[#FE9900]">(Full)</span>
                )}
              </motion.span>
            </label>

            <label htmlFor="gallery-replace">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm cursor-pointer ${isProcessing ? 'opacity-40 pointer-events-none' : ''
                  } ${NEU_BTN_GHOST}`}
              >
                <RefreshCw className="h-4 w-4" />
                Replace All
              </motion.span>
            </label>

            {localGallery.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleRemoveAll}
                disabled={isProcessing}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm ${NEU_BTN_DANGER}`}
              >
                <Trash2 className="h-4 w-4" />
                Remove All
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-5 space-y-6">

          {/* Gallery Grid */}
          {localGallery.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {localGallery.map((imageId, index) => (
                  <motion.div
                    key={`${imageId}-${index}`}
                    variants={imageItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`relative ${NEU_IMAGE_TILE}`}
                  >
                    <div className="relative h-32 rounded-xl overflow-hidden">
                      {imageId ? (
                      <Image
                        src={imageId}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23ccc%22/%3E%3C/svg%3E';
                        }}
                      />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No image</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Index badge */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-md text-[10px] font-[family-name:var(--font-space-mono)] font-bold backdrop-blur-sm">
                      {index + 1}
                    </div>

                    {/* Delete button */}
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-[#FF2157] hover:bg-[#e01a4a] text-white p-1.5 rounded-full shadow-lg transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isProcessing}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-[#1E2938]/15 ${NEU_INSET}`}
            >
              <Images className="h-14 w-14 text-[#1E2938]/20 mb-3" />
              <p className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/40 text-sm">
                No images in gallery
              </p>
              <p className={`text-xs mt-1 ${NEU_MUTED}`}>
                Upload up to {MAX_IMAGES} images to get started
              </p>
            </motion.div>
          )}

          {/* Upload spinner */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center overflow-hidden"
              >
                <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl ${NEU_ALERT_INFO}`}>
                  <Loader2 className="h-5 w-5 animate-spin text-[#006666]" />
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666]">
                    Processing images…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unsaved alert + save actions */}
          <AnimatePresence>
            {isGalleryModified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`border-t ${NEU_DIVIDER} pt-5`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className={`flex items-start gap-3 p-4 ${NEU_ALERT_WARNING}`}>
                    <AlertCircle className="h-5 w-5 text-[#FE9900] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                        You have unsaved changes
                      </p>
                      <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>
                        Click &quot;Save Gallery&quot; to apply your changes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancelChanges}
                      disabled={isProcessing}
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm ${NEU_BTN_GHOST}`}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleSaveGallery}
                      disabled={isProcessing}
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm ${NEU_BTN_PRIMARY}`}
                    >
                      {updateMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                      ) : (
                        <><Save className="h-4 w-4" />Save Gallery</>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guidelines */}
          <div className={`rounded-xl p-4 space-y-1.5 ${NEU_INSET}`}>
            <p className={NEU_LABEL}>Guidelines</p>
            <div className="mt-2 space-y-1.5">
              {[
                'Supported formats: JPEG, PNG, GIF, WebP, BMP',
                `Maximum file size: ${MAX_FILE_SIZE_MB}MB per image`,
                `Maximum ${MAX_IMAGES} images in gallery`,
                'Images are automatically compressed for optimal display',
              ].map((text) => (
                <p key={text} className={`flex items-start gap-2.5 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60`}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E2938]/30 shrink-0" />
                  {text}
                </p>
              ))}
              <p className="flex items-start gap-2.5 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666] pt-1">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#006666] shrink-0" />
                Changes are saved locally until you click &quot;Save Gallery&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}