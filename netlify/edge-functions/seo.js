export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Get the original response from Netlify CDN
  const response = await context.next();

  // If request is for an asset, API, or static file, bypass edge function to prevent corruption
  if (
    path.includes(".") ||
    path.startsWith("/api/") ||
    path.startsWith("/static/") ||
    request.method !== "GET"
  ) {
    return response;
  }

  let html = await response.text();

  // If it's a dynamic masail detail page
  if (path.startsWith("/masail/") && path !== "/masail" && path !== "/masail/") {
    const slug = path.split("/masail/")[1];
    if (slug) {
      let title = "Islamic Ruling details | Namazly";
      let desc = "Read detailed Islamic rulings (Masla & Jawab) with verified scholar and book references.";

      try {
        // Fetch masla details from backend API (with 2.5 second timeout to prevent slow loading)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const apiRes = await fetch(`https://namazly-backend.onrender.com/api/masail/detail/${slug}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data && data.success && data.masla) {
            // Clean up double quotes to prevent breaking HTML attributes
            const cleanQuestion = data.masla.question.replace(/"/g, '&quot;');
            const cleanAnswer = data.masla.answer.slice(0, 155).replace(/"/g, '&quot;') + '...';
            
            title = `${cleanQuestion} — Answer & Reference | Namazly`;
            desc = cleanAnswer;
          }
        }
      } catch (err) {
        console.error("Error fetching masla details in Edge Function:", err);
      }

      // Replace Title
      html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

      // Replace Meta Description (handles newline formatting in index.html)
      html = html.replace(
        /<meta name="description"[\s\S]*?content=".*?" \/>/i,
        `<meta name="description" content="${desc}" />`
      );

      // Replace Open Graph Tags
      html = html.replace(
        /<meta property="og:title"[\s\S]*?content=".*?" \/>/i,
        `<meta property="og:title" content="${title}" />`
      );
      html = html.replace(
        /<meta property="og:description"[\s\S]*?content=".*?" \/>/i,
        `<meta property="og:description" content="${desc}" />`
      );
      html = html.replace(
        /<meta property="og:url"[\s\S]*?content=".*?" \/>/i,
        `<meta property="og:url" content="https://namazly.in${path}" />`
      );

      // Replace Twitter Tags
      html = html.replace(
        /<meta name="twitter:title"[\s\S]*?content=".*?" \/>/i,
        `<meta name="twitter:title" content="${title}" />`
      );
      html = html.replace(
        /<meta name="twitter:description"[\s\S]*?content=".*?" \/>/i,
        `<meta name="twitter:description" content="${desc}" />`
      );
    }
  }

  // Update Canonical tag dynamically for all HTML routes
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/i,
    `<link rel="canonical" href="https://namazly.in${path === '/' ? '/' : path}" />`
  );

  return new Response(html, {
    headers: response.headers,
  });
};

export const config = {
  path: "/*",
};
