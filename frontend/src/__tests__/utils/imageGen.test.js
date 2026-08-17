import { describe, it, expect } from "vitest";
import { buildPollinationsUrl, generateSlideImage } from "../../utils/imageGen.js";

describe("imageGen", () => {
  describe("buildPollinationsUrl", () => {
    it("builds a 16:9 URL with defaults", () => {
      const url = buildPollinationsUrl("solar panels desert");
      expect(url.startsWith("https://image.pollinations.ai/prompt/solar%20panels%20desert")).toBe(true);
      expect(url).toContain("width=1536");
      expect(url).toContain("height=864");
      expect(url).toContain("nologo=true");
      expect(url).toContain("model=flux");
    });

    it("honors custom size and seed", () => {
      const url = buildPollinationsUrl("city skyline", {
        width: 1920,
        height: 1080,
        seed: 42,
      });
      expect(url).toContain("width=1920");
      expect(url).toContain("height=1080");
      expect(url).toContain("seed=42");
    });

    it("omits seed when not provided", () => {
      const url = buildPollinationsUrl("test");
      expect(url).not.toContain("seed=");
    });
  });

  describe("generateSlideImage", () => {
    it("returns the URL without probing when probe is disabled", async () => {
      const url = await generateSlideImage("test prompt", { probe: false });
      expect(url).toContain("https://image.pollinations.ai/prompt/test%20prompt");
    });
  });
});