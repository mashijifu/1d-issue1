import {
  githubRepositorySchema,
  githubSearchResponseSchema,
  searchRepositoriesParamsSchema,
} from "@/lib/github/schema";
import type {
  GithubApiError,
  RepositoryDetail,
  RepositorySearchResult,
} from "@/lib/github/types";

const GITHUB_API_BASE_URL = "https://api.github.com";

class GithubClientError extends Error {
  status: number;

  constructor({ message, status }: GithubApiError) {
    super(message);
    this.name = "GithubClientError";
    this.status = status;
  }
}

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
  return schema.parse(json);
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
  const response = await requestGitHub(
    `/repos/${owner}/${repo}`,
    githubRepositorySchema,
  );

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

export function toPublicError(error: unknown) {
  if (error instanceof GithubClientError) {
    if (error.status === 403) {
      return "GitHub APIのレート制限に達した可能性があります。しばらく待ってから再度お試しください。";
    }

    if (error.status === 404) {
      return "対象のリポジトリは見つかりませんでした。";
    }

    return error.message;
  }

  return "予期しないエラーが発生しました。";
}
