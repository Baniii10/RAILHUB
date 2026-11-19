/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  compress: true,
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
  },
  experimental: {
    agentUpgrade: "security",
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
