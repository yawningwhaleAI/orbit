/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Don't block production builds on lint; we lint separately.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
