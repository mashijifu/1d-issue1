import { RepositorySearchResult } from "@/components/repository-search-result";
import { SearchForm } from "@/components/search-form";
import { searchRepositories, toPublicError } from "@/lib/github/client";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Number(params.page ?? "1");

  let content = (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        キーワードを入力して検索を開始してください
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        GitHub APIを利用してリポジトリ一覧と詳細情報を確認できます。
      </p>
    </section>
  );

  if (query) {
    try {
      const result = await searchRepositories({
        q: query,
        page: Number.isNaN(page) ? 1 : page,
        perPage: 10,
      });

      content = <RepositorySearchResult query={query} result={result} />;
    } catch (error) {
      content = (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">
            検索結果を取得できませんでした
          </h2>
          <p className="mt-2 text-sm text-red-700">{toPublicError(error)}</p>
        </section>
      );
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          GitHub Repository Search
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
          GitHubのリポジトリを検索する
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          キーワードを入力すると、GitHub上の公開リポジトリを検索し、一覧と詳細ページを確認できます。
        </p>
        <div className="mt-8">
          <SearchForm defaultValue={query} />
        </div>
      </section>

      <div className="mt-8">{content}</div>
    </main>
  );
}
