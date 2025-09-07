import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: { '@': __dirname },
    resolveExtensions: ['.ts', '.tsx', '.js', '.json'],
  },
};

export default nextConfig;
