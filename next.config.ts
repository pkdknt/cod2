import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.180', '192.168.1.180:3000', 'localhost:3000'],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  async redirects() {
    return [
      {
        source: '/tra-cuu-nhanh',
        destination: '/cskh-tiem-chung',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
