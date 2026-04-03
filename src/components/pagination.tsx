import React from "react";
import Link from "next/link";

type PaginationProps = {
  query: string;
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function createHref(query: string, page: number) {
  return {
    pathname: "/",
    query: {
      q: query,
      page: String(page),
    },
  };
}

export function Pagination({
  query,
  currentPage,
  hasPreviousPage,
  hasNextPage,
}: PaginationProps) {
  return (
    <nav
      aria-label="検索結果のページネーション"
      className="mt-8 flex items-center justify-between gap-4"
    >
      {hasPreviousPage ? (
        <Link
          href={createHref(query, currentPage - 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          前のページ
        </Link>
      ) : (
        <span className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-400">
          前のページ
        </span>
      )}
      <span className="text-sm text-slate-600">Page {currentPage}</span>
      {hasNextPage ? (
        <Link
          href={createHref(query, currentPage + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          次のページ
        </Link>
      ) : (
        <span className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-400">
          次のページ
        </span>
      )}
    </nav>
  );
}
