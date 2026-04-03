import React from "react";
import Image from "next/image";
import Link from "next/link";

import type { RepositoryDetail } from "@/lib/github/types";
import { formatNumber } from "@/lib/utils/format";

type RepositoryDetailViewProps = {
  repository: RepositoryDetail;
  backTo: string;
};

const stats = [
  { label: "Star数", key: "stars" },
  { label: "Watcher数", key: "watchers" },
  { label: "Fork数", key: "forks" },
  { label: "Issue数", key: "openIssues" },
] as const;

export function RepositoryDetailView({
  repository,
  backTo,
}: RepositoryDetailViewProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
      <div className="mb-8">
        <Link
          href={backTo}
          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
        >
          トップページへ戻る
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Image
            src={repository.ownerAvatarUrl}
            alt={`${repository.ownerLogin} のアバター`}
            width={96}
            height={96}
            className="rounded-full border border-slate-200"
          />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              {repository.ownerLogin}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {repository.name}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              {repository.description ?? "説明は設定されていません。"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                言語: {repository.language ?? "未設定"}
              </span>
              <a
                href={repository.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-700 hover:underline"
              >
                GitHubで開く
              </a>
            </div>
          </div>
        </div>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <dt className="text-sm text-slate-500">{stat.label}</dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-900">
                {formatNumber(repository[stat.key])}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
