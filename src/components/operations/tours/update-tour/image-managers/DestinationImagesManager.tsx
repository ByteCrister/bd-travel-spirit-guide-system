'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  Trash2,
  Save,
  X,
  ImageIcon,
  MapPin,
  Sparkles,
  Upload,
  Loader2,
  ChevronDown
} from 'lucide-react';
import api from '@/utils/axios/axios';
import { fileToBase64, IMAGE_EXTENSIONS, isAllowedExtension } from '@/utils/helpers/file-conversion';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { DestinationBlockDTO, TourDetailDTO } from '@/types/tour/tour.types';
import { ApiResponse } from '@/types/common/api.types';

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE = 'bg-[#E7E5E4]';
const NEU_CARD =
  'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_CARD_SM =
  'rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60';
const NEU_SURFACE_INSET =
  'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_BTN_PRIMARY =
  'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide ' +
  'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
  'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
  'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
  'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';
const NEU_BTN_GHOST =
  'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] ' +
  'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
  'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
  'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
  'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';
const NEU_BTN_DANGER =
  'rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] ' +
  'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
  'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
  'transition-all duration-200 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';
const NEU_BADGE =
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
  'bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';
const NEU_BADGE_WARNING =
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
  'bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_HEADING =
  'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL =
  'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED =
  'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_ICON_WELL =
  'p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]';
const NEU_ICON_WELL_PRIMARY =
  'p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]';
const NEU_DIVIDER = 'border-[#1E2938]/10';

// ─────────────────────────────────────────────────────────────

const getDestinationUrl = (tourId: string) =>
  `/operations/tours/v1/${tourId}/destinations/images-bulk`;
const getAttractionUrl = (tourId: string) =>
  `/operations/tours/v1/${tourId}/destinations/attractions/images-bulk`;

type SelectedFile = { file: File; preview: string };
type ImageDraft = {
  existing: Array<{ id: string; url: string }>;
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
  const [destSaving, setDestSaving] = useState<Record<string, boolean>>({});
  const [attrSaving, setAttrSaving] = useState<Record<string, boolean>>({});

  const [destDrafts, setDestDrafts] = useState<Map<string, ImageDraft>>(
    new Map(
      destinations
        .filter(d => d.id)
        .map(d => [d.id!, { existing: d.imageIds ?? [], toDelete: new Set(), toAdd: [] }])
    )
  );

  const [attrDrafts, setAttrDrafts] = useState<Map<string, ImageDraft>>(
    new Map(
      destinations
        .flatMap(d => d.attractions?.filter(a => a.id) ?? [])
        .map(a => [a.id!, { existing: a.imageIds ?? [], toDelete: new Set(), toAdd: [] }])
    )
  );

  const visibleDestImages = (destId: string) => {
    const draft = destDrafts.get(destId);
    return draft?.existing.filter(img => !draft.toDelete.has(img.id)) ?? [];
  };

  const visibleAttrImages = (attrId: string) => {
    const draft = attrDrafts.get(attrId);
    return draft?.existing.filter(img => !draft.toDelete.has(img.id)) ?? [];
  };

  const hasDestChanges = (destId: string) => {
    const draft = destDrafts.get(destId);
    return draft ? draft.toDelete.size > 0 || draft.toAdd.length > 0 : false;
  };

  const hasAttrChanges = (attrId: string) => {
    const draft = attrDrafts.get(attrId);
    return draft ? draft.toDelete.size > 0 || draft.toAdd.length > 0 : false;
  };

  const onSelectDestFiles = (destId: string, files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => isAllowedExtension(f.name, IMAGE_EXTENSIONS));
    if (!valid.length) return showToast.warning('Invalid files', 'Only image files are allowed');
    const mapped = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setDestDrafts(prev => {
      const next = new Map(prev);
      const draft = next.get(destId);
      if (draft) next.set(destId, { ...draft, toAdd: [...draft.toAdd, ...mapped] });
      return next;
    });
  };

  const onSelectAttrFiles = (attrId: string, files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => isAllowedExtension(f.name, IMAGE_EXTENSIONS));
    if (!valid.length) return showToast.warning('Invalid files', 'Only image files are allowed');
    const mapped = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setAttrDrafts(prev => {
      const next = new Map(prev);
      const draft = next.get(attrId);
      if (draft) next.set(attrId, { ...draft, toAdd: [...draft.toAdd, ...mapped] });
      return next;
    });
  };

  const removeDestDraftFile = (destId: string, idx: number) => {
    const draft = destDrafts.get(destId);
    if (!draft) return;
    URL.revokeObjectURL(draft.toAdd[idx].preview);
    setDestDrafts(prev => {
      const next = new Map(prev);
      const d = next.get(destId);
      if (d) next.set(destId, { ...d, toAdd: d.toAdd.filter((_, i) => i !== idx) });
      return next;
    });
  };

  const removeAttrDraftFile = (attrId: string, idx: number) => {
    const draft = attrDrafts.get(attrId);
    if (!draft) return;
    URL.revokeObjectURL(draft.toAdd[idx].preview);
    setAttrDrafts(prev => {
      const next = new Map(prev);
      const d = next.get(attrId);
      if (d) next.set(attrId, { ...d, toAdd: d.toAdd.filter((_, i) => i !== idx) });
      return next;
    });
  };

  const markDestDelete = (destId: string, imageId: string) => {
    setDestDrafts(prev => {
      const next = new Map(prev);
      const draft = next.get(destId);
      if (draft) next.set(destId, { ...draft, toDelete: new Set([...draft.toDelete, imageId]) });
      return next;
    });
  };

  const markAttrDelete = (attrId: string, imageId: string) => {
    setAttrDrafts(prev => {
      const next = new Map(prev);
      const draft = next.get(attrId);
      if (draft) next.set(attrId, { ...draft, toDelete: new Set([...draft.toDelete, imageId]) });
      return next;
    });
  };

  const markRemoveAllDest = (destId: string) => {
    const draft = destDrafts.get(destId);
    if (!draft) return;
    setDestDrafts(prev => {
      const next = new Map(prev);
      next.set(destId, { ...draft, toDelete: new Set(draft.existing.map(img => img.id)) });
      return next;
    });
  };

  const markRemoveAllAttr = (attrId: string) => {
    const draft = attrDrafts.get(attrId);
    if (!draft) return;
    setAttrDrafts(prev => {
      const next = new Map(prev);
      next.set(attrId, { ...draft, toDelete: new Set(draft.existing.map(img => img.id)) });
      return next;
    });
  };

  const saveDestinationImages = async (destId: string) => {
    const draft = destDrafts.get(destId);
    if (!draft) throw new Error('Destination draft not found');
    try {
      setDestSaving(prev => ({ ...prev, [destId]: true }));
      const base64 = await Promise.all(
        draft.toAdd.map(f =>
          fileToBase64(f.file, {
            compressImages: true,
            maxWidth: 1600,
            quality: 0.8,
            maxFileBytes: 5 * 1024 * 1024,
            allowedExtensions: IMAGE_EXTENSIONS,
          })
        )
      );
      const response = await api.patch<ApiResponse<Array<{ id: string; url: string }>>>(
        getDestinationUrl(tourId),
        { destinationId: destId, deleteImageIds: [...draft.toDelete], newImages: base64 }
      );
      const allImages = response.data.data ?? [];
      updateData({
        destinations: destinations.map(d =>
          d.id === destId ? { ...d, imageIds: allImages } : d
        ),
      });
      draft.toAdd.forEach(f => URL.revokeObjectURL(f.preview));
      setDestDrafts(prev => {
        const next = new Map(prev);
        next.set(destId, { existing: allImages, toDelete: new Set(), toAdd: [] });
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      showToast.success('Destination images saved');
    } catch (error) {
      showToast.error('Save failed', extractErrorMessage(error as Error));
      throw error;
    } finally {
      setDestSaving(prev => ({ ...prev, [destId]: false }));
    }
  };

  const saveAttractionImages = async (attrId: string, destId: string) => {
    const draft = attrDrafts.get(attrId);
    if (!draft) throw new Error('Attraction draft not found');
    try {
      setAttrSaving(prev => ({ ...prev, [attrId]: true }));
      const base64 = await Promise.all(
        draft.toAdd.map(f =>
          fileToBase64(f.file, {
            compressImages: true,
            maxWidth: 1600,
            quality: 0.8,
            maxFileBytes: 5 * 1024 * 1024,
            allowedExtensions: IMAGE_EXTENSIONS,
          })
        )
      );
      const response = await api.patch<ApiResponse<Array<{ id: string; url: string }>>>(
        getAttractionUrl(tourId),
        {
          destinationId: destId,
          attractionId: attrId,
          deleteImageIds: [...draft.toDelete],
          newImages: base64,
        }
      );
      const allImages = response.data.data ?? [];
      updateData({
        destinations: destinations.map(d =>
          d.id === destId
            ? {
              ...d,
              attractions: d.attractions?.map(a =>
                a.id === attrId ? { ...a, imageIds: allImages } : a
              ),
            }
            : d
        ),
      });
      draft.toAdd.forEach(f => URL.revokeObjectURL(f.preview));
      setAttrDrafts(prev => {
        const next = new Map(prev);
        next.set(attrId, { existing: allImages, toDelete: new Set(), toAdd: [] });
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      showToast.success('Attraction images saved');
    } catch (error) {
      showToast.error('Save failed', extractErrorMessage(error as Error));
      throw error;
    } finally {
      setAttrSaving(prev => ({ ...prev, [attrId]: false }));
    }
  };

  /* ── Animation Variants ── */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
  };

  return (
    <div className={`${NEU_CARD} overflow-hidden`}>
      {/* ── Card Header ── */}
      <div className={`px-6 py-5 border-b ${NEU_DIVIDER} ${NEU_SURFACE}`}>
        <div className="flex items-center gap-4">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <ImageIcon className="w-5 h-5 text-[#006666]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`${NEU_HEADING} text-lg`}>Destination & Attraction Images</h2>
            <p className={`${NEU_MUTED} mt-0.5`}>Manage images with add, remove, and save actions</p>
          </div>
          <span className={NEU_BADGE}>
            {destinations.length} {destinations.length === 1 ? 'Destination' : 'Destinations'}
          </span>
        </div>
      </div>

      {/* ── Accordion ── */}
      <div className={`p-6 ${NEU_SURFACE}`}>
        <Accordion
          type="multiple"
          value={expanded}
          onValueChange={setExpanded}
          className="space-y-4"
        >
          {destinations.map(destination => {
            if (!destination.id) return null;
            const destDraft = destDrafts.get(destination.id);
            if (!destDraft) return null;

            return (
              <AccordionItem
                key={destination.id}
                value={`dest-${destination.id}`}
                className={`${NEU_CARD_SM} overflow-hidden border-0`}
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline [&>svg]:hidden group">
                  <div className="flex items-center gap-3 w-full">
                    <div className={`${NEU_ICON_WELL} group-hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] transition-all duration-200`}>
                      <MapPin className="w-4 h-4 text-[#006666]" />
                    </div>
                    <span className={`${NEU_HEADING} text-sm truncate max-w-[200px] sm:max-w-xs`}>
                      {destination.description?.substring(0, 50)}…
                    </span>
                    <div className="ml-auto flex items-center gap-2 shrink-0">
                      {hasDestChanges(destination.id) && (
                        <span className={NEU_BADGE_WARNING}>Unsaved</span>
                      )}
                      <span className={NEU_BADGE}>
                        {visibleDestImages(destination.id).length + destDraft.toAdd.length} imgs
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#1E2938]/40 transition-transform duration-200 group-data-[state=open]:rotate-180" />
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
                    {/* ── Destination Images Section ── */}
                    <motion.div variants={itemVariants} className="space-y-4">
                      {/* Section header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`${NEU_ICON_WELL} !p-1.5`}>
                            <ImageIcon className="w-3.5 h-3.5 text-[#1E2938]/60" />
                          </div>
                          <span className={NEU_LABEL}>Destination Images</span>
                        </div>
                        <span className={NEU_MUTED}>
                          {visibleDestImages(destination.id).length + destDraft.toAdd.length} total
                        </span>
                      </div>

                      {/* Action bar */}
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          id={`file-${destination.id}`}
                          onChange={e => onSelectDestFiles(destination.id!, e.target.files)}
                        />
                        <label htmlFor={`file-${destination.id}`}>
                          <span className={`${NEU_BTN_GHOST} inline-flex items-center gap-2 px-3 py-2 text-sm cursor-pointer`}>
                            <Upload className="h-4 w-4" />
                            Add Images
                          </span>
                        </label>
                        <button
                          className={`${NEU_BTN_DANGER} inline-flex items-center gap-2 px-3 py-2 text-sm`}
                          onClick={() => markRemoveAllDest(destination.id!)}
                          disabled={!visibleDestImages(destination.id).length}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove All
                        </button>
                        <button
                          className={`${NEU_BTN_PRIMARY} inline-flex items-center gap-2 px-3 py-2 text-sm ml-auto`}
                          onClick={() => saveDestinationImages(destination.id!)}
                          disabled={!hasDestChanges(destination.id) || destSaving[destination.id]}
                        >
                          {destSaving[destination.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </button>
                      </div>

                      {/* Draft previews */}
                      <AnimatePresence mode="popLayout">
                        {destDraft.toAdd.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className={`${NEU_SURFACE_INSET} rounded-xl p-4 space-y-3`}>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#006666]" />
                                <span className={`${NEU_LABEL} text-[#006666]`}>New Images to Upload</span>
                              </div>
                              <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                              >
                                {destDraft.toAdd.map((f, i) => (
                                  <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    layout
                                    className="relative aspect-square rounded-xl overflow-hidden shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-2 border-[#006666]/20 group"
                                  >
                                    <Image src={f.preview} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => removeDestDraftFile(destination.id!, i)}
                                      className="absolute top-1.5 right-1.5 bg-[#FF2157] hover:bg-[#e0001e] text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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

                      {/* Existing images */}
                      {visibleDestImages(destination.id).length ? (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                        >
                          <AnimatePresence mode="popLayout">
                            {visibleDestImages(destination.id).map(img => (
                              <motion.div
                                key={img.id}
                                variants={itemVariants}
                                layout
                                className="relative aspect-square rounded-xl overflow-hidden shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] group"
                              >
                                <Image src={img.url} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => markDestDelete(destination.id!, img.id)}
                                  className="absolute top-1.5 right-1.5 bg-[#FF2157] hover:bg-[#e0001e] text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
                          className={`${NEU_SURFACE_INSET} rounded-xl flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#1E2938]/10`}
                        >
                          <ImageIcon className="w-10 h-10 text-[#1E2938]/20 mb-3" />
                          <p className={NEU_MUTED}>No images yet</p>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* ── Attraction Sections ── */}
                    {destination.attractions?.map(attraction => {
                      if (!attraction.id) return null;
                      const attrDraft = attrDrafts.get(attraction.id);
                      if (!attrDraft) return null;

                      return (
                        <motion.div
                          key={attraction.id}
                          variants={itemVariants}
                          className={`border-t ${NEU_DIVIDER} pt-6 space-y-4`}
                        >
                          {/* Attraction header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`${NEU_ICON_WELL} !p-1.5`}>
                                <Sparkles className="w-3.5 h-3.5 text-[#006666]" />
                              </div>
                              <span className={`${NEU_LABEL}`}>{attraction.title} Images</span>
                            </div>
                            <span className={NEU_MUTED}>
                              {visibleAttrImages(attraction.id).length + attrDraft.toAdd.length} total
                            </span>
                          </div>

                          {/* Action bar */}
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              id={`attr-${attraction.id}`}
                              onChange={e => onSelectAttrFiles(attraction.id!, e.target.files)}
                            />
                            <label htmlFor={`attr-${attraction.id}`}>
                              <span className={`${NEU_BTN_GHOST} inline-flex items-center gap-2 px-3 py-2 text-sm cursor-pointer`}>
                                <Upload className="h-4 w-4" />
                                Add Images
                              </span>
                            </label>
                            <button
                              className={`${NEU_BTN_DANGER} inline-flex items-center gap-2 px-3 py-2 text-sm`}
                              onClick={() => markRemoveAllAttr(attraction.id!)}
                              disabled={!visibleAttrImages(attraction.id).length}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove All
                            </button>
                            <button
                              className={`${NEU_BTN_PRIMARY} inline-flex items-center gap-2 px-3 py-2 text-sm ml-auto`}
                              onClick={() => saveAttractionImages(attraction.id!, destination.id!)}
                              disabled={!hasAttrChanges(attraction.id) || attrSaving[attraction.id]}
                            >
                              {attrSaving[attraction.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Save Changes
                            </button>
                          </div>

                          {/* Draft previews */}
                          <AnimatePresence mode="popLayout">
                            {attrDraft.toAdd.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className={`${NEU_SURFACE_INSET} rounded-xl p-4 space-y-3`}>
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#006666]" />
                                    <span className={`${NEU_LABEL} text-[#006666]`}>New Images to Upload</span>
                                  </div>
                                  <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                                  >
                                    {attrDraft.toAdd.map((f, i) => (
                                      <motion.div
                                        key={i}
                                        variants={itemVariants}
                                        layout
                                        className="relative aspect-square rounded-xl overflow-hidden shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-2 border-[#006666]/20 group"
                                      >
                                        <Image src={f.preview} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => removeAttrDraftFile(attraction.id!, i)}
                                          className="absolute top-1.5 right-1.5 bg-[#FF2157] hover:bg-[#e0001e] text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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

                          {/* Existing images */}
                          {visibleAttrImages(attraction.id).length ? (
                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                            >
                              <AnimatePresence mode="popLayout">
                                {visibleAttrImages(attraction.id).map(img => (
                                  <motion.div
                                    key={img.id}
                                    variants={itemVariants}
                                    layout
                                    className="relative aspect-square rounded-xl overflow-hidden shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] group"
                                  >
                                    <Image src={img.url} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => markAttrDelete(attraction.id!, img.id)}
                                      className="absolute top-1.5 right-1.5 bg-[#FF2157] hover:bg-[#e0001e] text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
                              className={`${NEU_SURFACE_INSET} rounded-xl flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#1E2938]/10`}
                            >
                              <ImageIcon className="w-9 h-9 text-[#1E2938]/20 mb-2" />
                              <p className={NEU_MUTED}>No images yet</p>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}