/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // This ensures that path aliases from tsconfig.json are used
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
