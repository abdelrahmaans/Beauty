export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';

/**
 * Converts Google Drive viewer URLs and arbitrary links into direct, high-res image URLs.
 * Automatically falls back to a luxury beauty image if the input is empty or invalid.
 */
export function formatProductImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  // Google Drive format 1: https://drive.google.com/file/d/{FILE_ID}/view...
  const driveMatch1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1 && driveMatch1[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch1[1]}`;
  }

  // Google Drive format 2 & 3: https://drive.google.com/open?id={FILE_ID} or /uc?id={FILE_ID}
  const driveMatch2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch2 && driveMatch2[1] && trimmed.includes('drive.google.com')) {
    return `https://lh3.googleusercontent.com/d/${driveMatch2[1]}`;
  }

  // If already Google lh3 direct link
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Generates a clean, unique short display code for bookings or orders.
 * e.g. "e47d6966-6f64-4f31-ab21-4cdca99728af" => "4CDCA997"
 */
export function formatUniqueCode(id: string | null | undefined, length: number = 8): string {
  if (!id) return '00000000';
  const clean = id.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length <= length) return clean.toUpperCase();
  // Return the last 8 characters for high uniqueness
  return clean.slice(-length).toUpperCase();
}
