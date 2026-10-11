"use client";

import { useState, type FormEvent } from "react";

export function useFormAccessibility() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  function onInvalidCapture(event: FormEvent<HTMLFormElement>) {
    const field = event.target;
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      setErrors(previous => ({ ...previous, [field.id]: field.validationMessage }));
    }
  }
  // Use React's change event so validation and controlled values update in one batch.
  // A native input event can precede a select's change event and restore its old value.
  function onChangeCapture(event: FormEvent<HTMLFormElement>) {
    const field = event.target;
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      if (field.validity.valid) setErrors(previous => {
        if (!Object.hasOwn(previous, field.id)) return previous;
        const next = { ...previous };
        delete next[field.id];
        return next;
      });
    }
  }
  function field(id: string) {
    return { "aria-invalid": !!errors[id], "aria-describedby": errors[id] ? `${id}-error` : undefined };
  }
  function message(id: string) {
    return errors[id] ? <span id={`${id}-error`} className="block text-sm text-red-800" role="alert">{errors[id]}</span> : null;
  }
  return { onInvalidCapture, onChangeCapture, field, message };
}
