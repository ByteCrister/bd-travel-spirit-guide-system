'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, Save, Loader2, Images, X, RefreshCw, AlertCircle } from 'lucide-react';
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

interface GalleryUpdateProps {
  tourId: string;
  currentGallery: string[];
  updateData: (updates: Partial<TourDetailDTO>) => void;
}

const getApiUrl = (tourId: string) => {
  return `/operations/tours/v1/${tourId}/gallery`
}

// Constants for upload limits
const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
      const message = extractErrorMessage(error);
      showToast.error(`Failed to update gallery: ${message}`);
    },
  });

  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    try {
      // Validate each file before processing
      const validatedFiles: File[] = [];
      const validationErrors: string[] = [];

      files.forEach((file) => {
        // Check file extension
        if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
          validationErrors.push(`Invalid file type: ${file.name}`);
          return;
        }

        // Check file size (5MB limit)
        if (file.size > MAX_FILE_SIZE_BYTES) {
          validationErrors.push(
            `${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
          );
          return;
        }

        validatedFiles.push(file);
      });

      // Show validation errors if any
      if (validationErrors.length > 0) {
        showToast.warning(
          `Some files were skipped:\n${validationErrors.join('\n')}`,
        );
      }

      if (validatedFiles.length === 0) {
        showToast.warning('No valid image files selected');
        return [];
      }

      // Process valid files
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

      // Filter out any failed conversions
      return base64Images.filter(img => img !== null);
    } catch (error) {
      const message = extractErrorMessage(error);
      showToast.error(`Image processing failed: ${message}`);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    // Calculate how many more images can be added
    const remainingSlots = MAX_IMAGES - localGallery.length;
    
    if (remainingSlots <= 0) {
      showToast.warning(`Gallery is full. Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    if (files.length > remainingSlots) {
      showToast.warning(`You can only add ${remainingSlots} more image(s) (max ${MAX_IMAGES} total)`);
      // Only process the first N files that fit in remaining slots
      const filesToProcess = files.slice(0, remainingSlots);
      const newImages = await convertFilesToBase64(filesToProcess);
      
      if (newImages.length > 0) {
        setLocalGallery(prev => [...prev, ...newImages]);
        setIsGalleryModified(true);
      }
      return;
    }

    // If within limits, process all files
    const newImages = await convertFilesToBase64(files);

    if (newImages.length > 0) {
      setLocalGallery(prev => [...prev, ...newImages]);
      setIsGalleryModified(true);
    }
  };

  const handleReplaceAll = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    if (files.length > MAX_IMAGES) {
      showToast.warning(`Maximum ${MAX_IMAGES} images allowed. Only the first ${MAX_IMAGES} will be processed.`);
      // Only process first MAX_IMAGES files
      const filesToProcess = files.slice(0, MAX_IMAGES);
      const newImages = await convertFilesToBase64(filesToProcess);

      if (newImages.length > 0) {
        setLocalGallery(newImages);
        setIsGalleryModified(true);
      }
      return;
    }

    const newImages = await convertFilesToBase64(files);

    if (newImages.length > 0) {
      setLocalGallery(newImages);
      setIsGalleryModified(true);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedGallery = localGallery.filter((_, i) => i !== index);
    setLocalGallery(updatedGallery);
    setIsGalleryModified(true);
  };

  const handleRemoveAll = () => {
    if (localGallery.length === 0) return;

    if (window.confirm('Are you sure you want to remove all gallery images?')) {
      setLocalGallery([]);
      setIsGalleryModified(true);
    }
  };

  const handleSaveGallery = () => {
    if (!isGalleryModified) {
      showToast.warning('No changes to save');
      return;
    }

    // Validate we don't exceed MAX_IMAGES (shouldn't happen with UI controls, but just in case)
    if (localGallery.length > MAX_IMAGES) {
      showToast.warning(`Maximum ${MAX_IMAGES} images allowed. Please remove some images before saving.`);
      return;
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const imageItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50 border border-violet-100">
                <Images className="h-5 w-5 text-violet-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-800">Gallery Images</CardTitle>
            </div>
            <p className="text-sm text-slate-600 ml-12">
              <span className="font-medium text-slate-700">{localGallery.length}</span> / {MAX_IMAGES} image(s) in gallery
              {isGalleryModified && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-2 text-amber-600 font-medium inline-flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Unsaved changes
                </motion.span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              accept="image/*"
              className="hidden"
              id="gallery-add"
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isProcessing || localGallery.length >= MAX_IMAGES}
            />
            <input
              accept="image/*"
              className="hidden"
              id="gallery-replace"
              type="file"
              multiple
              onChange={handleReplaceAll}
              disabled={isProcessing}
            />
            <label htmlFor="gallery-add">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  disabled={isProcessing || localGallery.length >= MAX_IMAGES}
                  asChild
                >
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Add Images
                    {localGallery.length >= MAX_IMAGES && (
                      <span className="text-xs text-amber-600">(Full)</span>
                    )}
                  </span>
                </Button>
              </motion.div>
            </label>
            <label htmlFor="gallery-replace">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  disabled={isProcessing}
                  asChild
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Replace All
                  </span>
                </Button>
              </motion.div>
            </label>
            {localGallery.length > 0 && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleRemoveAll}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove All
                </Button>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {localGallery.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {localGallery.map((imageId, index) => (
                  <motion.div
                    key={`${imageId}-${index}`}
                    variants={imageItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="relative group"
                  >
                    <div className="relative h-32 rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm transition-all group-hover:shadow-md group-hover:border-slate-300">
                      <Image
                        src={imageId}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 bg-red-500 hover:bg-red-600 shadow-lg"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove image {index + 1}</span>
                      </Button>
                    </motion.div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                      {index + 1}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50"
            >
              <Images className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium mb-1">No images in gallery</p>
              <p className="text-sm text-slate-500">
                Upload up to {MAX_IMAGES} images to get started
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">Processing images...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isGalleryModified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 pt-6 border-t border-slate-200"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-900 font-medium">
                        You have unsaved changes
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Click &quot;Save Gallery&quot; to apply your changes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelChanges}
                        disabled={isProcessing}
                        className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                      <Button
                        onClick={handleSaveGallery}
                        disabled={isProcessing}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Gallery
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Supported formats: JPEG, PNG, GIF, WebP, BMP
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Maximum file size: {MAX_FILE_SIZE_MB}MB per image
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Maximum {MAX_IMAGES} images in gallery
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Images are automatically compressed for optimal display
            </p>
            <p className="flex items-center gap-2 pt-2 font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Changes are saved locally until you click &quot;Save Gallery&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}