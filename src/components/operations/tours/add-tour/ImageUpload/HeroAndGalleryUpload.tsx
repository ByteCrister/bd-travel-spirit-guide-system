// /operations/tours/add-tour/components/HeroAndGalleryUpload.tsx
"use client";

import { useFormikContext } from "formik";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon } from "@mui/icons-material";
import Image from "next/image";
import { useRef, ChangeEvent, useState } from "react";
import { CreateTourDTO } from "@/types/tour.types";
import { fileToBase64 } from "@/utils/helpers/file-conversion";
import { showToast } from "@/components/global/showToast";

interface HeroAndGalleryUploadProps {
  heroImageError?: string;
  galleryError?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "image/tiff",
  "image/avif",
];

export default function HeroAndGalleryUpload({ heroImageError, galleryError }: HeroAndGalleryUploadProps) {
  const { values, setFieldValue, setFieldTouched } = useFormikContext<CreateTourDTO>();
  const [uploading, setUploading] = useState(false);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    files: FileList | File[],
    fieldName: "heroImage" | "gallery",
    isMultiple = false
  ) => {
    const fileList = Array.from(files);

    // Gallery max images check
    if (fieldName === "gallery" && values.gallery && values.gallery.length + fileList.length > 10) {
      showToast.warning("Maximum 10 images allowed in gallery");
      return;
    }

    // Validate file types and sizes
    const validFiles = fileList.filter(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showToast.warning(`File ${file.name} is not a supported image type`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast.warning(`File ${file.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setUploading(true);

    try {
      const base64Images = await Promise.all(
        validFiles.map(file =>
          fileToBase64(file, {
            compressImages: true,
            maxWidth: 1920,
            quality: 0.8,
            maxFileBytes: MAX_FILE_SIZE,
            allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tiff", "avif"],
          })
        )
      );

      if (fieldName === "heroImage" && base64Images[0]) {
        setFieldValue("heroImage", base64Images[0]);
        setFieldTouched("heroImage", true);
      } else if (fieldName === "gallery") {
        const updatedGallery = [...(values.gallery || []), ...base64Images];
        setFieldValue("gallery", updatedGallery);
        setFieldTouched("gallery", true);
      }

      showToast.success(`Successfully uploaded ${validFiles.length} image(s)`);
    } catch (error) {
      console.error("Error uploading images:", error);
      showToast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      if (heroInputRef.current) heroInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removeGalleryImage = (index: number) => {
    const updatedGallery = [...(values.gallery || [])];
    updatedGallery.splice(index, 1);
    setFieldValue("gallery", updatedGallery);
    setFieldTouched("gallery", true);
  };

  const handleHeroClick = () => heroInputRef.current?.click();
  const handleGalleryClick = () => galleryInputRef.current?.click();

  const handleHeroChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileUpload(e.target.files, "heroImage");
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFileUpload(e.target.files, "gallery", true);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Images
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a hero image and gallery images (max 2MB each, up to 10 images in gallery)
      </Typography>

      <Grid container spacing={3}>
        {/* Hero Image */}
        <Grid size={12}>
          <Box>
            <Typography variant="body1" gutterBottom>
              Hero Image *
            </Typography>
            <input
              type="file"
              ref={heroInputRef}
              onChange={handleHeroChange}
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              style={{ display: "none" }}
            />

            {values.heroImage ? (
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 2,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 100, height: 100, borderRadius: 1, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src={values.heroImage}
                        alt="Hero preview"
                        layout="fill"
                        objectFit="cover"
                        priority
                      />
                    </div>
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hero image uploaded
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setFieldValue("heroImage", "");
                        setFieldTouched("heroImage", true);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleHeroClick}
                disabled={uploading}
                sx={{ py: 3, borderStyle: "dashed", borderWidth: 2 }}
              >
                {uploading ? <CircularProgress size={24} /> : <><AddPhotoIcon sx={{ mr: 1 }} />Upload Hero Image</>}
              </Button>
            )}

            {heroImageError && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                {heroImageError}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Gallery Images */}
        <Grid size={12}>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="body1">Gallery Images *</Typography>
              <Typography variant="caption" color="text.secondary">
                {values.gallery?.length || 0}/10 images
              </Typography>
            </Box>

            <input
              type="file"
              ref={galleryInputRef}
              onChange={handleGalleryChange}
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              style={{ display: "none" }}
            />

            <Button
              variant="outlined"
              fullWidth
              onClick={handleGalleryClick}
              disabled={uploading || (values.gallery?.length || 0) >= 10}
              sx={{ py: 2, borderStyle: "dashed", borderWidth: 2, mb: 2 }}
            >
              {uploading ? <CircularProgress size={24} /> : <><AddPhotoIcon sx={{ mr: 1 }} />Add Gallery Images</>}
            </Button>

            {galleryError && (
              <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
                {galleryError}
              </Typography>
            )}

            {/* Gallery Preview */}
            {values.gallery?.length ? (
              <Grid container spacing={1}>
                {values.gallery.map((image, index) => (
                  <Grid size={3} key={index}>
                    <Paper
                      sx={{
                        position: "relative",
                        borderRadius: 1,
                        overflow: "hidden",
                        "&:hover .delete-btn": { opacity: 1 },
                      }}
                    >
                      <Box sx={{ aspectRatio: "1/1", position: "relative", bgcolor: "grey.100" }}>
                        <Image
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          priority={false}
                        />
                        <IconButton
                          className="delete-btn"
                          size="small"
                          onClick={() => removeGalleryImage(index)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "white",
                            opacity: 0,
                            transition: "opacity 0.2s",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : null}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}