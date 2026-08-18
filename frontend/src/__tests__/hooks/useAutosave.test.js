import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, expect, test } from "vitest";
import { useAutosave } from "../../hooks/useAutosave";
import { updatePresentation } from "../../services/presentationService";

vi.mock("../../services/presentationService", () => ({
  updatePresentation: vi.fn(),
}));

describe("useAutosave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updatePresentation.mockResolvedValue({ success: true });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = (overrides = {}) => {
    return renderHook((props) => useAutosave(props), {
      initialProps: {
        id: "deck-1",
        enabled: true,
        payload: { title: "T", slidesCount: 1, content: { slides: [] } },
        signature: "v1",
        delay: 1000,
        ...overrides,
      },
    });
  };

  test("does not save on first render (deck load)", () => {
    const { result } = setup();
    expect(result.current.status).toBe("idle");
    act(() => vi.advanceTimersByTime(5000));
    expect(updatePresentation).not.toHaveBeenCalled();
  });

  test("debounced save fires after the delay once the signature changes", async () => {
    const onError = vi.fn();
    const { result, rerender } = setup({ onError });
    rerender({ id: "deck-1", enabled: true, payload: { slidesCount: 2 }, signature: "v2", delay: 1000 });
    expect(updatePresentation).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(updatePresentation).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(updatePresentation).toHaveBeenCalledTimes(1);
    expect(updatePresentation).toHaveBeenCalledWith("deck-1", { slidesCount: 2 });
    expect(result.current.status).toBe("saved");
  });

  test("repeated signature changes reset the debounce timer", async () => {
    const { rerender } = setup();
    rerender({ id: "deck-1", enabled: true, payload: { n: 1 }, signature: "v2", delay: 1000 });
    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    rerender({ id: "deck-1", enabled: true, payload: { n: 2 }, signature: "v3", delay: 1000 });
    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    expect(updatePresentation).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(updatePresentation).toHaveBeenCalledTimes(1);
    expect(updatePresentation).toHaveBeenCalledWith("deck-1", { n: 2 });
  });

  test("saveNow forces an immediate save", async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.saveNow();
    });
    expect(updatePresentation).toHaveBeenCalledTimes(1);
  });

  test("skips saves when disabled or without an id", async () => {
    const { result } = setup({ id: null, enabled: false });
    await act(async () => {
      await result.current.saveNow();
    });
    expect(updatePresentation).not.toHaveBeenCalled();
  });

  test("reports errors through onError and keeps status as error", async () => {
    updatePresentation.mockRejectedValueOnce(new Error("network down"));
    const onError = vi.fn();
    const { result, rerender } = setup({ onError });
    rerender({ id: "deck-1", enabled: true, payload: { n: 2 }, signature: "v2", delay: 1000, onError });
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "network down" }));
    expect(result.current.status).toBe("error");
  });

  test("unmounting with a dirty deck flushes a best-effort save", async () => {
    const { rerender, unmount } = setup();
    rerender({ id: "deck-1", enabled: true, payload: { n: 2 }, signature: "v2", delay: 1000 });
    act(() => unmount());
    await act(async () => {
      await Promise.resolve();
    });
    expect(updatePresentation).toHaveBeenCalledWith("deck-1", { n: 2 });
  });
});