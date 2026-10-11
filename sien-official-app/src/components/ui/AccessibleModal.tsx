"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function AccessibleModal({ children, label, onClose }: { children: ReactNode; label: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element?.showModal();
    return () => { element?.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={dialog} aria-label={label} onCancel={event => { event.preventDefault(); onClose(); }} className="fixed inset-0 m-0 h-dvh w-screen max-h-none max-w-none border-0 bg-black/50 p-4 backdrop:bg-transparent open:flex open:items-center open:justify-center">{children}</dialog>;
}
