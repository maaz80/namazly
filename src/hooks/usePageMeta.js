import { useEffect } from 'react';

/**
 * Custom hook to dynamically update page-specific SEO meta tags, canonical link,
 * and social preview tags (Open Graph & Twitter Cards).
 * 
 * @param {string} title - The page title
 * @param {string} description - The meta description for search engines
 * @param {string} [path] - Optional route path (e.g. '/about') to set canonical tag
 */
export default function usePageMeta(title, description, path = '') {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // 3. Update Open Graph Meta Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://namazly.in${path}`);
    }

    // 4. Update Twitter Card Meta Tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', description);

    // 5. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://namazly.in${path}`);
  }, [title, description, path]);
}
