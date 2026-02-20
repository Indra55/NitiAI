/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555'}/api/:path*`
      }
    ]
  },
  // Increase proxy timeout for long-running AI calls
  httpAgentOptions: {
    keepAlive: true,
  },
}

export default nextConfig
