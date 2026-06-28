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
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${pbOrigin}; font-src 'self'; connect-src 'self' ${pbOrigin} https://*.pocketbase.io;`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
