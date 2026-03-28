import fs from "fs";
import path from "path";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

/**
 * Recursively walk a TipTap JSON content tree and collect all image `src` URLs.
 */
export function extractImageUrls(content: any): string[] {
    const urls: string[] = [];

    const walk = (node: any) => {
        if (!node) return;
        if (node.type === "image" && node.attrs?.src) {
            urls.push(node.attrs.src as string);
        }
        if (Array.isArray(node.content)) {
            node.content.forEach(walk);
        }
    };

    walk(content);
    return urls;
}

/**
 * Given a URL like http://localhost:5000/uploads/userId/filename.png,
 * extract the path relative to UPLOADS_ROOT and delete the file from disk.
 */
export function deleteImageByUrl(url: string): void {
    try {
        const match = url.match(/\/uploads\/(.+)$/);
        const relPath = match?.[1];
        if (!relPath) return;

        const absPath = path.join(UPLOADS_ROOT, relPath);
        if (fs.existsSync(absPath)) {
            fs.unlinkSync(absPath);
            console.log(`🗑️  Deleted image: ${absPath}`);
        }
    } catch (err) {
        console.error("Failed to delete image file:", err);
    }
}

/**
 * Diff old vs new content: delete images that were removed.
 */
export function deleteRemovedImages(oldContent: any, newContent: any): void {
    const oldUrls = new Set(extractImageUrls(oldContent));
    const newUrls = new Set(extractImageUrls(newContent));

    for (const url of oldUrls) {
        if (!newUrls.has(url)) {
            deleteImageByUrl(url);
        }
    }
}

/**
 * Delete all images referenced in a content tree.
 */
export function deleteAllImages(content: any): void {
    for (const url of extractImageUrls(content)) {
        deleteImageByUrl(url);
    }
}
