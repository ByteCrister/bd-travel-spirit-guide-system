// src/lib/fileUpload.ts
import { GUIDE_DOCUMENT_TYPE, GuideDocumentCategory, GuideDocumentType } from "@/constants/guide/guide.const";
import type { GuideDocument } from "@/types/overview.types";

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

/**
 * High-level file processing helper
 * - validates extension
 * - if image: compresses if necessary (attempt)
 * - if non-image: rejects if larger than limit (recommend server-side compress)
 *
 * Returns a GuideDocument where fileUrl is a data URL (base64) suitable for client-side preview/download.
 */
export async function processUploadFile(params: {
    file: File;
    category: GuideDocumentCategory;
    preferFileType?: GuideDocumentType | undefined;
    maxBytes?: number;
}): Promise<{ ok: true; doc: GuideDocument } | { ok: false; error: string }> {
    const { file, category, preferFileType, maxBytes = MAX_UPLOAD_BYTES } = params;

    if (!isAllowedExtension(file)) {
        return { ok: false, error: "Unsupported file type. Allowed: jpg, jpeg, png, webp, pdf, docx" };
    }

    // Quick pass if already small
    if (isUnderMaxSize(file.size, maxBytes)) {
        const dataUrl = await fileToBase64(file);
        const inferredType = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "docx";
        const doc: GuideDocument = {
            id: undefined,
            category,
            fileType: (preferFileType ?? (inferredType as GuideDocumentType)) as GuideDocumentType,
            fileName: file.name,
            fileUrl: dataUrl,
            uploadedAt: new Date().toISOString(),
        };
        return { ok: true, doc };
    }

    // If it's an image, attempt compression
    if (file.type.startsWith("image/")) {
        try {
            const compressed = await compressImage(file, { maxBytes, maxWidth: 1600, maxHeight: 1600 });
            const dataUrl = await fileToBase64(compressed);
            const doc: GuideDocument = {
                id: undefined,
                category,
                fileType: (preferFileType ?? "image") as GuideDocumentType,
                fileName: file.name,
                fileUrl: dataUrl,
                uploadedAt: new Date().toISOString(),
            };
            return { ok: true, doc };
        } catch (err: unknown) {
            if (err instanceof Error) {
                return { ok: false, error: err.message };
            }
            return { ok: false, error: String(err) };
        }

    }

    // Non-image (PDF/DOCX) larger than allowed — reject and provide guidance
    return {
        ok: false,
        error:
            "File is too large and automatic compression for PDFs/DOCX is not available in-browser. Please upload a file under 2 MB or use server-side compression.",
    };
}
