import React from "react";
import { render, screen } from "@testing-library/react";

import { RepositorySearchResult } from "@/components/repository-search-result";

describe("RepositorySearchResult", () => {
  it("renders a search result list and pagination", () => {
    render(
      <RepositorySearchResult
        query="nextjs"
        result={{
          totalCount: 12,
          currentPage: 1,
          perPage: 10,
          hasNextPage: true,
          hasPreviousPage: false,
          items: [
            {
              id: 1,
              name: "awesome-next-app",
              fullName: "octocat/awesome-next-app",
              ownerLogin: "octocat",
              ownerAvatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
              description: "Example repository",
              language: "TypeScript",
              stars: 1200,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText(/12 件見つけました/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /octocat\/awesome-next-app/ }),
    ).toHaveAttribute("href", "/repositories/octocat/awesome-next-app?q=nextjs&page=1");
    expect(screen.getByRole("link", { name: "次のページ" })).toHaveAttribute(
      "href",
      "/?q=nextjs&page=2",
    );
  });

  it("renders empty state when there are no items", () => {
    render(
      <RepositorySearchResult
        query="empty"
        result={{
          totalCount: 0,
          currentPage: 1,
          perPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
          items: [],
        }}
      />,
    );

    expect(
      screen.getByText("検索結果が見つかりませんでした"),
    ).toBeInTheDocument();
  });
});
