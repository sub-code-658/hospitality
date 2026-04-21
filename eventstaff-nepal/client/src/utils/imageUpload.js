import api from '../api/axios';

export async function uploadImage(file, type = 'profile') {
  if (!file) return null;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  try {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

export function validateImageFile(file, maxSizeMB = 5) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WebP files are allowed' };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  return { valid: true };
}

export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}