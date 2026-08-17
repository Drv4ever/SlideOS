// Keyless AI image generation via Pollinations. The URL itself is the image —
// no API key or upload step. A paid provider (Stability/OpenAI) can replace
// generateSlideImage later without touching any UI code.

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

// Build a Pollinations image URL for a 16:9 slide canvas (1100x618 web,
// 10x5.625in PPTX), matching the aspect ratio every renderer uses.
export function buildPollinationsUrl(
  prompt,
  { width = 1536, height = 864, seed, model = "flux" } = {}
) {
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    nologo: "true",
    model,
  });
  if (seed !== undefined && seed !== null) {
    params.set("seed", String(seed));
  }
  return `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?${params.toString()}`;
}

// Return a usable image URL for the given prompt. Optionally probes the URL so
// callers can fail fast instead of embedding a broken image.
export async function generateSlideImage(prompt, opts) {
  const url = buildPollinationsUrl(prompt, opts);
  if (opts?.probe === false) return url;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) return url;
  } catch (err) {
    // Pollinations can be slow to first generate; fall through to the URL so
    // the <img> tag gets a chance to load it.
    console.warn("Pollinations probe failed, returning URL anyway:", err.message);
  }
  return url;
}