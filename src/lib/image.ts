/**
 * Client-side image compression utility.
 * Resizes images to a maximum width/height and iteratively reduces compression quality
 * until the image file size is less than 1MB (or hits minimum quality).
 */
export async function compressImage(
  file: File,
  maxSizeBytes: number = 1024 * 1024, // 1MB default
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<File> {
  // If the file is already small enough, we can return it directly.
  if (file.size <= maxSizeBytes) {
    return file;
  }

  // Only compress common image types
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and clamp to maximum dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context not supported"));
          return;
        }

        // Draw background for transparent PNG/GIF to avoid black backgrounds in JPEGs
        if (file.type === "image/png" || file.type === "image/gif") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Iterative quality reduction to fit under target size
        let quality = 0.9;
        const targetType = "image/jpeg"; // JPEG is best suited for size constraints and universal support

        const attemptCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas export failed"));
                return;
              }

              // If it's under the limit, or we've hit the lowest acceptable quality threshold (0.3)
              if (blob.size <= maxSizeBytes || quality <= 0.3) {
                // Determine file extension and name
                let name = file.name;
                const dotIndex = name.lastIndexOf(".");
                if (dotIndex !== -1) {
                  name = name.substring(0, dotIndex) + ".jpg";
                } else {
                  name = name + ".jpg";
                }

                const compressedFile = new File([blob], name, {
                  type: targetType,
                  lastModified: Date.now(),
                });

                console.log(`[Image Compress] File: ${file.name} | Original: ${(file.size / 1024 / 1024).toFixed(2)}MB | Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (Quality: ${quality.toFixed(2)})`);
                resolve(compressedFile);
              } else {
                // Iteratively degrade quality
                quality -= 0.08;
                attemptCompression();
              }
            },
            targetType,
            quality
          );
        };

        attemptCompression();
      };
      img.onerror = () => reject(new Error("Failed to load image element"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
