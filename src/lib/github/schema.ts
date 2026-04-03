import { z } from "zod";

/** GitHub ログイン名に近い制約（パストラバーサルや余分なセグメントを防ぐ） */
export const githubOwnerParamSchema = z
  .string()
  .min(1)
  .max(39)
  .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9]))*$/);

/** リポジトリ名（API パス用。記号は GitHub が許容する範囲に限定） */
export const githubRepoParamSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9._-]+$/);

export const repositoryOwnerSchema = z.object({
  login: z.string(),
  avatar_url: z.string().url(),
});

export const githubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  html_url: z.string().url(),
  description: z.string().nullable(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  language: z.string().nullable(),
  owner: repositoryOwnerSchema,
});

export const githubSearchResponseSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(githubRepositorySchema),
});

export const searchRepositoriesParamsSchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "検索キーワードを入力してください。")
    .max(256, "検索キーワードは256文字以内にしてください。"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(30).default(10),
});

export type GithubRepository = z.infer<typeof githubRepositorySchema>;
export type GithubSearchResponse = z.infer<typeof githubSearchResponseSchema>;
export type SearchRepositoriesParams = z.infer<
  typeof searchRepositoriesParamsSchema
>;
