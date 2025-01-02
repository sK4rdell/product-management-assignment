const FIVE_MINUTES_MS = 5 * 60 * 1000;

type CacheModeTypes = "server" | "script";

let cacheMode: CacheModeTypes = "server";

export const setCacheMode = (mode: CacheModeTypes): void => {
  cacheMode = mode;
};

export class MemCache<T> {
  private timeoutCache: Map<string, NodeJS.Timeout>;
  private cache: Map<string, T>;
  private defaultTTL: number;

  constructor(ttl = FIVE_MINUTES_MS) {
    this.cache = new Map();
    this.timeoutCache = new Map();
    this.defaultTTL = ttl;
  }

  public get(key: string): T | undefined {
    return this.cache.get(key);
  }

  private clearTimeout(key: string): void {
    const t = this.timeoutCache.get(key);
    if (t) {
      clearTimeout(t);
    }
  }

  public drop(key: string): void {
    this.cache.delete(key);
    this.clearTimeout(key);
    this.timeoutCache.delete(key);
  }

  public put(key: string, value: T, ttl_ms?: number): void {
    this.cache.set(key, value);
    if (cacheMode === "script") {
      return;
    }
    this.clearTimeout(key);
    this.timeoutCache.set(
      key,
      setTimeout(() => this.drop(key), ttl_ms ?? this.defaultTTL)
    );
  }
}
