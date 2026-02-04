/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This allows the build to succeed even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // This allows the build to succeed even if there are linting errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
