import { renderHook, act } from "@testing-library/react";
import { useUndoHistory } from "../../hooks/useUndoHistory";

describe("useUndoHistory", () => {
  test("initializes with the given value", () => {
    const { result } = renderHook(() => useUndoHistory([1, 2]));
    expect(result.current[0]).toEqual([1, 2]);
  });

  test("setValue accepts plain values and updater functions", () => {
    const { result } = renderHook(() => useUndoHistory([1]));
    act(() => result.current[1]([1, 2]));
    expect(result.current[0]).toEqual([1, 2]);
    act(() => result.current[1]((prev) => [...prev, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  test("undo restores the previous snapshot and redo reapplies it", () => {
    const { result } = renderHook(() => useUndoHistory([1]));
    act(() => result.current[1]([1, 2]));
    act(() => result.current[1]([1, 2, 3]));

    expect(result.current[2].canUndo).toBe(true);
    expect(result.current[2].canRedo).toBe(false);

    act(() => result.current[2].undo());
    expect(result.current[0]).toEqual([1, 2]);

    act(() => result.current[2].undo());
    expect(result.current[0]).toEqual([1]);

    act(() => result.current[2].redo());
    expect(result.current[0]).toEqual([1, 2]);

    act(() => result.current[2].redo());
    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  test("redo history is cleared when a new value is set", () => {
    const { result } = renderHook(() => useUndoHistory([1]));
    act(() => result.current[1]([2]));
    act(() => result.current[2].undo());
    expect(result.current[2].canRedo).toBe(true);

    act(() => result.current[1]([3]));
    expect(result.current[2].canRedo).toBe(false);
    expect(result.current[0]).toEqual([3]);
  });

  test("undo at the start is a no-op and keeps canUndo false", () => {
    const { result } = renderHook(() => useUndoHistory([1]));
    expect(result.current[2].canUndo).toBe(false);
    act(() => result.current[2].undo());
    expect(result.current[0]).toEqual([1]);
  });

  test("setting the identical reference does not create a history entry", () => {
    const { result } = renderHook(() => useUndoHistory([1]));
    act(() => result.current[1](result.current[0]));
    expect(result.current[2].canUndo).toBe(false);
  });

  test("history is capped at the configured limit", () => {
    const { result } = renderHook(() => useUndoHistory(0, { limit: 3 }));
    for (let i = 1; i <= 6; i++) {
      act(() => result.current[1](i));
    }
    // 6 pushes, limit 3 -> only the last 3 snapshots remain.
    act(() => result.current[2].undo());
    expect(result.current[0]).toBe(5);
    act(() => result.current[2].undo());
    expect(result.current[0]).toBe(4);
    act(() => result.current[2].undo());
    expect(result.current[0]).toBe(3);
    act(() => result.current[2].undo());
    expect(result.current[0]).toBe(3);
    expect(result.current[2].canUndo).toBe(false);
  });
});