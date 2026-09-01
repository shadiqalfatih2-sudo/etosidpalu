import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: { optimizePackageImports: ['@supabase/supabase-js'] },
  outputFileTracingIncludes: {
    '/*': ['./public/packed/**/*'],
  },
};

export default nextConfig;
