import React from "react";

type SearchFormProps = {
  defaultValue: string;
};

export function SearchForm({ defaultValue }: SearchFormProps) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action="/" method="get">
      <label className="sr-only" htmlFor="repository-keyword">
        リポジトリ検索キーワード
      </label>
      <input
        id="repository-keyword"
        name="q"
        type="search"
        placeholder="リポジトリ名を入力してください"
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:max-w-md"
      />
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        検索
      </button>
    </form>
  );
}
