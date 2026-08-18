import { useCallback, useEffect, useRef, useState } from "react";
import { updatePresentation } from "../services/presentationService";

// Debounced autosave for the editors. The caller passes a `payload` (fresh
// object describing the deck) and a `signature` (cheap stable string that
// changes whenever the deck content changes). Saves fire after `delay` ms of
// inactivity; `saveNow` forces an immediate save (manual Save button / Ctrl+S);
// a pending dirty save is flushed best-effort on unmount.
export function useAutosave({
  id,
  enabled = true,
  payload,
  signature,
  delay = 1800,
  onError,
  onSaved,
}) {
  const [status, setStatus] = useState("idle");
  const timerRef = useRef(null);
  const lastSavedSignatureRef = useRef(null);
  const dirtyRef = useRef(false);
  const payloadRef = useRef(payload);
  const signatureRef = useRef(signature);
  const idRef = useRef(id);
  const enabledRef = useRef(enabled);
  const handlersRef = useRef({ onError, onSaved });
  handlersRef.current = { onError, onSaved };

  payloadRef.current = payload;
  signatureRef.current = signature;
  idRef.current = id;
  enabledRef.current = enabled;

  const doSave = useCallback(async (sig) => {
    if (!idRef.current || !enabledRef.current) return;
    try {
      setStatus("saving");
      await updatePresentation(idRef.current, payloadRef.current);
      lastSavedSignatureRef.current = sig;
      dirtyRef.current = false;
      setStatus("saved");
      handlersRef.current.onSaved?.();
    } catch (err) {
      console.error("Autosave failed:", err);
      setStatus("error");
      handlersRef.current.onError?.(err);
    }
  }, []);

  // Debounced save on signature change (skip the very first run so loading a
  // deck doesn't immediately re-PUT it unchanged).
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      lastSavedSignatureRef.current = signatureRef.current;
      return;
    }
    if (!enabledRef.current || !idRef.current) return;
    if (signatureRef.current === lastSavedSignatureRef.current) return;

    dirtyRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const sig = signatureRef.current;
      doSave(sig);
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [signature, id, enabled, delay, doSave]);

  const saveNow = useCallback(async () => {
    clearTimeout(timerRef.current);
    if (!idRef.current || !enabledRef.current) return;
    await doSave(signatureRef.current);
  }, [doSave]);

  // Best-effort flush of a dirty deck on unmount (navigation away).
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (dirtyRef.current && idRef.current && enabledRef.current) {
        const pending = updatePresentation(idRef.current, payloadRef.current);
        if (pending && typeof pending.catch === "function") {
          pending.catch(() => {});
        }
      }
    };
  }, []);

  return { status, saveNow };
}