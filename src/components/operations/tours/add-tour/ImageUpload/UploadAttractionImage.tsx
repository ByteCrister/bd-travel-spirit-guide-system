"use client";

import { useState, useRef } from "react";
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Button,
    CircularProgress,
    Grid,
    Chip,
} from "@mui/material";
import {
    Upload,
    X,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { filesToDocumentDTOs } from "@/utils/helpers/file-conversion";
import { showToast } from "@/components/global/showToast";

interface UploadAttractionImageProps {
    imageIds: string[]; // Array of base64 strings or image IDs
    onImagesChange: (newImages: string[]) => void;
    maxImages?: number;
    maxSizeMB?: number;
    disabled?: boolean;
}

export default function UploadAttractionImage({
    imageIds = [],
    onImagesChange,
    maxImages = 10,
    maxSizeMB = 5,
    disabled = false,
}: UploadAttractionImageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = async (files: FileList | File[]) => {
        if (disabled || isUploading) return;

        const fileArray = Array.from(files);

        // Check if adding these files would exceed maxImages limit
        if (imageIds.length + fileArray.length > maxImages) {
            showToast.warning(
                "Maximum images exceeded",
                `You can only upload up to ${maxImages} images. Currently have ${imageIds.length}.`
            );
            return;
        }

        // Validate file sizes
        const maxBytes = maxSizeMB * 1024 * 1024;
        const oversizedFiles = fileArray.filter(file => file.size > maxBytes);

        if (oversizedFiles.length > 0) {
            showToast.error(
                "File too large",
                `Some files exceed ${maxSizeMB}MB limit. Please select smaller files.`
            );
            return;
        }

        setIsUploading(true);

        try {
            // Convert files to DocumentDTO with compression
            const documentDTOs = await filesToDocumentDTOs(fileArray, {
                compressImages: true,
                maxWidth: 1200, // Good resolution for attraction images
                quality: 0.8,
                maxFileBytes: maxBytes,
            });

            // Extract base64 URLs from DocumentDTOs
            const newBase64Images = documentDTOs
                .map(doc => doc.url as string) // Cast to string since we're storing base64
                .filter(url => url && url.startsWith('data:image'));

            if (newBase64Images.length > 0) {
                // Combine with existing images
                const updatedImages = [...imageIds, ...newBase64Images].slice(0, maxImages);
                onImagesChange(updatedImages);

                showToast.success(
                    "Images uploaded successfully",
                    `${newBase64Images.length} image(s) added.`
                );

            } else {
                showToast.error(
                    "No valid images",
                    `No valid images could be processed.`
                );
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            showToast.error(
                "Upload failed",
                error instanceof Error ? error.message : "Failed to upload images"
            );
        } finally {
            setIsUploading(false);
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = [...imageIds];
        updatedImages.splice(index, 1);
        onImagesChange(updatedImages);

        showToast.success(
            "Image removed",
            "Image has been removed successfully."
        );
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);

        if (disabled || isUploading) return;

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            showToast.error(
                "No images found",
                "Please drop image files only."
            );
            return;
        }

        await handleFileSelect(imageFiles);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled && !isUploading) {
            setDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.2,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <Box sx={{ width: "100%" }}>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files || [])}
                style={{ display: "none" }}
                disabled={disabled || isUploading}
            />

            {/* Upload Area */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Paper
                    elevation={dragOver ? 3 : 0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        border: "2px dashed",
                        borderColor: dragOver ? "primary.main" : "divider",
                        backgroundColor: dragOver ? "action.hover" : "background.paper",
                        textAlign: "center",
                        cursor: disabled || isUploading ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                        transition: "all 0.2s ease",
                        mb: 3,
                    }}
                    onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: "50%",
                                backgroundColor: dragOver ? "primary.light" : "action.hover",
                                color: dragOver ? "primary.main" : "text.secondary",
                            }}
                        >
                            {isUploading ? (
                                <CircularProgress size={32} />
                            ) : (
                                <Upload className="w-8 h-8" />
                            )}
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {dragOver ? "Drop images here" : "Upload attraction images"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Drag & drop or click to browse
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                Max {maxImages} images • Max {maxSizeMB}MB each • JPG, PNG, GIF, WEBP
                            </Typography>
                        </Box>

                        {imageIds.length > 0 && (
                            <Chip
                                label={`${imageIds.length} / ${maxImages} images`}
                                color="primary"
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>
                </Paper>
            </motion.div>

            {/* Image Grid */}
            <AnimatePresence mode="popLayout">
                {imageIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <ImageIcon className="w-4 h-4" />
                            Uploaded Images ({imageIds.length})
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <AnimatePresence mode="popLayout">
                                {imageIds.map((image, index) => (
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                                        <motion.div
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            layout
                                        >
                                            <Paper
                                                elevation={2}
                                                sx={{
                                                    position: "relative",
                                                    borderRadius: 2,
                                                    overflow: "hidden",
                                                    height: 120,
                                                    backgroundColor: "action.hover",
                                                }}
                                            >
                                                {/* Image Preview */}
                                                <Box
                                                    component="img"
                                                    src={image}
                                                    alt={`Attraction image ${index + 1}`}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        transition: "transform 0.3s ease",
                                                        "&:hover": {
                                                            transform: "scale(1.05)",
                                                        },
                                                    }}
                                                />

                                                {/* Remove Button */}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveImage(index)}
                                                    disabled={disabled}
                                                    sx={{
                                                        position: "absolute",
                                                        top: 8,
                                                        right: 8,
                                                        backgroundColor: "background.paper",
                                                        color: "error.main",
                                                        "&:hover": {
                                                            backgroundColor: "error.light",
                                                            color: "error.dark",
                                                        },
                                                    }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </IconButton>

                                                {/* Image Info */}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                                        p: 1,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "white",
                                                            fontSize: 10,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        <CheckCircle className="w-3 h-3" />
                                                        Image {index + 1}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>

                        {/* Clear All Button */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<X className="w-4 h-4" />}
                                onClick={() => {
                                    if (imageIds.length > 0) {
                                        onImagesChange([]);
                                        showToast.success(
                                            "All images removed",
                                            `All attraction images have been cleared.`
                                        );
                                    }
                                }}
                                disabled={disabled || imageIds.length === 0}
                                sx={{ borderRadius: 2, textTransform: "none" }}
                            >
                                Clear All
                            </Button>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Status */}
            {isUploading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                        Compressing and uploading images...
                    </Typography>
                </Box>
            )}

            {/* Validation Messages */}
            {imageIds.length >= maxImages && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "warning.light",
                        color: "warning.dark",
                        mt: 2,
                    }}
                >
                    <AlertCircle className="w-4 h-4" />
                    <Typography variant="body2">
                        Maximum of {maxImages} images reached. Remove some images to add more.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}