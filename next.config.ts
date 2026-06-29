import type { NextConfig } from "next";

const getPocketBaseOrigin = () => {
  try {
    const url = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";
    return new URL(url).origin;
  } catch {
    return "http://127.0.0.1:8090";
  }
};

const pbOrigin = getPocketBaseOrigin();

const nextConfig: NextConfig = {
  // Disable the X-Powered-By header to prevent technology fingerprinting
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: pbOrigin.startsWith("https") ? "https" : "http",
        hostname: pbOrigin.replace(/^https?:\/\//, "").split(":")[0],
        port: pbOrigin.split(":")[2] || "",
        pathname: "/api/files/**",
      },
    ],
  },
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      // 'unsafe-inline' required for Next.js hydration; 'unsafe-eval' only in dev (React debugging)
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${pbOrigin}`,
      "font-src 'self'",
      `connect-src 'self' ${pbOrigin} https://*.pocketbase.io`,
      // Explicit directives to close fallback gaps flagged by ZAP
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ];

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
