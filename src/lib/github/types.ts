export type RepositoryListItem = {
  id: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
};

export type RepositorySearchResult = {
  totalCount: number;
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: RepositoryListItem[];
};

export type RepositoryDetail = {
  id: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  watchers: number;
  forks: number;
  openIssues: number;
};

export type GithubApiError = {
  message: string;
  status: number;
};
