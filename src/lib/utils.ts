import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse "dd/mm/yyyy" to JS Date
export function parseVnDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  let year = parseInt(parts[2], 10);
  
  if (year < 100) {
    year += year >= 50 ? 1900 : 2000;
  }
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

// Format Date to "dd/mm/yyyy"
export function formatVnDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Calculate days remaining between expiry and today (or custom today)
export function getDaysRemaining(expiryStr: string | undefined, todayStr?: string): number | null {
  if (!expiryStr) return null;
  const expiryDate = parseVnDate(expiryStr);
  if (!expiryDate) return null;
  
  let baseDate = new Date();
  if (todayStr) {
    const customToday = parseVnDate(todayStr);
    if (customToday) baseDate = customToday;
  }
  
  // Set time components to 0 for exact day diff
  expiryDate.setHours(0, 0, 0, 0);
  baseDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - baseDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Compresses an uploaded image File using HTML Canvas and returns a optimized base64 Data URL.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lỗi đọc file hình ảnh'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Lỗi nạp hình ảnh'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

