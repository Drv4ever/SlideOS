import { validateGenerateInput } from "../../src/validaters/generate.validator.js";

describe("validateGenerateInput", () => {
  describe("valid inputs", () => {
    test("should return null for valid input with all fields", () => {
      const data = {
        prompt: "My Presentation Topic",
        slides: 5,
        textAmount: "detailed",
        theme: "cornflower",
      };
      expect(validateGenerateInput(data)).toBeNull();
    });

    test("should return null for minimal valid input", () => {
      const data = {
        prompt: "Test",
        slides: 1,
        textAmount: "minimal",
        theme: "noir",
      };
      expect(validateGenerateInput(data)).toBeNull();
    });

    test("should return null for maximum slides (20)", () => {
      const data = {
        prompt: "Test",
        slides: 20,
        textAmount: "extensive",
        theme: "orbit",
      };
      expect(validateGenerateInput(data)).toBeNull();
    });

    test("should return null for all valid textAmount values", () => {
      const amounts = ["minimal", "concise", "detailed", "extensive"];
      amounts.forEach((amount) => {
        const data = {
          prompt: "Test",
          slides: 3,
          textAmount: amount,
          theme: "cornflower",
        };
        expect(validateGenerateInput(data)).toBeNull();
      });
    });
  });

  describe("missing prompt", () => {
    test("should return error when prompt is missing", () => {
      const data = { slides: 5, textAmount: "detailed", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Prompt is required");
    });

    test("should return error when prompt is empty string", () => {
      const data = { prompt: "", slides: 5, textAmount: "detailed", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Prompt is required");
    });

    test("should return error when prompt is only whitespace", () => {
      const data = { prompt: "   ", slides: 5, textAmount: "detailed", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Prompt is required");
    });
  });

  describe("invalid slides count", () => {
    test("should return error when slides is 0", () => {
      const data = { prompt: "Test", slides: 0, textAmount: "detailed", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Slides must be between 1 and 20");
    });

    test("should return error when slides is negative", () => {
      const data = { prompt: "Test", slides: -1, textAmount: "detailed", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Slides must be between 1 and 20");
    });

    test("should return error when slides is 21", () => {
      const data = { prompt: "Test", slides: 21, textAmount: "detailed", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Slides must be between 1 and 20");
    });

    test("should return error when slides is missing", () => {
      const data = { prompt: "Test", textAmount: "detailed", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Slides must be between 1 and 20");
    });
  });

  describe("invalid textAmount", () => {
    test("should return error when textAmount is invalid", () => {
      const data = { prompt: "Test", slides: 5, textAmount: "invalid", theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Invalid text amount");
    });

    test("should return error when textAmount is missing", () => {
      const data = { prompt: "Test", slides: 5, theme: "cornflower" };
      expect(validateGenerateInput(data)).toBe("Invalid text amount");
    });
  });

  describe("missing theme", () => {
    test("should return error when theme is missing", () => {
      const data = { prompt: "Test", slides: 5, textAmount: "detailed" };
      expect(validateGenerateInput(data)).toBe("Theme is required");
    });

    test("should return error when theme is empty string", () => {
      const data = { prompt: "Test", slides: 5, textAmount: "detailed", theme: "" };
      expect(validateGenerateInput(data)).toBe("Theme is required");
    });
  });

  describe("edge cases", () => {
    test("should return error when data is null", () => {
      expect(validateGenerateInput(null)).toBe("Request body is missing");
    });

    test("should return error when data is undefined", () => {
      expect(validateGenerateInput(undefined)).toBe("Request body is missing");
    });

    test("should return error when data is empty object", () => {
      expect(validateGenerateInput({})).toBe("Prompt is required");
    });
  });
});
