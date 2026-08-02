let cachedMasail = null;

async function getMasailList(requestUrl) {
  if (cachedMasail) return cachedMasail;
  try {
    const jsonUrl = new URL("/masail.json", requestUrl).href;
    const res = await fetch(jsonUrl);
    if (res.ok) {
      cachedMasail = await res.json();
      console.log(`Successfully loaded ${cachedMasail.length} items from CDN into Edge memory.`);
      return cachedMasail;
    }
  } catch (err) {
    console.error("Error loading masail.json from Edge CDN:", err);
  }
  return null;
}

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

  let canonicalUrl = `https://namazly.in${path === "/" ? "/" : path}`;

  // If it's a dynamic masail detail page
  if (path.startsWith("/masail/") && path !== "/masail" && path !== "/masail/") {
    const slug = path.split("/masail/")[1];
    if (slug) {
      let title = "Islamic Ruling details | Namazly";
      let desc = "Read detailed Islamic rulings (Masla & Jawab) with verified scholar and book references.";
      let qaSchema = null;
      let breadcrumbSchema = null;
      let prerenderedContent = "";

      let masla = null;
      let related = [];

      // Find the ruling in the static JSON list (super fast CDN load)
      const masailList = await getMasailList(request.url);
      if (masailList) {
        masla = masailList.find(m => m.slug === slug);
        if (masla) {
          related = masailList
            .filter(m => m.category === masla.category && m.slug !== slug)
            .slice(0, 5);
        }
      }

      // If we found the masla statically, inject SEO and prerender
      if (masla) {
        const cleanQuestion = masla.question.replace(/"/g, '&quot;');
        const cleanAnswer = masla.answer.slice(0, 155).replace(/"/g, '&quot;') + '...';
        
        title = `${cleanQuestion} — Answer & Reference | Namazly`;
        desc = cleanAnswer;

        // Build QA Schema
        qaSchema = {
          "@context": "https://schema.org",
          "@type": "QAPage",
          "mainEntity": {
            "@type": "Question",
            "name": masla.question,
            "text": masla.question,
            "answerCount": 1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": masla.answer,
              "upvoteCount": 1,
              "url": `https://namazly.in/masail/${slug}`
            }
          }
        };

        // Build Breadcrumb Schema
        breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://namazly.in/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Masail",
              "item": "https://namazly.in/masail"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": masla.category || "General",
              "item": `https://namazly.in/masail?category=${encodeURIComponent(masla.category || "General")}`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": masla.question,
              "item": `https://namazly.in/masail/${slug}`
            }
          ]
        };

        // Build Prerendered HTML Content
        let relatedLinksHTML = "";
        if (related && related.length > 0) {
          relatedLinksHTML = related.map(item => `
            <li style="margin-bottom: 12px;">
              <a href="/masail/${item.slug}" style="color: #2d6850; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                ${item.question} &rarr;
              </a>
            </li>
          `).join("");
        } else {
          relatedLinksHTML = "<p style='color: #718096; font-size: 13px;'>No related rulings found.</p>";
        }

        prerenderedContent = `
          <div id="root">
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 24px; color: #2d3748; line-height: 1.6;">
              <nav style="margin-bottom: 24px; font-size: 13px; font-weight: 500;">
                <a href="/" style="color: #2d6850; text-decoration: none;">Home</a> &raquo;
                <a href="/masail" style="color: #2d6850; text-decoration: none;">Masail</a> &raquo;
                <span style="color: #718096;">${masla.category || "General"}</span>
              </nav>
              
              <article style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0; padding: 24px; margin-bottom: 24px;">
                <header style="margin-bottom: 20px;">
                  <span style="font-size: 11px; font-weight: 700; color: #2d6850; text-transform: uppercase; letter-spacing: 0.05em; background: #e8f5ee; padding: 4px 10px; border-radius: 9999px;">
                    Question / Sawaal
                  </span>
                  <h1 style="font-size: 20px; font-weight: 700; color: #1a202c; margin-top: 12px; margin-bottom: 0; line-height: 1.4;">
                    ${masla.question}
                  </h1>
                </header>
                
                <section style="background: #f0fdf4; border-left: 4px solid #2d6850; padding: 18px 20px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                  <span style="font-size: 11px; font-weight: 700; color: #2d6850; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">
                    Answer / Jawaab
                  </span>
                  <p style="font-size: 15px; color: #2d3748; margin: 0; white-space: pre-line; font-weight: 500;">
                    ${masla.answer}
                  </p>
                </section>
                
                <footer style="font-size: 12px; color: #4a5568; margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7; display: grid; grid-template-columns: 1fr; gap: 12px;">
                  <div><strong>Fatwa Authority:</strong> ${masla.authority || 'Darul Ifta'}</div>
                  <div><strong>Book Reference / Hawala:</strong> ${masla.reference || 'N/A'}</div>
                </footer>
              </article>
              
              <section style="background: rgba(255, 255, 255, 0.5); border-radius: 16px; border: 1px dashed #cbd5e0; padding: 24px; margin-top: 32px;">
                <h2 style="font-size: 15px; font-weight: 700; color: #2d3748; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0; margin-bottom: 16px;">
                  📚 Related Rulings (Muta'alliqa Masail)
                </h2>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${relatedLinksHTML}
                </ul>
              </section>
            </div>
          </div>
        `;
      }

      // Replace Meta tags in HTML
      html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
      html = html.replace(
        /<meta name="description"[\s\S]*?content=".*?" \/>/i,
        `<meta name="description" content="${desc}" />`
      );
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
      html = html.replace(
        /<meta name="twitter:title"[\s\S]*?content=".*?" \/>/i,
        `<meta name="twitter:title" content="${title}" />`
      );
      html = html.replace(
        /<meta name="twitter:description"[\s\S]*?content=".*?" \/>/i,
        `<meta name="twitter:description" content="${desc}" />`
      );

      // Inject Schemas
      let schemaScriptHtml = "";
      if (qaSchema) {
        schemaScriptHtml += `\n  <script type="application/ld+json">\n    ${JSON.stringify(qaSchema, null, 2)}\n  </script>`;
      }
      if (breadcrumbSchema) {
        schemaScriptHtml += `\n  <script type="application/ld+json">\n    ${JSON.stringify(breadcrumbSchema, null, 2)}\n  </script>`;
      }
      if (schemaScriptHtml) {
        html = html.replace("</head>", `${schemaScriptHtml}\n</head>`);
      }

      // Inject Prerendered HTML Content
      if (prerenderedContent) {
        html = html.replace('<div id="root"></div>', prerenderedContent);
      }
    }
  }

  // If it's the listing page (/masail or /masail/)
  if (path === "/masail" || path === "/masail/") {
    const pageParam = url.searchParams.get("page");
    const page = parseInt(pageParam) || 1;
    const limit = 12;
    
    if (page > 1) {
      canonicalUrl += `?page=${page}`;
    }

    let title = page > 1 
      ? `Islamic Masail & Answers — Page ${page} | Namazly` 
      : "Islamic Masail & Answers — Ask and Learn Rulings | Namazly";
    let desc = "Explore authentic solutions to Islamic rulings (Masail) regarding Wazu, Namaz, cleanliness, and daily issues with Mufti Taqi Usmani reference.";
    let breadcrumbSchema = null;
    let prerenderedListing = "";

    // Fetch listing statically from Deno cached memory (extremely fast)
    const masailList = await getMasailList(request.url);
    let paginatedMasail = [];
    let totalPages = 1;

    if (masailList) {
      totalPages = Math.ceil(masailList.length / limit) || 1;
      const startIndex = (page - 1) * limit;
      paginatedMasail = masailList.slice(startIndex, startIndex + limit);
    }

    if (paginatedMasail.length > 0) {
      // Build Breadcrumb Schema
      breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://namazly.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": page > 1 ? `Masail (Page ${page})` : "Masail",
            "item": canonicalUrl
          }
        ]
      };

      // Build Prerendered HTML Listing
      const itemsHtml = paginatedMasail.map(item => `
        <li style="margin-bottom: 20px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <span style="font-size: 10px; font-weight: 700; color: #2d6850; background: #e8f5ee; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${item.category}
          </span>
          <h2 style="font-size: 17px; margin: 12px 0 8px 0; font-weight: 700;">
            <a href="/masail/${item.slug}" style="color: #1a202c; text-decoration: none;">
              ${item.question}
            </a>
          </h2>
          <p style="font-size: 13.5px; color: #4a5568; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; font-weight: 500;">
            ${item.answer}
          </p>
          <div style="font-size: 11px; color: #718096; margin-top: 12px; border-top: 1px solid #edf2f7; padding-top: 8px;">
            Reference: <strong style="color: #2d6850;">${item.reference || 'N/A'}</strong>
          </div>
        </li>
      `).join("");

      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      const paginationHtml = `
        <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 32px; font-size: 14px; font-family: sans-serif;">
          ${prevPage ? `<a href="/masail?page=${prevPage}" style="color: #2d6850; text-decoration: none; font-weight: bold; padding: 10px 18px; border: 1px solid #cbd5e0; border-radius: 12px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">&larr; Previous</a>` : `<span style="color: #a0aec0; padding: 10px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f7fafc;">&larr; Previous</span>`}
          <span style="font-weight: 600; color: #4a5568;">Page ${page} of ${totalPages}</span>
          ${nextPage ? `<a href="/masail?page=${nextPage}" style="color: #2d6850; text-decoration: none; font-weight: bold; padding: 10px 18px; border: 1px solid #cbd5e0; border-radius: 12px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">Next &rarr;</a>` : `<span style="color: #a0aec0; padding: 10px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f7fafc;">Next &rarr;</span>`}
        </div>
      `;

      prerenderedListing = `
        <div id="root">
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #2d3748;">
            <header style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 28px; font-weight: 800; color: #1a202c; margin-bottom: 8px;">Islamic Masail & Answers</h1>
              <p style="font-size: 14.5px; color: #4a5568; max-width: 600px; margin: 0 auto; line-height: 1.5; font-weight: 500;">
                Authentic Islamic rulings (Masla & Jawab) compiled from 'Fatawa Usmani' by Mufti Muhammad Taqi Usmani Sahab.
              </p>
            </header>

            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px;">
              ${itemsHtml}
            </ul>

            ${paginationHtml}
          </div>
        </div>
      `;
    }

    // Replace Meta tags in HTML
    html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    html = html.replace(
      /<meta name="description"[\s\S]*?content=".*?" \/>/i,
      `<meta name="description" content="${desc}" />`
    );
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
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
    html = html.replace(
      /<meta name="twitter:title"[\s\S]*?content=".*?" \/>/i,
      `<meta name="twitter:title" content="${title}" />`
    );
    html = html.replace(
      /<meta name="twitter:description"[\s\S]*?content=".*?" \/>/i,
      `<meta name="twitter:description" content="${desc}" />`
    );

    // Inject Breadcrumb List Schema
    let schemaScriptHtml = "";
    if (breadcrumbSchema) {
      schemaScriptHtml += `\n  <script type="application/ld+json">\n    ${JSON.stringify(breadcrumbSchema, null, 2)}\n  </script>`;
    }
    if (schemaScriptHtml) {
      html = html.replace("</head>", `${schemaScriptHtml}\n</head>`);
    }

    // Inject Prerendered HTML Content
    if (prerenderedListing) {
      html = html.replace('<div id="root"></div>', prerenderedListing);
    }
  }

  // Update Canonical tag dynamically for all HTML routes
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  return new Response(html, {
    headers: response.headers,
  });
};

export const config = {
  path: "/*",
};
