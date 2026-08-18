import { useCallback, useRef, useState } from "react";

// Drop-in undo/redo history around a piece of state. `setValue` accepts the
// same payloads as React's setState (plain value OR updater function), so it
// can replace an existing useState setter without touching call sites.
// History is captured in refs (not state) so `canUndo`/`canRedo` stay
// accurate without extra re-renders, and a currentValue mirror avoids stale
// closures when pushing snapshots.
export function useUndoHistory(initialValue, { limit = 50 } = {}) {
  const [value, setState] = useState(initialValue);
  const currentRef = useRef(initialValue);
  const past = useRef([]);
  const future = useRef([]);

  const setValue = useCallback(
    (next) => {
      setState((current) => {
        const resolved = typeof next === "function" ? next(current) : next;
        if (resolved === current) return current;
        past.current.push(currentRef.current);
        if (past.current.length > limit) past.current.shift();
        future.current = [];
        currentRef.current = resolved;
        return resolved;
      });
    },
    [limit]
  );

  const undo = useCallback(() => {
    const previous = past.current.pop();
    if (previous === undefined) return;
    future.current.push(currentRef.current);
    currentRef.current = previous;
    setState(previous);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(currentRef.current);
    currentRef.current = next;
    setState(next);
  }, []);

  return [
    value,
    setValue,
    {
      undo,
      redo,
      canUndo: past.current.length > 0,
      canRedo: future.current.length > 0,
    },
  ];
}