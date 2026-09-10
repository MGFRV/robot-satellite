import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Vercel creates its own serverless output during onBuildComplete. Forcing
  // standalone there makes the adapter look for a trace file Next 16 no longer
  // emits in that mode. Keep standalone only for the existing VPS deployment.
  output: process.env.VERCEL ? undefined : 'standalone',
  poweredByHeader: false,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
      },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    }];
  },
};

export default nextConfig;
