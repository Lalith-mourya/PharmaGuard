import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // async rewrites() { // Rewrites are not supported in static export
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:8000/:path*',
  //     },
  //   ]
  // },
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
