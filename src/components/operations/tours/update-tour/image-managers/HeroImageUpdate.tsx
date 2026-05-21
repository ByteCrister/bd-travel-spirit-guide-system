// app/operations/tours/[tourId]/update-tour/components/HeroImageUpdate.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { fileToBase64, IMAGE_EXTENSIONS, isAllowedExtension } from '@/utils/helpers/file-conversion';
import {
  Upload, Trash2, Save, X,
  Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { showToast } from '@/components/global/showToast';
import api from '@/utils/axios/axios';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { TourDetailDTO } from '@/types/tour/tour.types';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiResponse } from '@/types/common/api.types';

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE   = 'bg-[#E7E5E4]';
const NEU_CARD      = 'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_INSET     = 'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_DIVIDER   = 'border-[#1E2938]/10';
const NEU_HEADING   = 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL     = 'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED     = 'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_ICON_WELL = 'p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]';

const NEU_BTN_PRIMARY =
  'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide ' +
  'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
  'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
  'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
  'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';

const NEU_BTN_GHOST =
  'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] ' +
  'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60 ' +
  'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
  'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';

const NEU_BTN_DANGER =
  'rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] ' +
  'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60 ' +
  'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
  'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';

const NEU_ALERT_WARNING = 'rounded-xl bg-[#FE9900]/8 border border-[#FE9900]/25 shadow-[2px_2px_6px_#c8c6c5,-2px_-2px_6px_#ffffff]';
const NEU_ALERT_DANGER  = 'rounded-xl bg-[#FF2157]/5 border border-[#FF2157]/20 shadow-[2px_2px_6px_#c8c6c5,-2px_-2px_6px_#ffffff]';

const NEU_PROGRESS_TRACK = 'w-full h-2 rounded-full bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] overflow-hidden';
const NEU_PROGRESS_BAR   = 'h-full rounded-full bg-[#006666] shadow-[0_0_6px_#006666]/40 transition-all duration-300';

const NEU_GUIDELINE_ITEM = 'flex items-start gap-2.5 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60';

interface HeroImageUpdateProps {
  tourId: string;
  currentHeroImage?: string;
  updateData: (updates: Partial<TourDetailDTO>) => void;
}

const getApiUrl = (tourId: string) => `/operations/tours/v1/${tourId}/hero-image`;

export default function HeroImageUpdate({ tourId, currentHeroImage, updateData }: HeroImageUpdateProps) {
  const queryClient       = useQueryClient();
  const fileInputRef      = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [pendingImage, setPendingImage] = useState<{
    file: File;
    previewUrl: string;
    base64?: string;
  } | null>(null);

  const [isRemoving, setIsRemoving]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isRemoving) {
        const { data } = await api.patch(getApiUrl(tourId), { heroImage: null });
        return data;
      } else if (pendingImage?.base64) {
        const { data } = await api.patch<ApiResponse<{ data: string }>>(getApiUrl(tourId), {
          heroImage: pendingImage.base64,
        });
        return data;
      }
      throw new Error('No changes to save');
    },
    onSuccess: (data) => {
      if (isRemoving) {
        updateData({ heroImage: undefined });
        showToast.success('Hero image removed successfully!');
      } else if (pendingImage?.base64) {
        updateData({ heroImage: data.data || pendingImage.base64 });
        showToast.success('Hero image updated successfully!');
      }
      resetPendingChanges();
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
    onError: (error: Error) => {
      showToast.error(`Failed to save changes: ${extractErrorMessage(error)}`);
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) {
        showToast.warning('File size exceeds 5MB limit. Please choose a smaller image.');
        event.target.value = '';
        return;
      }
      if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
        showToast.warning('Invalid file type. Please upload an image (JPG, PNG, GIF, WebP, or BMP)');
        event.target.value = '';
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      simulateUploadProgress();
      processImage(file, previewUrl);
    } catch {
      showToast.error('Failed to process file');
      event.target.value = '';
    }
  };

  const processImage = async (file: File, previewUrl: string) => {
    try {
      showToast.info('Processing image...');
      const base64Image = await fileToBase64(file, {
        compressImages: true,
        maxWidth: 1920,
        quality: 0.85,
        maxFileBytes: 5 * 1024 * 1024,
      });
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setPendingImage({ file, previewUrl, base64: base64Image });
      setIsRemoving(false);
      setUploadProgress(100);
      showToast.info('Image processed and ready to save');
    } catch {
      showToast.error('Failed to process image');
      URL.revokeObjectURL(previewUrl);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    if (!currentHeroImage && !pendingImage) return;
    if (pendingImage) { resetPendingChanges(); return; }
    setIsRemoving(true);
    setPendingImage(null);
    showToast.info('Hero image marked for removal. Click Save to confirm.');
  };

  const handleSave = () => {
    if (!isRemoving && !pendingImage?.base64) {
      showToast.warning('No changes to save');
      return;
    }
    saveMutation.mutate();
  };

  const handleCancel = () => {
    resetPendingChanges();
    showToast.info('Changes discarded');
  };

  const resetPendingChanges = () => {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
    setIsRemoving(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const simulateUploadProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setUploadProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressIntervalRef.current!);
          progressIntervalRef.current = null;
          return 95;
        }
        return prev + 5;
      });
    }, 100);
  };

  React.useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayImage      = pendingImage?.previewUrl || currentHeroImage;
  const hasPendingChanges = pendingImage || isRemoving;
  const isProcessing      = uploadProgress > 0 && uploadProgress < 100;

  const cardVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const imageVariants = {
    hidden:  { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1,  transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="mb-6">
      <div className={NEU_CARD}>

        {/* ── Card Header ── */}
        <div className={`flex flex-row items-center justify-between p-5 border-b ${NEU_DIVIDER}`}>
          <div className="flex items-center gap-3">
            <div className={NEU_ICON_WELL}>
              <ImageIcon className="h-5 w-5 text-[#006666]" />
            </div>
            <div>
              <h3 className={`text-base ${NEU_HEADING}`}>Hero Image</h3>
              <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>Main banner shown on tour listing</p>
            </div>
          </div>

          <AnimatePresence>
            {hasPendingChanges && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCancel}
                  disabled={saveMutation.isPending}
                  className={`${NEU_BTN_GHOST} flex items-center gap-2 px-3 py-2 text-sm`}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSave}
                  disabled={saveMutation.isPending || isProcessing}
                  className={`${NEU_BTN_PRIMARY} flex items-center gap-2 px-3 py-2 text-sm`}
                >
                  {saveMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Save className="h-4 w-4" />}
                  {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Card Content ── */}
        <div className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

            {/* Image Preview */}
            <AnimatePresence mode="wait">
              {displayImage ? (
                <motion.div
                  key="has-image"
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`relative w-full md:w-56 h-56 rounded-2xl overflow-hidden ${NEU_INSET}`}
                >
                  <Image
                    src={displayImage}
                    alt={pendingImage ? 'New hero image preview' : 'Current hero image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 224px"
                  />
                  {pendingImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-4"
                    >
                      <span className="flex items-center gap-2 bg-[#FE9900] text-white px-4 py-1.5 rounded-full text-xs font-[family-name:var(--font-space-mono)] font-bold shadow-lg">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Unsaved
                      </span>
                    </motion.div>
                  )}
                  {isRemoving && currentHeroImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4"
                    >
                      <span className="flex items-center gap-2 bg-[#FF2157] text-white px-4 py-1.5 rounded-full text-xs font-[family-name:var(--font-space-mono)] font-bold shadow-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                        Marked for Removal
                      </span>
                      <p className="text-white text-xs text-center font-[family-name:var(--font-jetbrains-mono)]">
                        Will be removed on save
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="no-image"
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`w-full md:w-56 h-56 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-[#1E2938]/15 ${NEU_SURFACE}`}
                >
                  <ImageIcon className="h-10 w-10 text-[#1E2938]/30 mb-2" />
                  <p className={`text-sm ${NEU_MUTED}`}>No hero image</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions & Info */}
            <div className="flex-1 space-y-5 w-full">
              {/* Upload / Remove Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div>
                  <input
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    id="hero-image-upload"
                    type="file"
                    onChange={handleFileChange}
                    disabled={saveMutation.isPending || isProcessing}
                  />
                  <label htmlFor="hero-image-upload">
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer ${
                        saveMutation.isPending || isProcessing
                          ? 'opacity-40 cursor-not-allowed pointer-events-none'
                          : ''
                      } ${NEU_BTN_GHOST}`}
                    >
                      {isProcessing
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Upload className="h-4 w-4" />}
                      {isProcessing ? 'Processing…' : 'Upload New'}
                    </motion.span>
                  </label>
                </div>

                {(currentHeroImage || pendingImage) && !saveMutation.isPending && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleRemove}
                    disabled={saveMutation.isPending || isProcessing}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm ${NEU_BTN_DANGER}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {pendingImage ? 'Discard' : 'Remove'}
                  </motion.button>
                )}
              </div>

              {/* Upload Progress */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <div className={NEU_PROGRESS_TRACK}>
                      <div className={NEU_PROGRESS_BAR} style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className={`flex items-center gap-2 ${NEU_MUTED}`}>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing image… {uploadProgress}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pending Alerts */}
              <AnimatePresence>
                {hasPendingChanges && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    {pendingImage && (
                      <div className={`flex items-start gap-3 p-4 ${NEU_ALERT_WARNING}`}>
                        <CheckCircle2 className="h-4 w-4 text-[#FE9900] mt-0.5 shrink-0" />
                        <div>
                          <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                            Image ready to save
                          </p>
                          <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>
                            Click &quot;Save Changes&quot; to update the hero image
                          </p>
                        </div>
                      </div>
                    )}
                    {isRemoving && (
                      <div className={`flex items-start gap-3 p-4 ${NEU_ALERT_DANGER}`}>
                        <AlertTriangle className="h-4 w-4 text-[#FF2157] mt-0.5 shrink-0" />
                        <div>
                          <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                            Hero image marked for removal
                          </p>
                          <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>
                            Click &quot;Save Changes&quot; to confirm removal
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Guidelines */}
              <div className={`rounded-xl p-4 space-y-2 ${NEU_INSET}`}>
                <p className={NEU_LABEL}>Guidelines</p>
                <div className="mt-2 space-y-1.5">
                  {[
                    'Recommended: 1920×1080 px (16:9)',
                    'Maximum size: 5 MB',
                    'Supported: JPG, PNG, GIF, WebP, BMP',
                  ].map((text) => (
                    <p key={text} className={NEU_GUIDELINE_ITEM}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1E2938]/30 shrink-0" />
                      {text}
                    </p>
                  ))}
                  <p className={`pt-1 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666] flex items-start gap-2.5`}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#006666] shrink-0" />
                    Changes are saved only when you click &quot;Save Changes&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}