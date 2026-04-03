import { RepositoryDetailView } from "@/components/repository-detail-view";
import { getRepositoryDetail, toPublicError } from "@/lib/github/client";

type RepositoryDetailPageProps = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

function createBackLink(q?: string, page?: string) {
  const query = new URLSearchParams();

  if (q) {
    query.set("q", q);
  }

  if (page) {
    query.set("page", page);
  }

  const search = query.toString();
  return search ? `/?${search}` : "/";
}

export default async function RepositoryDetailPage({
  params,
  searchParams,
}: RepositoryDetailPageProps) {
  const [{ owner, repo }, search] = await Promise.all([params, searchParams]);

  try {
    const repository = await getRepositoryDetail(owner, repo);

    return (
      <RepositoryDetailView
        repository={repository}
        backTo={createBackLink(search.q, search.page)}
      />
    );
  } catch (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-red-900">
            リポジトリ詳細を取得できませんでした
          </h1>
          <p className="mt-3 text-sm text-red-700">{toPublicError(error)}</p>
          <a
            href={createBackLink(search.q, search.page)}
            className="mt-4 inline-flex rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white"
          >
            トップページへ戻る
          </a>
        </div>
      </main>
    );
  }
}
