// src/utils/imageUtils.js

/**
 * Compress image before uploading to reduce size
 */
export const compressImage = (base64String, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for smaller size
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = reject;
    img.src = base64String;
  });
};

/**
 * Check if string is a base64 image
 */
export const isBase64Image = (str) => {
  if (!str) return false;
  return str.startsWith('data:image/');
};

/**
 * Check if string is a URL
 */
export const isUrl = (str) => {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
};

/**
 * Get image source with proper handling
 */
export const getImageSrc = (image) => {
  if (!image) return null;
  
  // If it's a base64 image or URL, use it directly
  if (isBase64Image(image) || isUrl(image)) {
    return image;
  }
  
  // If it's a relative path
  if (image.startsWith('/')) {
    return image;
  }
  
  // If it's just a filename, prepend API URL
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  return `${apiUrl}/uploads/${image}`;
};