/**
 * Client-Side Image Compressor Utility
 * Automatically resizes and compresses high-resolution camera photos (e.g., from modern smartphones 48MP/108MP)
 * down to web-optimized dimensions before uploading to the server.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeMBToSkip?: number; // Skip re-compression if already below this size and dimensions
}

/**
 * Formats byte size into human readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Compresses an individual File object using HTML5 Canvas
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    maxSizeMBToSkip = 0.8, // 800KB
  } = options;

  // Only process images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Preserve vector SVGs and animated GIFs
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    // If running in an environment without DOM window / Image (SSR safeguard)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      let needResize = false;
      if (width > maxWidth || height > maxHeight) {
        needResize = true;
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // If already small in file size and doesn't exceed dimensions, keep original
      const maxSizeBytes = maxSizeMBToSkip * 1024 * 1024;
      if (!needResize && file.size <= maxSizeBytes) {
        return resolve(file);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      // Quality rendering options
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If it's a JPEG or non-transparent format, fill background with white
      const isPng = file.type === 'image/png';
      const isWebp = file.type === 'image/webp';

      let targetMime = 'image/jpeg';
      let fileExt = '.jpg';

      if (isPng || isWebp) {
        // Use webp to retain transparency while achieving high compression
        targetMime = 'image/webp';
        fileExt = '.webp';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          // If compression somehow produced a larger file and dimensions didn't need reduction, keep original
          if (blob.size >= file.size && !needResize) {
            return resolve(file);
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}${fileExt}`;

          const compressedFile = new File([blob], newFileName, {
            type: targetMime,
            lastModified: Date.now(),
          });

          console.log(
            `[ImageCompressor] Optimized "${file.name}" (${formatFileSize(file.size)}) -> "${newFileName}" (${formatFileSize(compressedFile.size)})`
          );

          resolve(compressedFile);
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to original if reading image fails
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses multiple image files concurrently
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImageFile(file, options)));
}
