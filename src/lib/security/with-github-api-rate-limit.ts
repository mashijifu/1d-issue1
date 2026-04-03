import { NextResponse } from "next/server";

import { toPublicError } from "@/lib/github/client";
import {
  assertWithinRateLimit,
  getClientKeyFromHeaders,
  RateLimitError,
} from "@/lib/security/rate-limit";

export function runWithGithubApiRateLimit(
  request: Request,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    assertWithinRateLimit(
      getClientKeyFromHeaders((name) => request.headers.get(name)),
    );
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Promise.resolve(
        NextResponse.json(
          { message: toPublicError(error) },
          {
            status: 429,
            headers: {
              "Retry-After": String(error.retryAfterSeconds),
            },
          },
        ),
      );
    }
    throw error;
  }

  return handler();
}
