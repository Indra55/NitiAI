/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development artifacts in .next/dev so a running `next dev` server
  // cannot read partially replaced production chunks from a concurrent build.
  // This prevents missing vendor-chunk errors such as lucide-react.js.
  isolatedDevBuild: true,
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
