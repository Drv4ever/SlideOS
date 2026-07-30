const UNSPLASH_API = "https://api.unsplash.com/photos/random";

export async function fetchSlideImages(slides) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn("UNSPLASH_ACCESS_KEY is not defined. Skipping image fetch.");
    return slides.map(() => null);
  }

  const results = [];

  for (const slide of slides) {
    const keyword = slide.imageKeyword || slide.heading || "presentation";
    try {
      const url = `${UNSPLASH_API}?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${accessKey}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.warn(`Unsplash API error for "${keyword}": ${res.status}`);
        results.push(null);
        await delay(100);
        continue;
      }

      const data = await res.json();
      results.push({
        url: data.urls?.regular || null,
        thumb: data.urls?.thumb || null,
        small: data.urls?.small || null,
        alt: data.alt_description || keyword,
        attribution: {
          name: data.user?.name || "Unknown",
          link: data.user?.links?.html || null,
        },
      });
    } catch (err) {
      console.warn(`Unsplash fetch failed for "${keyword}":`, err.message);
      results.push(null);
    }

    await delay(100);
  }

  return results;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
