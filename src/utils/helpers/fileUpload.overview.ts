// src/lib/fileUpload.ts
/**
 * Config
 */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
const IMAGE_MIME_WHITELIST = ["image/jpeg", "image/png", "image/webp"];
const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Convert a File/Blob to a base64 data URL
 */
export const fileToBase64 = (file: File | Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
            reader.abort();
            reject(new Error("Failed to read file"));
        };
        reader.onload = () => {
            resolve(String(reader.result));
        };
        reader.readAsDataURL(file);
    });

/**
 * Simple extension/mime check based on File object
 */
export const isAllowedExtension = (file: File): file is File & { type: string } => {
    const mime = file.type;
    if (IMAGE_MIME_WHITELIST.includes(mime)) return true;
    if (mime === PDF_MIME) return true;
    if (mime === DOCX_MIME) return true;
    // fallback: allow files by extension for some browsers that don't set mime reliably
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf") || name.endsWith(".docx") || name.match(/\.(jpe?g|png|webp)$/)) return true;
    return false;
};

/**
 * Validate file size (fast)
 */
export const isUnderMaxSize = (fileSizeBytes: number, maxBytes = MAX_UPLOAD_BYTES) => fileSizeBytes <= maxBytes;

/**
 * Compress image (jpeg/webp/png -> jpeg/webp) using canvas.
 * targetMaxBytes: try multiple quality steps until reaching it or a minimum quality.
 * Returns a Blob (compressed) or throws if cannot compress sufficiently.
 */
export async function compressImage(
    file: File,
    {
        maxBytes = MAX_UPLOAD_BYTES,
        maxWidth = 1600,
        maxHeight = 1600,
        mimeFallback = "image/jpeg",
    }: { maxBytes?: number; maxWidth?: number; maxHeight?: number; mimeFallback?: string } = {}
): Promise<Blob> {
    if (!IMAGE_MIME_WHITELIST.includes(file.type) && !file.type.startsWith("image/")) {
        throw new Error("compressImage only supports image files");
    }

    // load image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image for compression"));
        };
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.src = url;
    });

    // compute target dimensions keeping aspect ratio
    let { width, height } = img;
    const ratio = Math.min(1, maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // draw
    ctx.drawImage(img, 0, 0, width, height);

    // try multiple quality levels
    const mime = IMAGE_MIME_WHITELIST.includes(file.type) ? file.type : mimeFallback;
    const qualitySteps = [0.9, 0.75, 0.6, 0.5, 0.4, 0.3];
    for (const q of qualitySteps) {
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, mime, q));
        if (!blob) continue;
        if (blob.size <= maxBytes) return blob;
    }

    // final attempt: smaller dimensions reduction loop
    let scale = 0.8;
    for (let i = 0; i < 4; i++) {
        const cw = Math.max(200, Math.round(width * scale));
        const ch = Math.max(200, Math.round(height * scale));
        canvas.width = cw;
        canvas.height = ch;
        ctx.drawImage(img, 0, 0, cw, ch);
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.6));
        if (blob && blob.size <= maxBytes) return blob;
        scale *= 0.7;
    }

    throw new Error("Unable to compress image below size limit");
}