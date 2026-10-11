"use client";
import { useCallback, useSyncExternalStore } from "react";

function subscribe(callback: () => void) { const timer = setInterval(callback, 1000); return () => clearInterval(timer); }
export function useRetryCountdown(until: number) {
  const snapshot = useCallback(() => Math.max(0, Math.ceil((until - Date.now()) / 1000)), [until]);
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
