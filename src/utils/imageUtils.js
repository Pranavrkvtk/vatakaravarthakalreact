// src/utils/imageUtils.js

export const compressImage = (base64String, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

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
      
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = reject;
    img.src = base64String;
  });
};

export const isBase64Image = (str) => {
  if (!str) return false;
  return str.startsWith('data:image/');
};

export const isUrl = (str) => {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
};

export const getImageSrc = (image) => {
  if (!image) return null;
  
  if (isBase64Image(image) || isUrl(image)) {
    return image;
  }
  
  const apiUrl = process.env.REACT_APP_API_URL || '/api';
  const serverUrl = apiUrl.replace(/\/api\/?$/, '');

  let cleanPath = image.startsWith('/') ? image.slice(1) : image;

  if (!cleanPath.startsWith('uploads/') && !cleanPath.startsWith('images/')) {
    cleanPath = `uploads/${cleanPath}`;
  }

  return `${serverUrl}/${cleanPath}`;
};