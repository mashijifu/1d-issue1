import { afterEach, describe, expect, it } from "vitest";

import {
  assertWithinRateLimit,
  RateLimitError,
  resetRateLimitBucketsForTests,
} from "@/lib/security/rate-limit";

describe("rate limit", () => {
  afterEach(() => {
    resetRateLimitBucketsForTests();
    delete process.env.GITHUB_API_RATE_LIMIT_MAX;
    delete process.env.GITHUB_API_RATE_LIMIT_WINDOW_MS;
  });

  it("allows requests up to the configured limit", () => {
    process.env.GITHUB_API_RATE_LIMIT_MAX = "3";
    process.env.GITHUB_API_RATE_LIMIT_WINDOW_MS = "60000";

    assertWithinRateLimit("client-a");
    assertWithinRateLimit("client-a");
    assertWithinRateLimit("client-a");
  });

  it("throws RateLimitError when the limit is exceeded", () => {
    process.env.GITHUB_API_RATE_LIMIT_MAX = "2";
    process.env.GITHUB_API_RATE_LIMIT_WINDOW_MS = "60000";

    assertWithinRateLimit("client-b");
    assertWithinRateLimit("client-b");
    expect(() => assertWithinRateLimit("client-b")).toThrow(RateLimitError);
  });
});
