/**
 * 単一プロセス内のインメモリレート制限。
 * 本番で複数インスタンスを水平展開する場合は Redis 等の共有ストアへ差し替えを想定。
 */

export class RateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Too many requests");
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/** テストでバケットを空にするためのフック（本番コードからは呼ばない） */
export function resetRateLimitBucketsForTests() {
  buckets.clear();
}

function pruneExpired(now: number) {
  if (buckets.size < 10_000) {
    return;
  }
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function getGithubApiRateLimitConfig() {
  const windowMs = parsePositiveInt(
    process.env.GITHUB_API_RATE_LIMIT_WINDOW_MS,
    60_000,
  );
  const max = parsePositiveInt(process.env.GITHUB_API_RATE_LIMIT_MAX, 60);
  return { windowMs, max };
}

export function assertWithinRateLimit(clientKey: string): void {
  const { windowMs, max } = getGithubApiRateLimitConfig();
  const now = Date.now();
  pruneExpired(now);

  let bucket = buckets.get(clientKey);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(clientKey, bucket);
  }

  bucket.count += 1;
  if (bucket.count > max) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000),
    );
    throw new RateLimitError(retryAfterSeconds);
  }
}

export function getClientKeyFromHeaders(
  getHeader: (name: string) => string | null,
): string {
  const forwarded = getHeader("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = getHeader("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}
