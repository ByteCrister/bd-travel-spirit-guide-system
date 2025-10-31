// components/dashboard-overview/SaveBar.tsx
'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGuideOverviewStore } from "@/store/useGuideOverviewStore";
import { Save, X, Loader2, Circle } from "lucide-react";
import { toast } from "sonner";

export default function SaveBar() {
    const {
        validateDraft,
        saveDraft,
        revertDraft,
        saving
    } = useGuideOverviewStore();

    const onSave = async () => {
        const valid = validateDraft();
        if (!valid.valid) {
            toast.error("Please fix validation errors before saving");
            return;
        }
        try {
            await saveDraft();
            toast.success("Changes saved successfully!");
        } catch {
            toast.error("Failed to save changes");
        }
    };

    const onRevert = () => {
        revertDraft();
        toast.info("Changes reverted");
    };

    // Check if there are any dirty fields
    const hasChanges = useGuideOverviewStore(state => {
        if (!state.draft) return false;
        const d = state.draft;
        return (
            d.companyName.dirty ||
            d.bio.dirty ||
            d.social.dirty ||
            d.owner.name.dirty ||
            d.owner.phone.dirty ||
            d.documents.dirty ||
            d.currentSubscription.dirty ||
            d.status.dirty
        );
    });

    return (
        <AnimatePresence>
            {hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-3 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Circle className="size-2 fill-amber-500 text-amber-500" />
                        </motion.div>
                        You have unsaved changes
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={onRevert}
                                disabled={saving}
                                className="gap-1.5 h-8"
                            >
                                <X className="size-3.5" />
                                Revert
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                size="sm"
                                onClick={onSave} 
                                disabled={saving}
                                className="gap-1.5 h-8 shadow-sm"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="size-3.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="size-3.5" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
