import { NextResponse } from "next/server";

import {
  getRepositoryDetail,
  toPublicError,
  GithubClientError,
  GithubValidationError,
} from "@/lib/github/client";
import { runWithGithubApiRateLimit } from "@/lib/security/with-github-api-rate-limit";

type RouteContext = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  return runWithGithubApiRateLimit(request, async () => {
    const { owner, repo } = await context.params;

    try {
      const result = await getRepositoryDetail(owner, repo);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof GithubValidationError) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      if (error instanceof GithubClientError) {
        const status =
          error.status >= 400 && error.status < 600 ? error.status : 500;
        return NextResponse.json(
          { message: toPublicError(error) },
          { status },
        );
      }

      return NextResponse.json(
        { message: toPublicError(error) },
        { status: 500 },
      );
    }
  });
}
