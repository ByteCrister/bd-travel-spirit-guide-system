// app/operations/tours/[tourId]/update-tour/components/HeroImageUpdate.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { fileToBase64, IMAGE_EXTENSIONS, isAllowedExtension } from '@/utils/helpers/file-conversion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Save, X, Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { showToast } from '@/components/global/showToast';
import api from '@/utils/axios/axios';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { TourDetailDTO } from '@/types/tour.types';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiResponse } from '@/types/api.types';


interface HeroImageUpdateProps {
  tourId: string;
  currentHeroImage?: string;
  updateData: (updates: Partial<TourDetailDTO>) => void;
}

const getApiUrl = (tourId: string) => {
  return `/operations/tours/v1/${tourId}/hero-image`
}

export default function HeroImageUpdate({ tourId, currentHeroImage, updateData }: HeroImageUpdateProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const [pendingImage, setPendingImage] = useState<{
    file: File;
    previewUrl: string;
    base64?: string;
  } | null>(null);

  const [isRemoving, setIsRemoving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isRemoving) {
        const { data } = await api.patch(getApiUrl(tourId), {
          heroImage: null,
        });
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
      const message = extractErrorMessage(error);
      showToast.error(`Failed to save changes: ${message}`);
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
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

      setPendingImage({
        file,
        previewUrl,
        base64: base64Image,
      });

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

    if (pendingImage) {
      resetPendingChanges();
      return;
    }

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
    if (pendingImage?.previewUrl) {
      URL.revokeObjectURL(pendingImage.previewUrl);
    }
    setPendingImage(null);
    setIsRemoving(false);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUploadProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setUploadProgress(0);

    progressIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) return 100;
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
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (pendingImage?.previewUrl) {
        URL.revokeObjectURL(pendingImage.previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayImage = pendingImage?.previewUrl || currentHeroImage;
  const hasPendingChanges = pendingImage || isRemoving;
  const isProcessing = uploadProgress > 0 && uploadProgress < 100;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-800">Hero Image</CardTitle>
          </div>

          <AnimatePresence>
            {hasPendingChanges && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-2"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saveMutation.isPending}
                    className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={saveMutation.isPending || isProcessing}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <AnimatePresence mode="wait">
              {displayImage ? (
                <motion.div
                  key="has-image"
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="relative w-full md:w-56 h-56 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm"
                >
                  <Image
                    src={displayImage}
                    alt={pendingImage ? "New hero image preview" : "Current hero image"}
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
                      <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                        <AlertTriangle className="h-4 w-4" />
                        Unsaved Changes
                      </div>
                    </motion.div>
                  )}

                  {isRemoving && currentHeroImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4"
                    >
                      <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                        <Trash2 className="h-4 w-4" />
                        Marked for Removal
                      </div>
                      <p className="text-white text-sm text-center">
                        Image will be removed when you save
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
                  className="w-full md:w-56 h-56 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50"
                >
                  <ImageIcon className="h-12 w-12 text-slate-400 mb-2" />
                  <p className="text-slate-500 text-sm">No hero image</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 space-y-5 w-full">
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
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                        disabled={saveMutation.isPending || isProcessing}
                        asChild
                      >
                        <span className="cursor-pointer">
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {isProcessing ? 'Processing...' : 'Upload New'}
                        </span>
                      </Button>
                    </motion.div>
                  </label>
                </div>

                {(currentHeroImage || pendingImage) && !saveMutation.isPending && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      onClick={handleRemove}
                      disabled={saveMutation.isPending || isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                      {pendingImage ? 'Discard' : 'Remove'}
                    </Button>
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing image... {uploadProgress}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {hasPendingChanges && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {pendingImage && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-amber-900 font-medium">
                              Image ready to save
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Click &quot;Save Changes&quot; to update the hero image
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isRemoving && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-red-900 font-medium">
                              Hero image marked for removal
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              Click &quot;Save Changes&quot; to confirm removal
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Recommended: 1920×1080px (16:9 ratio)
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Maximum size: 5MB
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Supported: JPG, PNG, GIF, WebP, BMP
                </p>
                <p className="flex items-center gap-2 pt-2 font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Changes are saved only when you click &quot;Save Changes&quot;
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}