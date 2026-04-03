import React from "react";
import { Pagination } from "@/components/pagination";
import { RepositoryCard } from "@/components/repository-card";
import type { RepositorySearchResult } from "@/lib/github/types";
import { formatNumber } from "@/lib/utils/format";

type RepositorySearchResultProps = {
  query: string;
  result: RepositorySearchResult;
};

export function RepositorySearchResult({
  query,
  result,
}: RepositorySearchResultProps) {
  if (result.items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          検索結果が見つかりませんでした
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          キーワードを変更してもう一度お試しください。
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">検索結果</h2>
          <p className="text-sm text-slate-600">
            {`"${query}"`} に一致するリポジトリを {formatNumber(result.totalCount)} 件見つけました。
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {result.items.map((repository) => (
          <RepositoryCard
            key={repository.id}
            repository={repository}
            currentQuery={query}
            currentPage={result.currentPage}
          />
        ))}
      </ul>

      <Pagination
        query={query}
        currentPage={result.currentPage}
        hasPreviousPage={result.hasPreviousPage}
        hasNextPage={result.hasNextPage}
      />
    </section>
  );
}
