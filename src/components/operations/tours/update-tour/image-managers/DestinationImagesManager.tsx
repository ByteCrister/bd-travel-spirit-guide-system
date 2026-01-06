// app/operations/tours/[tourId]/update-tour/components/DestinationImagesManager.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Save,
  X,
  ImageIcon,
  MapPin,
  Sparkles,
  Upload,
  Loader2
} from 'lucide-react';
import api from '@/utils/axios/axios';
import { fileToBase64, IMAGE_EXTENSIONS, isAllowedExtension } from '@/utils/helpers/file-conversion';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { DestinationBlockDTO, TourDetailDTO } from '@/types/tour.types';

const getDestinationUrl = (tourId: string) => {
  return `/operations/tours/v1/${tourId}/destinations/images-bulk`
}

const getAttractionUrl = (tourId: string) => {
  return `/operations/tours/v1/${tourId}/destinations/attractions/images-bulk`
}

type SelectedFile = { file: File; preview: string };

type ImageDraft = {
  existing: string[];
  toDelete: Set<string>;
  toAdd: SelectedFile[];
};

interface Props {
  tourId: string;
  destinations: DestinationBlockDTO[];
  updateData: (updates: Partial<TourDetailDTO>) => void;
}

export default function DestinationImagesManager({ tourId, destinations, updateData }: Props) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string[]>([]);

  // Destination-level drafts
  const [destDrafts, setDestDrafts] = useState<ImageDraft[]>(
    destinations.map(d => ({ existing: d.imageIds ?? [], toDelete: new Set(), toAdd: [] }))
  );

  // Attraction-level drafts: [destIdx][attrIdx]
  const [attrDrafts, setAttrDrafts] = useState<ImageDraft[][]>(
    destinations.map(d =>
      d.attractions?.map(a => ({ existing: a.imageIds ?? [], toDelete: new Set(), toAdd: [] })) ?? []
    )
  );

  const visibleDestImages = (desIdx: number) => destDrafts[desIdx].existing.filter(id => !destDrafts[desIdx].toDelete.has(id));
  const visibleAttrImages = (desIdx: number, attrIdx: number) =>
    attrDrafts[desIdx][attrIdx].existing.filter(id => !attrDrafts[desIdx][attrIdx].toDelete.has(id));

  const hasDestChanges = (desIdx: number) =>
    destDrafts[desIdx].toDelete.size > 0 || destDrafts[desIdx].toAdd.length > 0;

  const hasAttrChanges = (desIdx: number, attrIdx: number) =>
    attrDrafts[desIdx][attrIdx].toDelete.size > 0 || attrDrafts[desIdx][attrIdx].toAdd.length > 0;

  /* ------------------------- File Selection ------------------------- */

  const onSelectDestFiles = (desIdx: number, files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => isAllowedExtension(f.name, IMAGE_EXTENSIONS));
    if (!valid.length) return showToast.warning('Invalid files', 'Only image files are allowed');

    const mapped = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setDestDrafts(prev => {
      const next = [...prev];
      next[desIdx].toAdd = [...next[desIdx].toAdd, ...mapped];
      return next;
    });
  };

  const onSelectAttrFiles = (desIdx: number, attrIdx: number, files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => isAllowedExtension(f.name, IMAGE_EXTENSIONS));
    if (!valid.length) return showToast.warning('Invalid files', 'Only image files are allowed');

    const mapped = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setAttrDrafts(prev => {
      const next = [...prev];
      next[desIdx][attrIdx].toAdd = [...next[desIdx][attrIdx].toAdd, ...mapped];
      return next;
    });
  };

  const removeDestDraftFile = (desIdx: number, idx: number) => {
    const f = destDrafts[desIdx].toAdd[idx];
    URL.revokeObjectURL(f.preview);
    setDestDrafts(prev => {
      const next = [...prev];
      next[desIdx].toAdd = next[desIdx].toAdd.filter((_, i) => i !== idx);
      return next;
    });
  };

  const removeAttrDraftFile = (desIdx: number, attrIdx: number, idx: number) => {
    const f = attrDrafts[desIdx][attrIdx].toAdd[idx];
    URL.revokeObjectURL(f.preview);
    setAttrDrafts(prev => {
      const next = [...prev];
      next[desIdx][attrIdx].toAdd = next[desIdx][attrIdx].toAdd.filter((_, i) => i !== idx);
      return next;
    });
  };

  const markDestDelete = (desIdx: number, id: string) => setDestDrafts(prev => {
    const next = [...prev];
    next[desIdx].toDelete.add(id);
    return next;
  });

  const markAttrDelete = (desIdx: number, attrIdx: number, id: string) => setAttrDrafts(prev => {
    const next = [...prev];
    next[desIdx][attrIdx].toDelete.add(id);
    return next;
  });

  const markRemoveAllDest = (desIdx: number) => setDestDrafts(prev => {
    const next = [...prev];
    next[desIdx].toDelete = new Set(next[desIdx].existing);
    return next;
  });

  const markRemoveAllAttr = (desIdx: number, attrIdx: number) => setAttrDrafts(prev => {
    const next = [...prev];
    next[desIdx][attrIdx].toDelete = new Set(next[desIdx][attrIdx].existing);
    return next;
  });

  /* ---------------------------- Save Mutations ---------------------------- */

  const saveDestMutation = useMutation({
    mutationFn: async (desIdx: number) => {
      const draft = destDrafts[desIdx];
      const base64 = await Promise.all(draft.toAdd.map(f => fileToBase64(f.file, { compressImages: true, maxWidth: 1600, quality: 0.8, maxFileBytes: 5 * 1024 * 1024, allowedExtensions: IMAGE_EXTENSIONS })));
      return api.patch(getDestinationUrl(tourId), { destinationIndex: desIdx, deleteImageIds: [...draft.toDelete], newImages: base64 });
    },
    onSuccess: (_, desIdx) => {
      const draft = destDrafts[desIdx];
      updateData({
        destinations: destinations.map((d, i) => i === desIdx ? { ...d, imageIds: [...draft.existing.filter(id => !draft.toDelete.has(id))] } : d)
      });
      draft.toAdd.forEach(f => URL.revokeObjectURL(f.preview));
      setDestDrafts(prev => {
        const next = [...prev];
        next[desIdx] = { existing: next[desIdx].existing.filter(id => !draft.toDelete.has(id)), toDelete: new Set(), toAdd: [] };
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      showToast.success('Destination images saved');
    },
    onError: err => showToast.error('Save failed', extractErrorMessage(err as Error))
  });

  const saveAttrMutation = useMutation({
    mutationFn: async ({ desIdx, attrIdx }: { desIdx: number; attrIdx: number }) => {
      const draft = attrDrafts[desIdx][attrIdx];
      const base64 = await Promise.all(draft.toAdd.map(f => fileToBase64(f.file, { compressImages: true, maxWidth: 1600, quality: 0.8, maxFileBytes: 5 * 1024 * 1024, allowedExtensions: IMAGE_EXTENSIONS })));
      return api.patch(getAttractionUrl(tourId), { destinationIndex: desIdx, attractionIndex: attrIdx, deleteImageIds: [...draft.toDelete], newImages: base64 });
    },
    onSuccess: (_, { desIdx, attrIdx }) => {
      const draft = attrDrafts[desIdx][attrIdx];
      updateData({
        destinations: destinations.map((d, i) => i === desIdx ? {
          ...d,
          attractions: d.attractions?.map((a, j) => j === attrIdx ? { ...a, imageIds: [...draft.existing.filter(id => !draft.toDelete.has(id))] } : a)
        } : d)
      });
      draft.toAdd.forEach(f => URL.revokeObjectURL(f.preview));
      setAttrDrafts(prev => {
        const next = [...prev];
        next[desIdx][attrIdx] = { existing: next[desIdx][attrIdx].existing.filter(id => !draft.toDelete.has(id)), toDelete: new Set(), toAdd: [] };
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      showToast.success('Attraction images saved');
    },
    onError: err => showToast.error('Save failed', extractErrorMessage(err as Error))
  });

  /* --------------------------------- UI --------------------------------- */

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.15 }
    }
  };

  return (
    <Card className="shadow-lg border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">Destination & Attraction Images</CardTitle>
            <CardDescription className="mt-1">Manage images with add, remove, and save actions</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {destinations.length} {destinations.length === 1 ? 'Destination' : 'Destinations'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Accordion type="multiple" value={expanded} onValueChange={setExpanded} className="space-y-3">
          {destinations.map((destination, desIdx) => (
            <AccordionItem
              key={desIdx}
              value={`dest-${desIdx}`}
              className="border rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline group">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-base font-semibold">Destination {desIdx + 1}</span>
                  <div className="ml-auto flex items-center gap-2">
                    {hasDestChanges(desIdx) && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Unsaved Changes
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {visibleDestImages(desIdx).length + destDrafts[desIdx].toAdd.length} images
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="space-y-6 pt-4"
                >
                  {/* ---------- Destination Images ---------- */}
                  <motion.div variants={itemVariants} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                        Destination Images
                      </h4>
                      <span className="text-xs text-slate-500">
                        {visibleDestImages(desIdx).length + destDrafts[desIdx].toAdd.length} total
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id={`file-${desIdx}`}
                        onChange={e => onSelectDestFiles(desIdx, e.target.files)}
                      />
                      <label htmlFor={`file-${desIdx}`}>
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <span>
                            <Upload className="h-4 w-4" />
                            Add Images
                          </span>
                        </Button>
                      </label>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => markRemoveAllDest(desIdx)}
                        disabled={!visibleDestImages(desIdx).length}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove All
                      </Button>
                      <Button
                        size="sm"
                        className="ml-auto gap-2"
                        onClick={() => saveDestMutation.mutate(desIdx)}
                        disabled={!hasDestChanges(desIdx) || saveDestMutation.isPending}
                      >
                        {saveDestMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>

                    {/* Draft previews */}
                    <AnimatePresence mode="popLayout">
                      {destDrafts[desIdx].toAdd.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                              <Sparkles className="w-4 h-4" />
                              New Images to Upload
                            </div>
                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                            >
                              {destDrafts[desIdx].toAdd.map((f, i) => (
                                <motion.div
                                  key={i}
                                  variants={itemVariants}
                                  layout
                                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-sm group"
                                >
                                  <Image src={f.preview} alt="" fill className="object-cover" />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeDestDraftFile(desIdx, i)}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </motion.button>
                                </motion.div>
                              ))}
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Existing */}
                    {visibleDestImages(desIdx).length ? (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                      >
                        <AnimatePresence mode="popLayout">
                          {visibleDestImages(desIdx).map((id) => (
                            <motion.div
                              key={id}
                              variants={itemVariants}
                              layout
                              className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group"
                            >
                              <Image src={id} alt="" fill className="object-cover" />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => markDestDelete(desIdx, id)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700"
                      >
                        <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No images yet</p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* ---------- Attractions ---------- */}
                  {destination.attractions?.map((attr, attrIdx) => (
                    <motion.div
                      key={attrIdx}
                      variants={itemVariants}
                      className="border-t pt-6 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          {attr.title} Images
                        </h5>
                        <span className="text-xs text-slate-500">
                          {visibleAttrImages(desIdx, attrIdx).length + attrDrafts[desIdx][attrIdx].toAdd.length} total
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          id={`attr-${desIdx}-${attrIdx}`}
                          onChange={e => onSelectAttrFiles(desIdx, attrIdx, e.target.files)}
                        />
                        <label htmlFor={`attr-${desIdx}-${attrIdx}`}>
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <span>
                              <Upload className="h-4 w-4" />
                              Add Images
                            </span>
                          </Button>
                        </label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => markRemoveAllAttr(desIdx, attrIdx)}
                          disabled={!visibleAttrImages(desIdx, attrIdx).length}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove All
                        </Button>
                        <Button
                          size="sm"
                          className="ml-auto gap-2"
                          onClick={() => saveAttrMutation.mutate({ desIdx, attrIdx })}
                          disabled={!hasAttrChanges(desIdx, attrIdx) || saveAttrMutation.isPending}
                        >
                          {saveAttrMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </div>

                      {/* Draft previews */}
                      <AnimatePresence mode="popLayout">
                        {attrDrafts[desIdx][attrIdx].toAdd.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
                                <Sparkles className="w-4 h-4" />
                                New Images to Upload
                              </div>
                              <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                              >
                                {attrDrafts[desIdx][attrIdx].toAdd.map((f, i) => (
                                  <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    layout
                                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-sm group"
                                  >
                                    <Image src={f.preview} alt="" fill className="object-cover" />
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => removeAttrDraftFile(desIdx, attrIdx, i)}
                                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </motion.button>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Existing */}
                      {visibleAttrImages(desIdx, attrIdx).length ? (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                        >
                          <AnimatePresence mode="popLayout">
                            {visibleAttrImages(desIdx, attrIdx).map((id) => (
                              <motion.div
                                key={id}
                                variants={itemVariants}
                                layout
                                className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group"
                              >
                                <Image src={id} alt="" fill className="object-cover" />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => markAttrDelete(desIdx, attrIdx, id)}
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div
                          variants={itemVariants}
                          className="flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700"
                        >
                          <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">No images yet</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}