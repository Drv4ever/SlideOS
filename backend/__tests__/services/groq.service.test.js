import { generateWithGroq } from "../../src/services/groq.service.js";

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
    expect(body.model).toBe("llama-3.1-8b-instant");
    expect(body.temperature).toBe(0.7);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[0]).toHaveProperty("role", "system");
    expect(body.messages[0]).toHaveProperty("content");
    expect(body.messages[1]).toEqual({ role: "user", content: "Topic: Test topic" });

    // Verify system prompt includes imageKeyword and layout instructions
    expect(body.messages[0].content).toContain("imageKeyword");
    expect(body.messages[0].content).toContain("layout");
    expect(body.messages[0].content).toContain("title-slide");
    expect(body.messages[0].content).toContain("bullets-image");

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
});
