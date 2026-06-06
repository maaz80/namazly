/**
 * Optimizes Google profile picture URLs to request a specific size and format (WebP).
 * 
 * @param {string} url - The original avatar URL
 * @param {number} [size] - The requested image width/height in pixels (default: 64)
 * @returns {string} The optimized avatar URL
 */
export function getOptimizedAvatar(url, size = 64) {
  if (!url) return '/icon-192.png';
  
  if (url.includes('googleusercontent.com')) {
    // Google profile photo URLs end with '=s96-c' or similar options.
    // We split by '=' and replace the options suffix with the optimized options:
    // - s{size}: specify size
    // - c: crop to square
    // - rw: serve WebP for browsers that support it
    const base = url.split('=')[0];
    return `${base}=s${size}-c-rw`;
  }
  
  return url;
}
