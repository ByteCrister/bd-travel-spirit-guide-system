// components/global/AvatarUpload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, AlertCircle, CheckCircle2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { isAllowedExtension, IMAGE_EXTENSIONS, fileToAvatarBase64 } from "@/utils/helpers/file-conversion";
import { showToast } from "@/components/global/showToast";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import Image from "next/image";
import type { CurrentUser, RequestMeta } from "@/types/current-user.types";

interface AvatarUploadProps {
    currentAvatarUrl?: string | null;
    updateAvatar: (data: { avatarBase64: string }) => Promise<CurrentUser | null>;
    meta?: RequestMeta;
}

export default function AvatarUpload({ currentAvatarUrl, updateAvatar, meta }: AvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    useState(() => {
        if (!selectedFile) setPreview(currentAvatarUrl || null);
    });

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccess(false);

        if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
            setError(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(", ")}`);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File too large. Maximum size is 5 MB.");
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) { setError("Please select an image first."); return; }
        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const base64Data = await fileToAvatarBase64(selectedFile, {
                compressImages: true,
                maxWidth: 1200,
                quality: 0.8,
                maxFileBytes: 5 * 1024 * 1024,
                allowedExtensions: IMAGE_EXTENSIONS,
            });
            const result = await updateAvatar({ avatarBase64: base64Data });
            if (result) {
                setSuccess(true);
                showToast.success("Avatar updated successfully");
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } catch (err: unknown) {
            const message = extractErrorMessage(err) || "Failed to update avatar";
            setError(message);
            showToast.error("Avatar upload failed", message);
        } finally {
            setUploading(false);
        }
    }, [selectedFile, updateAvatar]);

    const isLoading = meta?.loading || uploading;

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
                {/* Avatar ring */}
                <div className="relative shrink-0">
                    <div className="p-1.5 rounded-full bg-[#E7E5E4]
                        shadow-[5px_5px_12px_rgba(0,0,0,0.15),-4px_-4px_10px_rgba(255,255,255,0.85)]">
                        <div className="h-20 w-20 rounded-full overflow-hidden
                            shadow-[inset_3px_3px_7px_rgba(0,0,0,0.12),inset_-3px_-3px_7px_rgba(255,255,255,0.7)]
                            bg-[#E7E5E4]">
                            {preview ? (
                                <Image src={preview} alt="User avatar" fill className="object-cover" unoptimized />
                            ) : (
                                <div className="flex items-center justify-center h-full text-[#1E2938]/30">
                                    <Camera className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <p className="text-sm font-bold text-[#1E2938] font-[var(--font-space-mono)] tracking-tight">
                        Profile Picture
                    </p>
                    <p className="text-xs text-[#1E2938]/50 font-[var(--font-jetbrains-mono)]">
                        JPG, PNG, or WebP · Max 5 MB
                    </p>

                    <div className="flex gap-3 mt-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="avatar-upload"
                        />

                        {/* Choose button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                text-[#1E2938]/80 font-[var(--font-space-mono)]
                                bg-[#E7E5E4]
                                shadow-[4px_4px_10px_rgba(0,0,0,0.13),-3px_-3px_8px_rgba(255,255,255,0.8)]
                                hover:shadow-[5px_5px_12px_rgba(0,0,0,0.16),-4px_-4px_10px_rgba(255,255,255,0.85)]
                                active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.12),inset_-2px_-2px_5px_rgba(255,255,255,0.65)]
                                disabled:opacity-40 transition-all duration-150"
                        >
                            <Upload className="h-4 w-4" />
                            Choose Image
                        </button>

                        {selectedFile && (
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                    text-white font-[var(--font-space-mono)]
                                    bg-[#006666]
                                    shadow-[4px_4px_10px_rgba(0,0,0,0.2),-2px_-2px_6px_rgba(255,255,255,0.4)]
                                    hover:bg-[#005555]
                                    active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.25)]
                                    disabled:opacity-40 transition-all duration-150"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading…
                                    </>
                                ) : "Upload"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm
                        text-[#FF2157] font-[var(--font-jetbrains-mono)]
                        bg-[#E7E5E4]
                        shadow-[inset_3px_3px_8px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.65)]
                        border-l-2 border-[#FF2157]">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                </motion.div>
            )}

            {success && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm
                        text-[#00A63D] font-[var(--font-jetbrains-mono)]
                        bg-[#E7E5E4]
                        shadow-[inset_3px_3px_8px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.65)]
                        border-l-2 border-[#00A63D]">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        Avatar updated successfully!
                    </div>
                </motion.div>
            )}
        </div>
    );
}