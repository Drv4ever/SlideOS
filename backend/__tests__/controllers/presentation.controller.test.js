import {
  getPublicPresentationById,
  updatePresentation,
} from "../../src/controllers/presentation.controller.js";

jest.mock("../../models/presentation.js", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

import Presentation from "../../models/presentation.js";

describe("presentation controller — sharing", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getPublicPresentationById", () => {
    // The controller chains .select(...) after findById, so the mock must be
    // chainable and resolve the final doc.
    const mockFindById = (doc) => {
      Presentation.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(doc),
      });
    };

    test("returns 404 when the presentation does not exist", async () => {
      mockReq = { params: { id: "nonexistent" } };
      mockFindById(null);

      await getPublicPresentationById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Presentation not found" })
      );
    });

    test("returns 403 when the presentation is not public", async () => {
      mockReq = { params: { id: "deck-1" } };
      mockFindById({
        _id: "deck-1",
        isPublic: false,
      });

      await getPublicPresentationById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test("returns the deck without owner fields when public", async () => {
      const publicDeck = {
        _id: "deck-1",
        title: "Shared Deck",
        theme: "noir",
        slidesCount: 3,
        content: { slides: [{ heading: "Hi", content: [] }] },
        updatedAt: new Date("2026-01-01"),
        isPublic: true,
      };
      mockReq = { params: { id: "deck-1" } };
      mockFindById(publicDeck);

      await getPublicPresentationById(mockReq, mockRes);

      expect(Presentation.findById).toHaveBeenCalledWith("deck-1");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const data = mockRes.json.mock.calls[0][0].data;
      expect(data.title).toBe("Shared Deck");
      expect(data.content.slides).toHaveLength(1);
      // No owner identity (userId) is exposed to the public link.
      expect(data).not.toHaveProperty("userId");
    });
  });

  describe("updatePresentation", () => {
    test("persists isPublic when toggling sharing on", async () => {
      const presentation = {
        _id: "deck-1",
        userId: { toString: () => "user-1" },
        title: "Deck",
        save: jest.fn().mockResolvedValue({ _id: "deck-1" }),
      };
      Presentation.findById.mockResolvedValue(presentation);

      mockReq = {
        params: { id: "deck-1" },
        body: { isPublic: true },
        user: { id: "user-1" },
      };

      await updatePresentation(mockReq, mockRes);

      expect(presentation.isPublic).toBe(true);
      expect(presentation.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test("rejects renaming/sharing someone else's deck", async () => {
      const presentation = {
        _id: "deck-1",
        userId: { toString: () => "other-user" },
        save: jest.fn(),
      };
      Presentation.findById.mockResolvedValue(presentation);

      mockReq = {
        params: { id: "deck-1" },
        body: { isPublic: true },
        user: { id: "user-1" },
      };

      await updatePresentation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(presentation.save).not.toHaveBeenCalled();
    });
  });
});
