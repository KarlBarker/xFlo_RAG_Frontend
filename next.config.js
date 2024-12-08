/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'http://localhost:8000/storage/:path*'
      },
      {
        source: '/docs',
        destination: 'http://localhost:8000/docs'
      },
      {
        source: '/docs/:path*',
        destination: 'http://localhost:8000/docs/:path*'
      }
    ];
  },
};

module.exports = nextConfig;