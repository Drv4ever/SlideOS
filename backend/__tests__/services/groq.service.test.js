import { generateWithGroq, normalizeSlideCount } from "../../src/services/groq.service.js";

// Mock global fetch
global.fetch = jest.fn();

describe("generateWithGroq", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROQ_API_KEY = "test-groq-key";
  });

  test("should throw error when GROQ_API_KEY is not defined", async () => {
    delete process.env.GROQ_API_KEY;
    await expect(generateWithGroq({ prompt: "test" })).rejects.toThrow(
      "GROQ_API_KEY is not defined"
    );
  });

  test("should call Groq API with correct parameters", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: "Test Title",
                  slides: [{ slideNumber: 1, heading: "Intro", content: ["A"], imageKeyword: "test image", layout: "title-slide" }],
                }),
              },
            },
          ],
        }),
    };

    global.fetch.mockResolvedValue(mockResponse);

    const result = await generateWithGroq({
      prompt: "Test topic",
      slides: 1,
      textAmount: "detailed",
      theme: "cornflower",
      tone: "professional",
      audience: "general",
      scenario: "educational",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-groq-key",
        },
        body: expect.any(String),
      })
    );

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(body.temperature).toBe(0.7);
    expect(body.response_format).toEqual({ type: "json_object" });
    // Adaptive output cap sized to the deck (1024 + 1 * 256 = 1280).
    expect(body.max_tokens).toBe(1280);
    expect(body.messages[0]).toHaveProperty("role", "system");
    expect(body.messages[0]).toHaveProperty("content");
    expect(body.messages[1]).toEqual({ role: "user", content: "Topic: Test topic" });

    // Verify system prompt includes imageKeyword and layout instructions
    expect(body.messages[0].content).toContain("imageKeyword");
    expect(body.messages[0].content).toContain("layout");
    expect(body.messages[0].content).toContain("title-slide");
    expect(body.messages[0].content).toContain("bullets-image");
    // Expanded layout set teaches the LLM the new designed layouts
    expect(body.messages[0].content).toContain("timeline");
    expect(body.messages[0].content).toContain("stat-grid");
    expect(body.messages[0].content).toContain("comparison");
    expect(body.messages[0].content).toContain("agenda");
    expect(body.messages[0].content).toContain("quote");
    expect(body.messages[0].content).toContain("closing");

    expect(result).toHaveProperty("title", "Test Title");
    expect(result.slides[0]).toHaveProperty("imageKeyword", "test image");
    expect(result.slides[0]).toHaveProperty("layout", "title-slide");
  });

  test("should throw error when API returns non-OK status", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    await expect(
      generateWithGroq({
        prompt: "test",
        slides: 1,
        textAmount: "detailed",
        theme: "cornflower",
      })
    ).rejects.toThrow("Groq API request failed: 401 Unauthorized");
  });

  test("should throw error when response has no content", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: null } }],
        }),
    });

    await expect(
      generateWithGroq({
        prompt: "test",
        slides: 1,
        textAmount: "detailed",
        theme: "cornflower",
      })
    ).rejects.toThrow("Groq response did not include any content.");
  });

  test("should strip markdown code fences from response", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: '```json\n{"title":"Test","slides":[]}\n```',
              },
            },
          ],
        }),
    });

    const result = await generateWithGroq({
      prompt: "test",
      slides: 1,
      textAmount: "detailed",
      theme: "cornflower",
    });

    expect(result.title).toBe("Test");
  });

  test("should use remix system prompt and pass deck content as-is when mode is remix", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: "Redesigned",
                  slides: [
                    { slideNumber: 1, heading: "New Heading", content: ["Fresh point"], imageKeyword: "fresh visual", layout: "content-only" },
                  ],
                }),
              },
            },
          ],
        }),
    });

    const deckOutline = "Slide 1 [layout: title-slide]:\nIntro\n- Point one";

    const result = await generateWithGroq({
      prompt: deckOutline,
      slides: 1,
      textAmount: "concise",
      theme: "orbit",
      mode: "remix",
    });

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    // Remix prompt describes redesigning an existing deck...
    expect(body.messages[0].content).toContain("redesigning an existing presentation");
    expect(body.messages[0].content).toContain("Keep the SAME number of slides");
    // ...and the deck content is sent verbatim (not prefixed with "Topic:").
    expect(body.messages[1].content).toBe(deckOutline);

    expect(result.title).toBe("Redesigned");
    expect(result.slides[0].heading).toBe("New Heading");
    expect(result.slides[0].layout).toBe("content-only");
  });

  describe("normalizeSlideCount", () => {
    test("should pad a short deck up to the requested count", () => {
      const deck = {
        title: "Test",
        slides: Array.from({ length: 7 }, (_, i) => ({
          slideNumber: i + 1,
          heading: `Slide ${i + 1}`,
          content: ["point"],
          imageKeyword: "image",
          layout: "content-only",
        })),
      };

      const result = normalizeSlideCount(deck, 10);

      expect(result.slides).toHaveLength(10);
      result.slides.forEach((s, i) => expect(s.slideNumber).toBe(i + 1));
      expect(result.slides[9].heading).toContain("(continued)");
    });

    test("should trim a deck that has more slides than requested", () => {
      const deck = {
        title: "Test",
        slides: Array.from({ length: 12 }, (_, i) => ({
          slideNumber: i + 1,
          heading: `Slide ${i + 1}`,
          content: ["point"],
          imageKeyword: "image",
          layout: "content-only",
        })),
      };

      const result = normalizeSlideCount(deck, 10);

      expect(result.slides).toHaveLength(10);
      result.slides.forEach((s, i) => expect(s.slideNumber).toBe(i + 1));
    });

    test("should renumber slides sequentially when the LLM skipped numbers", () => {
      const deck = {
        title: "Test",
        slides: [
          { slideNumber: 1, heading: "A", content: [], imageKeyword: "k", layout: "content-only" },
          { slideNumber: 3, heading: "B", content: [], imageKeyword: "k", layout: "content-only" },
          { slideNumber: 9, heading: "C", content: [], imageKeyword: "k", layout: "content-only" },
        ],
      };

      const result = normalizeSlideCount(deck, 3);

      expect(result.slides.map((s) => s.slideNumber)).toEqual([1, 2, 3]);
    });
  });
});
