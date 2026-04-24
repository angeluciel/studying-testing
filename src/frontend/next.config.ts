import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ['20.172.172.246'],
};

export default nextConfig;
