import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { QS_DELIMITER } from '@/lib/with-isr-query-redirect';

const DYNAMIC_PATTERNS: RegExp[] = JSON.parse(
  process.env.DYNAMIC_ROUTE_PATTERNS ?? '[]',
).map((pattern: string) => new RegExp(pattern));

// Chuẩn hoá pathname từ cả truy cập trực tiếp lẫn '/_next/data/<buildId>/...json' để kiểm tra dynamic route
function normalizeLogicalPathname(pathname: string): string {
  if (pathname.startsWith('/_next/data/') && pathname.endsWith('.json')) {
    const withoutPrefix = pathname.replace(/^\/_next\/data\/[^/]+/, '');
    return withoutPrefix.replace(/\.json$/, '') || '/';
  }
  return pathname;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!searchParams.toString() || pathname.includes(QS_DELIMITER)) {
    return NextResponse.next();
  }

  const logicalPathname = normalizeLogicalPathname(pathname);
  const isDynamicRoute = DYNAMIC_PATTERNS.some((regex) =>
    regex.test(logicalPathname),
  );

  // Chỉ rewrite các route động có sử dụng [param] để không làm 404 các trang tĩnh (như /destination)
  if (!isDynamicRoute) {
    return NextResponse.next();
  }

  const cleanParams = new URLSearchParams(searchParams);
  // Loại bỏ các route param bị Next.js tự động gắn thêm vào query khi gọi /_next/data
  if (pathname.startsWith('/_next/data/')) {
    const lastSegment = logicalPathname.split('/').filter(Boolean).pop();
    for (const [key, val] of Array.from(cleanParams.entries())) {
      if (val === lastSegment) {
        cleanParams.delete(key);
      }
    }
  }

  const encodedQs = encodeURIComponent(cleanParams.toString());
  if (!encodedQs) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  if (pathname.endsWith('.json')) {
    rewriteUrl.pathname = pathname.replace(
      /\.json$/,
      `${QS_DELIMITER}${encodedQs}.json`,
    );
  } else {
    rewriteUrl.pathname = `${pathname}${QS_DELIMITER}${encodedQs}`;
  }

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
