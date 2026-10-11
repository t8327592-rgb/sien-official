type Save = () => Promise<void>;

// Debounce per record and serialize writes so older requests cannot overwrite
// newer edits. Editing another record never cancels the first record's save.
export class SaveQueue {
  private pending = new Map<string, { timer: ReturnType<typeof setTimeout>; save: Save }>();
  private chain: Promise<void> = Promise.resolve();
  constructor(private onError: (error: unknown) => void, private delay = 800) {}
  enqueue(key: string, save: Save) {
    const previous = this.pending.get(key);
    if (previous) clearTimeout(previous.timer);
    const timer = setTimeout(() => this.dispatch(key), this.delay);
    this.pending.set(key, { timer, save });
  }
  private dispatch(key: string) {
    const entry = this.pending.get(key);
    if (!entry) return;
    clearTimeout(entry.timer);
    this.pending.delete(key);
    this.chain = this.chain.then(entry.save).catch(this.onError);
  }
  flush() {
    for (const key of this.pending.keys()) this.dispatch(key);
    return this.chain;
  }
}
