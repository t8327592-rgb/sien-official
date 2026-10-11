"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const TTL = 2 * 60 * 60 * 1000;
const EVENT = "sien-form-draft";

function matchesShape(value: unknown, template: unknown): boolean {
  if (Array.isArray(template)) return Array.isArray(value) && value.length <= 100 && value.every(item => typeof item === "string");
  if (template && typeof template === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const entries = Object.entries(template);
    if (!entries.length) return Object.values(value).every(item => typeof item === "number" && Number.isFinite(item) && item >= 0 && item <= 3600);
    const record = value as Record<string, unknown>;
    return Object.keys(record).every(key => Object.hasOwn(template, key)) && entries.every(([key, item]) => matchesShape(record[key], item));
  }
  return typeof value === typeof template && (typeof value !== "string" || value.length <= 5000);
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", callback); };
}

export function useFormDraft<T extends object>(scope: string, value: T, dirty: boolean, enabled = true) {
  const key = `sien-draft-v1-${scope}`;
  const serialized = JSON.stringify(value);
  const getSnapshot = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw || raw.length > 32000) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now() ? raw : null;
    } catch { return null; }
  }, [key]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  useEffect(() => {
    if (!enabled || !dirty) return;
    try { sessionStorage.setItem(key, JSON.stringify({ expiresAt: Date.now() + TTL, value: JSON.parse(serialized) })); window.dispatchEvent(new Event(EVENT)); } catch { /* Storage can be disabled by the browser. The form remains usable. */ }
  }, [key, serialized, dirty, enabled]);
  useEffect(() => {
    try { if (sessionStorage.getItem(key) && !getSnapshot()) sessionStorage.removeItem(key); } catch { /* Browser storage can be unavailable. */ }
    const timer = setTimeout(() => {
      try { if (!getSnapshot()) sessionStorage.removeItem(key); } catch { /* Browser storage can be unavailable. */ }
      window.dispatchEvent(new Event(EVENT));
    }, TTL);
    return () => clearTimeout(timer);
  }, [snapshot, key, getSnapshot]);
  const clear = useCallback(() => {
    try { sessionStorage.removeItem(key); window.dispatchEvent(new Event(EVENT)); } catch { /* No persistent draft exists when storage is unavailable. */ }
  }, [key]);
  useEffect(() => { if (!enabled) clear(); }, [enabled, clear]);
  const restore = (): T | null => {
    if (!snapshot) return null;
    try { const saved: unknown = JSON.parse(snapshot).value; return matchesShape(saved, value) ? saved as T : null; } catch { return null; }
  };
  return { available: !!snapshot && !dirty, restore, clear };
}
