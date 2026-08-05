/**
 * Single-value cache with stale-while-revalidate semantics.
 *
 * The dog points aggregation reads whole collections across a high-latency
 * link, so recomputing it per request costs tens of seconds. Once a value is
 * cached only the very first caller waits: a stale value is served immediately
 * while a refresh runs in the background.
 */
export class RefreshingCache<T> {
  private cached?: { value: T; freshUntil: number };
  private refresh?: Promise<T>;

  constructor(
    private readonly loader: () => Promise<T>,
    private readonly ttlMs: number
  ) {}

  async get(): Promise<T> {
    if (this.cached) {
      // Stale values are still worth serving; the refresh lands for the next caller.
      if (Date.now() >= this.cached.freshUntil) void this.startRefresh();
      return this.cached.value;
    }
    return this.startRefresh();
  }

  /** Drops the cached value so the next read recomputes. Call after writes. */
  invalidate(): void {
    this.cached = undefined;
  }

  private startRefresh(): Promise<T> {
    if (this.refresh) return this.refresh;

    const run = this.loader()
      .then((value) => {
        this.cached = { value, freshUntil: Date.now() + this.ttlMs };
        return value;
      })
      .finally(() => {
        this.refresh = undefined;
      });

    this.refresh = run;
    // A failed background refresh must not become an unhandled rejection. The
    // caller that triggered a cold load still sees the error via `run`.
    run.catch(() => undefined);
    return run;
  }
}
