import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-10">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          ページが見つかりません
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          指定されたリポジトリは存在しないか、公開されていない可能性があります。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
