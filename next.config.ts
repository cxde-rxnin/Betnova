import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://embed.tawk.to https://*.tawk.to; style-src 'self' 'unsafe-inline' https://embed.tawk.to https://*.tawk.to; img-src 'self' blob: data: https://images.unsplash.com https://ui-avatars.com https://www.thesportsdb.com https://r2.thesportsdb.com https://cdn.jsdelivr.net https://cryptologos.cc https://raw.githubusercontent.com https://res.cloudinary.com https://*.tawk.to; font-src 'self' https://*.tawk.to; connect-src 'self' https://*.tawk.to wss://*.tawk.to; frame-src https://*.tawk.to; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "**.thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
