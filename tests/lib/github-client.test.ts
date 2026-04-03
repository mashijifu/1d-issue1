import {
  getRepositoryDetail,
  searchRepositories,
  toPublicError,
  GithubClientError,
  GithubValidationError,
} from "@/lib/github/client";

describe("github client", () => {
  it("searchRepositories returns normalized search result", async () => {
    const result = await searchRepositories({ q: "nextjs", page: 1, perPage: 10 });

    expect(result.totalCount).toBe(12);
    expect(result.currentPage).toBe(1);
    expect(result.hasNextPage).toBe(true);
    expect(result.items[0]).toMatchObject({
      id: 1,
      name: "awesome-next-app",
      fullName: "octocat/awesome-next-app",
      ownerLogin: "octocat",
      language: "TypeScript",
      stars: 1200,
    });
  });

  it("searchRepositories returns an empty state payload", async () => {
    const result = await searchRepositories({ q: "empty", page: 1, perPage: 10 });

    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(result.hasNextPage).toBe(false);
  });

  it("getRepositoryDetail returns normalized detail payload", async () => {
    const detail = await getRepositoryDetail("octocat", "awesome-next-app");

    expect(detail).toMatchObject({
      fullName: "octocat/awesome-next-app",
      ownerLogin: "octocat",
      watchers: 200,
      forks: 30,
      openIssues: 10,
    });
  });

  it("getRepositoryDetail rejects unsafe or invalid owner/repo path segments", async () => {
    await expect(getRepositoryDetail("../evil", "repo")).rejects.toBeInstanceOf(
      GithubValidationError,
    );
    await expect(
      getRepositoryDetail("octocat", "bad/repo"),
    ).rejects.toBeInstanceOf(GithubValidationError);
  });

  it("searchRepositories rejects overly long query strings", async () => {
    await expect(
      searchRepositories({ q: "a".repeat(257), page: 1, perPage: 10 }),
    ).rejects.toThrow();
  });

  it("toPublicError does not expose raw GitHub error bodies for generic failures", () => {
    const message = toPublicError(
      new GithubClientError({
        status: 500,
        message: "Internal server error: secret-token-hint",
      }),
    );
    expect(message).not.toContain("secret-token-hint");
    expect(message).toContain("GitHub API");
  });

  it("toPublicError maps GitHub rate limit errors", async () => {
    await expect(searchRepositories({ q: "rate-limit", page: 1, perPage: 10 })).rejects.toThrow();

    try {
      await searchRepositories({ q: "rate-limit", page: 1, perPage: 10 });
    } catch (error) {
      expect(toPublicError(error)).toContain("レート制限");
    }
  });
});
