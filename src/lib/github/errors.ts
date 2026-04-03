import type { GithubApiError } from "@/lib/github/types";

export class GithubClientError extends Error {
  readonly status: number;

  constructor({ message, status }: GithubApiError) {
    super(message);
    this.name = "GithubClientError";
    this.status = status;
  }
}

/** ユーザー入力（owner/repo 等）が API に渡せない形式のとき */
export class GithubValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GithubValidationError";
  }
}
