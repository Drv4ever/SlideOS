import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { serializeForRemix, remixDeck, remixSlide } from "../../utils/remix.js";

const API_BASE_URL = "http://localhost:5000/api";

describe("remix", () => {
  beforeEach(() => {
    localStorage.setItem("token", "aaa.bbb.ccc");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              title: "Redesigned",
              slides: [
                {
                  slideNumber: 1,
                  heading: "New Heading",
                  content: ["Fresh point"],
                  imageKeyword: "fresh visual",
                  layout: "content-only",
                  image: { url: "https://img.example/x.jpg" },
                },
              ],
            },
          }),
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  describe("serializeForRemix", () => {
    it("serializes outline-format slides with heading, bullets and layout", () => {
      const out = serializeForRemix([
        {
          heading: "Intro",
          content: ["Point one", "Point two"],
          layout: "title-slide",
        },
      ]);

      expect(out).toContain("Slide 1");
      expect(out).toContain("[layout: title-slide]");
      expect(out).toContain("Intro");
      expect(out).toContain("- Point one");
      expect(out).toContain("- Point two");
    });

    it("serializes editor-format slides by extracting roles", () => {
      const out = serializeForRemix([
        {
          layout: "content-only",
          elements: [
            { type: "text", content: "Editor Heading", bold: true },
            { type: "text", content: "Editor bullet" },
          ],
        },
      ]);

      expect(out).toContain("Editor Heading");
      expect(out).toContain("- Editor bullet");
    });
  });

  describe("remixDeck", () => {
    it("posts to the generate endpoint with mode remix and the serialized deck", async () => {
      const slides = [
        { heading: "Intro", content: ["Point"], layout: "title-slide" },
        { heading: "Body", content: ["A", "B"], layout: "content-only" },
      ];

      const result = await remixDeck({
        slides,
        themeId: "cornflower",
        textAmount: "detailed",
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/generate`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer aaa.bbb.ccc",
          }),
        })
      );

      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.mode).toBe("remix");
      expect(body.slides).toBe(2);
      // themePayload resolves the id to the full theme brief for the LLM.
      expect(body.theme).toMatchObject({ id: "cornflower" });
      expect(body.textAmount).toBe("detailed");
      expect(body.prompt).toContain("Slide 1");
      expect(body.prompt).toContain("Slide 2");

      // Response slides are normalized to the canonical outline shape.
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        heading: "New Heading",
        content: ["Fresh point"],
        layout: "content-only",
      });
      expect(result[0].image).toEqual({ url: "https://img.example/x.jpg" });
      expect(result[0].elements).toBeDefined();
    });

    it("throws when no valid auth token exists", async () => {
      localStorage.setItem("token", "not-a-jwt");
      await expect(
        remixDeck({ slides: [], themeId: "cornflower", textAmount: "detailed" })
      ).rejects.toThrow("Please login first");
    });
  });

  describe("remixSlide", () => {
    it("requests a single slide and returns one normalized outline slide", async () => {
      const result = await remixSlide({
        slide: { heading: "Intro", content: ["Point"], layout: "title-slide" },
        themeId: "cornflower",
        textAmount: "detailed",
      });

      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.slides).toBe(1);
      expect(body.mode).toBe("remix");

      expect(result).toMatchObject({
        heading: "New Heading",
        layout: "content-only",
      });
    });
  });
});