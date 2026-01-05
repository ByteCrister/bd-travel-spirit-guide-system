// DestinationImageUploader.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { IMAGE_EXTENSIONS } from "@/utils/helpers/file-conversion";
import Image from "next/image";

interface DestinationImageUploaderProps {
  imageIds: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function DestinationImageUploader({
  imageIds,
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5,
}: DestinationImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = IMAGE_EXTENSIONS;
  const maxFileBytes = maxSizeMB * 1024 * 1024;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (imageIds.length + files.length > maxImages) {
      toast.warning(`Maximum ${maxImages} images allowed. You can add ${maxImages - imageIds.length} more.`);
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        // Check file extension
        const extension = file.name.split(".").pop()?.toLowerCase() || "" ;
        if (!allowedExtensions.includes(extension as "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp")) {
          toast.warning(`Skipped ${file.name}: Only ${allowedExtensions.join(", ")} files are allowed.`);
          continue;
        }

        // Check file size
        if (file.size > maxFileBytes) {
          toast.warning(
            `Skipped ${file.name}: File size exceeds ${maxSizeMB}MB limit.`
          );
          continue;
        }

        // Convert file to base64
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (error) {
        toast.warning(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...imageIds, ...newImages]);
      toast.success(`Added ${newImages.length} image(s) successfully.`);
    }

    setIsUploading(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...imageIds];
    newImages.splice(index, 1);
    onImagesChange(newImages);
    toast.info("Image removed.");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileExtension = (base64String: string): string => {
    const match = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    return match ? match[1] : "unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Images</h4>
          <p className="text-sm text-muted-foreground">
            Upload up to {maxImages} images. Allowed: {allowedExtensions.join(", ")}. Max size: {maxSizeMB}MB each.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {imageIds.length} / {maxImages}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={isUploading || imageIds.length >= maxImages}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowedExtensions.map(ext => `.${ext}`).join(",")}
        multiple
        className="hidden"
        disabled={isUploading || imageIds.length >= maxImages}
      />

      {imageIds.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {imageIds.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                  <Image
                    src={image || "/placeholder-image.svg"}
                    alt={`Destination image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 200px"
                    onError={(e) => {
                      // Next/Image workaround for runtime errors
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-image.svg";
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-1 text-xs text-muted-foreground truncate">
                  {getFileExtension(image).toUpperCase()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground text-center mb-3">
              No images uploaded yet
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      )}

      {imageIds.length >= maxImages && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
          Maximum limit of {maxImages} images reached. Remove some images to add more.
        </div>
      )}
    </div>
  );
}