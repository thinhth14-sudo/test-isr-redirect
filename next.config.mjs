import fs from "node:fs";
import path from "node:path";

// Quét tự động toàn bộ thư mục src/pages để lấy danh sách các dynamic routes (có chứa [param])
// Giúp middleware hoạt động cho mọi route động mà không cần hardcode '/isr' và không làm 404 các trang tĩnh như '/destination'
function getDynamicRouteRegexes(dir, baseRoute = "") {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const regexes = [];

  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name === "api") continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      regexes.push(...getDynamicRouteRegexes(fullPath, `${baseRoute}/${entry.name}`));
      continue;
    }

    if (!/\.(tsx|ts|jsx|js)$/.test(entry.name)) continue;
    const routeSegment = entry.name.replace(/\.(tsx|ts|jsx|js)$/, "");
    const fullRoute = routeSegment === "index" ? baseRoute || "/" : `${baseRoute}/${routeSegment}`;

    if (fullRoute.includes("[")) {
      // Chuyển đổi pattern kiểu '/isr/[slug]' thành regex '^/isr/[^/]+$'
      const pattern =
        "^" +
        fullRoute
          .replace(/\[\[\.\.\.[^\]]+\]\]/g, ".*")
          .replace(/\[\.\.\.[^\]]+\]/g, ".+")
          .replace(/\[[^\]]+\]/g, "[^/]+") +
        "$";
      regexes.push(pattern);
    }
  }
  return regexes;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DYNAMIC_ROUTE_PATTERNS: JSON.stringify(
      getDynamicRouteRegexes(path.join(process.cwd(), "src/pages"))
    ),
  },
};

export default nextConfig;


