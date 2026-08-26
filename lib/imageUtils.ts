"use client";

/**
 * Compresses and crops an image file into a square base64 data URL
 * Max size: 256x256 pixels, output quality: 0.85
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 256,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Calculate square crop (center crop)
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          canvas.width = maxDimension;
          canvas.height = maxDimension;

          // Draw cropped & resized image
          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            maxDimension,
            maxDimension
          );

          // Try WebP first, fallback to JPEG
          let dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(dataUrl);
        } catch (err) {
          console.error("Image compression error, falling back to original", err);
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image file"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}
