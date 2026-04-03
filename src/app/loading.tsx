export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-10 w-72 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-slate-200" />
        <div className="mt-8 h-12 w-full max-w-md rounded bg-slate-200" />
      </div>
    </main>
  );
}
