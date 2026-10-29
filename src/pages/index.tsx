import Link from 'next/link';

const TEST_CASES = [
  {
    id: 'redirect-plain',
    title: "1. ISR Redirect to '/destination'",
    description:
      "getStaticProps trả về redirect tới '/destination' (không gắn cứng query). Kiểm tra xem '?utm_source=google&foo=bar' trên URL gốc có được giữ lại không.",
    href: '/isr/redirect-plain?utm_source=google&foo=bar',
  },
  {
    id: 'normal-isr',
    title: '3. Normal ISR Page (No Redirect)',
    description:
      'Trang ISR bình thường (revalidate: 10s) để đối chiếu cách hoạt động của getStaticProps và query param.',
    href: '/isr/normal-page?utm_source=newsletter&test=123',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold">
            Next.js Pages Router — ISR Redirect &amp; Query Params Test
          </h1>
          <p className="text-sm text-slate-600">
            Thử nghiệm xem khi{' '}
            <code className="rounded bg-slate-200 px-1">getStaticProps</code>{' '}
            (ISR) trả về{' '}
            <code className="rounded bg-slate-200 px-1">redirect</code>, các
            query parameters trên URL ban đầu có được giữ lại hay không (cả
            Client-side Navigation lẫn Server/Hard Navigation).
          </p>
        </header>

        <section className="space-y-4">
          {TEST_CASES.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sm text-slate-600">{item.description}</p>
              <div className="rounded bg-slate-100 p-2 font-mono text-xs text-slate-700">
                Target URL: {item.href}
              </div>

              <nav
                className="flex flex-wrap gap-3 pt-1"
                aria-label={item.title}
              >
                {/* Dùng next/link để test điều hướng phía client qua _next/data JSON */}
                <Link
                  href={item.href}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
                >
                  Test via next/link (Client Navigation)
                </Link>

                {/* Dùng thẻ <a> thường để ép trình duyệt gửi HTTP request trực tiếp lên server */}
                <a
                  href={item.href}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-2 focus:outline-offset-2 focus:outline-slate-600"
                >
                  Test via &lt;a&gt; tag (Hard / Server Redirect)
                </a>
              </nav>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
