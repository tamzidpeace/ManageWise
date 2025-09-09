import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
    resolveAlias: { '@': __dirname },
    resolveExtensions: ['.ts', '.tsx', '.js', '.json'],
  },
};

export default nextConfig;
