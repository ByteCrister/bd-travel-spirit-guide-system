// components/global/AvatarUpload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
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

export default function AvatarUpload({
    currentAvatarUrl,
    updateAvatar,
    meta,
}: AvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Sync preview when prop changes externally
    useState(() => {
        if (!selectedFile) {
            setPreview(currentAvatarUrl || null);
        }
    });

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setError(null);
            setSuccess(false);

            // Validate extension
            if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
                setError(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(", ")}`);
                return;
            }

            // Validate size (5 MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("File too large. Maximum size is 5 MB.");
                return;
            }

            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        },
        []
    );

    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            // Compress and convert to base64
            const base64Data = await fileToAvatarBase64(selectedFile, {
                compressImages: true,
                maxWidth: 1200,
                quality: 0.8,
                maxFileBytes: 5 * 1024 * 1024,
                allowedExtensions: IMAGE_EXTENSIONS,
            });

            // Call the store action
            const result = await updateAvatar({ avatarBase64: base64Data });

            if (result) {
                setSuccess(true);
                showToast.success("Avatar updated successfully");
                setSelectedFile(null);
                // Clear file input
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
            <div className="flex flex-col items-center gap-4 sm:flex-row">
                {/* Avatar preview */}
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="User avatar"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            <Camera className="h-8 w-8" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <p className="text-sm font-medium text-slate-900">Profile Picture</p>
                    <p className="text-xs text-slate-500">
                        Upload a photo in JPG, PNG, or WebP format. Max size 5 MB.
                    </p>

                    <div className="flex gap-2 mt-1">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="avatar-upload"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Image
                        </Button>

                        {selectedFile && (
                            <Button
                                onClick={handleUpload}
                                disabled={isLoading}
                                className="bg-slate-900 hover:bg-slate-800"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading…
                                    </>
                                ) : (
                                    "Upload"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Status messages */}
            {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {success && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm text-green-700">
                            Avatar updated successfully!
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}
        </div>
    );
}