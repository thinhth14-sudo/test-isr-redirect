import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DestinationPage() {
  const router = useRouter();
  const [fullUrl, setFullUrl] = useState<string>("");

  useEffect(() => {
    // Lấy URL thực tế trên thanh địa chỉ trình duyệt sau khi redirect hoàn tất
    setFullUrl(window.location.href);
  }, [router.asPath]);

  const queryKeys = Object.keys(router.query);

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <header className="space-y-1 border-b border-slate-200 pb-4">
          <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            Redirected Destination Page
          </span>
          <h1 className="text-2xl font-bold">Arrived at /destination</h1>
        </header>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">Browser Full URL:</h2>
          <div className="rounded bg-slate-100 p-3 font-mono text-xs text-slate-800 break-all">
            {fullUrl || "Loading..."}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Parsed Query Params (<code className="rounded bg-slate-100 px-1">router.query</code>):
          </h2>
          <pre className="overflow-x-auto rounded bg-slate-900 p-4 text-xs text-green-400">
            {JSON.stringify(router.query, null, 2)}
          </pre>

          {router.isReady && (
            <p className="text-sm text-slate-600">
              {queryKeys.length === 0 ? (
                <span className="font-semibold text-amber-700">
                  Kết quả: KHÔNG có query param nào được giữ lại!
                </span>
              ) : (
                <span className="font-semibold text-emerald-700">
                  Kết quả: Đang có {queryKeys.length} query param(s): {queryKeys.join(", ")}
                </span>
              )}
            </p>
          )}
        </section>

        <nav className="pt-2">
          <Link
            href="/"
            className="inline-block rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-2 focus:outline-offset-2 focus:outline-slate-800"
          >
            &larr; Back to Home
          </Link>
        </nav>
      </div>
    </main>
  );
}

