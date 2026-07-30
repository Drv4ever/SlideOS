import { fetchSlideImages } from "../../src/services/image.service.js";

// Mock fetch globally
global.fetch = jest.fn();

describe("fetchSlideImages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("with valid Unsplash API key", () => {
    beforeEach(() => {
      process.env.UNSPLASH_ACCESS_KEY = "test-key";
    });

    afterEach(() => {
      delete process.env.UNSPLASH_ACCESS_KEY;
    });

    test("should fetch images for all slides with imageKeyword", async () => {
      const slides = [
        { imageKeyword: "solar panels", heading: "Solar Energy" },
        { imageKeyword: "wind turbines", heading: "Wind Power" },
        { imageKeyword: "hydro dam", heading: "Hydropower" },
      ];

      global.fetch.mockImplementation((url) => {
        if (url.includes("solar")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              urls: { regular: "https://images.unsplash.com/solar", thumb: "https://images.unsplash.com/solar-thumb" },
              alt_description: "Solar panels in a field",
              user: { name: "John Doe", links: { html: "https://unsplash.com/@johndoe" } },
            }),
          });
        }
        if (url.includes("wind")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              urls: { regular: "https://images.unsplash.com/wind", thumb: "https://images.unsplash.com/wind-thumb" },
              alt_description: "Wind turbines at sunset",
              user: { name: "Jane Smith", links: { html: "https://unsplash.com/@janesmith" } },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            urls: { regular: "https://images.unsplash.com/hydro", thumb: "https://images.unsplash.com/hydro-thumb" },
            alt_description: "Hydroelectric dam",
            user: { name: "Bob Wilson", links: { html: "https://unsplash.com/@bobwilson" } },
          }),
        });
      });

      const result = await fetchSlideImages(slides);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty("url", "https://images.unsplash.com/solar");
      expect(result[0]).toHaveProperty("thumb", "https://images.unsplash.com/solar-thumb");
      expect(result[0]).toHaveProperty("alt", "Solar panels in a field");
      expect(result[0].attribution).toHaveProperty("name", "John Doe");
      expect(result[0].attribution).toHaveProperty("link", "https://unsplash.com/@johndoe");
      expect(result[1]).toHaveProperty("url", "https://images.unsplash.com/wind");
      expect(result[2]).toHaveProperty("url", "https://images.unsplash.com/hydro");
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test("should use heading as fallback keyword when imageKeyword is missing", async () => {
      const slides = [{ heading: "Business Meeting" }];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          urls: { regular: "https://images.unsplash.com/meeting", thumb: "https://images.unsplash.com/meeting-thumb" },
          alt_description: "Business meeting",
          user: { name: "Test User", links: { html: "https://unsplash.com/@test" } },
        }),
      });

      const result = await fetchSlideImages(slides);
      expect(result[0].url).toBe("https://images.unsplash.com/meeting");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("query=Business%20Meeting")
      );
    });

    test("should return null for slide when Unsplash returns error", async () => {
      const slides = [{ imageKeyword: "valid search" }];

      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
      });

      const result = await fetchSlideImages(slides);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeNull();
    });

    test("should return null for slide when fetch throws error", async () => {
      const slides = [{ imageKeyword: "valid search" }];

      global.fetch.mockRejectedValue(new Error("Network error"));

      const result = await fetchSlideImages(slides);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeNull();
    });

    test("should handle empty slides array", async () => {
      const result = await fetchSlideImages([]);
      expect(result).toHaveLength(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should handle slides with empty imageKeyword", async () => {
      const slides = [{ imageKeyword: "", heading: "Test Slide" }];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          urls: { regular: "https://images.unsplash.com/test", thumb: "https://images.unsplash.com/test-thumb" },
          alt_description: "Test image",
          user: { name: "Test", links: { html: "https://unsplash.com/@test" } },
        }),
      });

      const result = await fetchSlideImages(slides);
      expect(result[0].url).toBe("https://images.unsplash.com/test");
    });
  });

  describe("without Unsplash API key", () => {
    beforeEach(() => {
      delete process.env.UNSPLASH_ACCESS_KEY;
    });

    test("should return null for all slides when API key is missing", async () => {
      const slides = [
        { imageKeyword: "test1" },
        { imageKeyword: "test2" },
      ];

      const result = await fetchSlideImages(slides);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeNull();
      expect(result[1]).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
