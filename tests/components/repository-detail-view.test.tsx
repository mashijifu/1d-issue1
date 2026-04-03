import React from "react";
import { render, screen } from "@testing-library/react";

import { RepositoryDetailView } from "@/components/repository-detail-view";

describe("RepositoryDetailView", () => {
  it("renders repository details and stats", () => {
    render(
      <RepositoryDetailView
        backTo="/?q=nextjs&page=1"
        repository={{
          id: 1,
          name: "awesome-next-app",
          fullName: "octocat/awesome-next-app",
          ownerLogin: "octocat",
          ownerAvatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
          htmlUrl: "https://github.com/octocat/awesome-next-app",
          description: "Repository detail description",
          language: "TypeScript",
          stars: 1200,
          watchers: 200,
          forks: 30,
          openIssues: 10,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "awesome-next-app" }),
    ).toBeInTheDocument();
    expect(screen.getByText("言語: TypeScript")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "トップページへ戻る" }),
    ).toHaveAttribute("href", "/?q=nextjs&page=1");
  });
});
