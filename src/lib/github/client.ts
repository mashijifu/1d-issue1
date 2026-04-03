import { ZodError } from "zod";

import { GithubClientError, GithubValidationError } from "@/lib/github/errors";
import {
  githubRepoParamSchema,
  githubOwnerParamSchema,
  githubRepositorySchema,
  githubSearchResponseSchema,
  searchRepositoriesParamsSchema,
} from "@/lib/github/schema";
import type { RepositoryDetail, RepositorySearchResult } from "@/lib/github/types";
import { RateLimitError } from "@/lib/security/rate-limit";

const GITHUB_API_BASE_URL = "https://api.github.com";

export { GithubClientError, GithubValidationError } from "@/lib/github/errors";

function createHeaders() {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  });

  if (process.env.GITHUB_TOKEN) {
    headers.set("Authorization", `Bearer ${process.env.GITHUB_TOKEN}`);
  }

  return headers;
}

async function requestGitHub<T>(
  path: string,
  schema: { parse: (value: unknown) => T },
): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: createHeaders(),
    next: { revalidate: 0 },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new GithubClientError({
      status: response.status,
      message:
        errorPayload?.message ??
        "GitHub APIとの通信に失敗しました。時間をおいて再度お試しください。",
    });
  }

  const json = (await response.json()) as unknown;
  try {
    return schema.parse(json);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GithubClientError({
        status: 502,
        message: "GitHub APIの応答形式が想定と異なりました。",
      });
    }
    throw error;
  }
}

export async function searchRepositories(
  params: Partial<{
    q: string;
    page: number;
    perPage: number;
  }>,
): Promise<RepositorySearchResult> {
  const parsed = searchRepositoriesParamsSchema.parse(params);
  const searchParams = new URLSearchParams({
    q: parsed.q,
    page: String(parsed.page),
    per_page: String(parsed.perPage),
  });

  const response = await requestGitHub(
    `/search/repositories?${searchParams.toString()}`,
    githubSearchResponseSchema,
  );

  return {
    totalCount: response.total_count,
    currentPage: parsed.page,
    perPage: parsed.perPage,
    hasNextPage: parsed.page * parsed.perPage < response.total_count,
    hasPreviousPage: parsed.page > 1,
    items: response.items.map((item) => ({
      id: item.id,
      name: item.name,
      fullName: item.full_name,
      ownerLogin: item.owner.login,
      ownerAvatarUrl: item.owner.avatar_url,
      description: item.description,
      language: item.language,
      stars: item.stargazers_count,
    })),
  };
}

export async function getRepositoryDetail(
  owner: string,
  repo: string,
): Promise<RepositoryDetail> {
  const ownerResult = githubOwnerParamSchema.safeParse(owner);
  const repoResult = githubRepoParamSchema.safeParse(repo);

  if (!ownerResult.success || !repoResult.success) {
    throw new GithubValidationError(
      "オーナー名またはリポジトリ名の形式が不正です。",
    );
  }

  const ownerSlug = ownerResult.data;
  const repoSlug = repoResult.data;
  const path = `/repos/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(repoSlug)}`;

  const response = await requestGitHub(path, githubRepositorySchema);

  return {
    id: response.id,
    name: response.name,
    fullName: response.full_name,
    ownerLogin: response.owner.login,
    ownerAvatarUrl: response.owner.avatar_url,
    htmlUrl: response.html_url,
    description: response.description,
    language: response.language,
    stars: response.stargazers_count,
    watchers: response.watchers_count,
    forks: response.forks_count,
    openIssues: response.open_issues_count,
  };
}

/**
 * ユーザー向けメッセージ。GitHub API の生メッセージは漏らさない（情報推測・フィッシング対策）。
 */
export function toPublicError(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "入力値が不正です。";
  }

  if (error instanceof GithubValidationError) {
    return error.message;
  }

  if (error instanceof RateLimitError) {
    return "リクエストが多すぎます。しばらく時間をおいて再度お試しください。";
  }

  if (error instanceof GithubClientError) {
    if (error.status === 403) {
      return "GitHub APIのレート制限に達した可能性があります。しばらく待ってから再度お試しください。";
    }

    if (error.status === 404) {
      return "対象のリポジトリは見つかりませんでした。";
    }

    return "GitHub APIとの通信に失敗しました。時間をおいて再度お試しください。";
  }

  return "予期しないエラーが発生しました。";
}
