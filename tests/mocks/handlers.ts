import { http, HttpResponse } from "msw";

const githubApiBaseUrl = "https://api.github.com";

export const handlers = [
  http.get(`${githubApiBaseUrl}/search/repositories`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (query === "empty") {
      return HttpResponse.json({
        total_count: 0,
        incomplete_results: false,
        items: [],
      });
    }

    if (query === "rate-limit") {
      return HttpResponse.json(
        {
          message: "API rate limit exceeded",
        },
        { status: 403 },
      );
    }

    return HttpResponse.json({
      total_count: 12,
      incomplete_results: false,
      items: [
        {
          id: 1,
          name: "awesome-next-app",
          full_name: "octocat/awesome-next-app",
          html_url: "https://github.com/octocat/awesome-next-app",
          description: "Example repository",
          stargazers_count: 1200,
          watchers_count: 1200,
          forks_count: 320,
          open_issues_count: 12,
          language: "TypeScript",
          owner: {
            login: "octocat",
            avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
          },
        },
      ],
    });
  }),
  http.get(`${githubApiBaseUrl}/repos/:owner/:repo`, ({ params }) => {
    if (params.repo === "missing") {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return HttpResponse.json({
      id: 1,
      name: params.repo,
      full_name: `${params.owner}/${params.repo}`,
      html_url: `https://github.com/${params.owner}/${params.repo}`,
      description: "Repository detail description",
      stargazers_count: 1200,
      watchers_count: 200,
      forks_count: 30,
      open_issues_count: 10,
      language: "TypeScript",
      owner: {
        login: params.owner,
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
      },
    });
  }),
];
