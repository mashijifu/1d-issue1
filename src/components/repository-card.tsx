import React from "react";
import Image from "next/image";
import Link from "next/link";

import type { RepositoryListItem } from "@/lib/github/types";
import { formatNumber } from "@/lib/utils/format";

type RepositoryCardProps = {
  repository: RepositoryListItem;
  currentQuery: string;
  currentPage: number;
};

export function RepositoryCard({
  repository,
  currentQuery,
  currentPage,
}: RepositoryCardProps) {
  const detailHref = {
    pathname: `/repositories/${repository.ownerLogin}/${repository.name}`,
    query: { q: currentQuery, page: currentPage.toString() },
  };

  return (
    <li>
      <Link
        href={detailHref}
        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <div className="flex items-start gap-4">
          <Image
            src={repository.ownerAvatarUrl}
            alt={`${repository.ownerLogin} のアバター`}
            width={56}
            height={56}
            className="rounded-full border border-slate-200"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {repository.fullName}
              </h2>
              {repository.language ? (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {repository.language}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {repository.description ?? "説明は設定されていません。"}
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Star数: {formatNumber(repository.stars)}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
