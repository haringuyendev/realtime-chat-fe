import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',  // Tất cả request từ frontend /api/*
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/:path*`,  // Proxy đến backend (fallback nếu env rỗng)
      },
      {
        source:'/uploads/:path*',
        destination:`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/uploads/:path*`,
      }
    ];
  },
};

export default nextConfig;