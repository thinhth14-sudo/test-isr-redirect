import type { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { withIsrQueryRedirect } from '@/lib/with-isr-query-redirect';

interface IsrPageProps {
  slug: string;
  generatedAt: string;
}

export default function IsrSlugPage({ slug, generatedAt }: IsrPageProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-bold">Normal ISR Page: {slug}</h1>
        <p className="text-sm text-slate-600">
          Generated at (ISR revalidate = 10s):{' '}
          <span className="font-mono font-semibold text-slate-800">
            {generatedAt}
          </span>
        </p>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Current{' '}
            <code className="rounded bg-slate-100 px-1">router.query</code>:
          </h2>
          <pre className="overflow-x-auto rounded bg-slate-900 p-4 text-xs text-green-400">
            {JSON.stringify(router.query, null, 2)}
          </pre>
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

export const getStaticPaths: GetStaticPaths = async () => {
  // Khởi tạo rỗng và dùng fallback: 'blocking' để kiểm tra hành vi ISR ngay ở lần request đầu tiên và các lần revalidate sau
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = withIsrQueryRedirect<IsrPageProps>(async (context) => {
  const slug = String(context.params?.slug ?? '');

  // Lưu ý: getStaticProps không có quyền truy cập vào query parameters của request vì chạy ở tầng static/ISR
  if (slug === 'redirect-plain') {
    return {
      redirect: {
        destination: '/destination',
        permanent: false,
      },
      revalidate: 10,
    };
  }

  return {
    props: {
      slug,
      generatedAt: new Date().toISOString(),
    },
    revalidate: 10,
  };
});
