/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/flipbook-content/:path*',
        destination: 'https://pub-6d34315d51204dfa844547f953cad6f2.r2.dev/:path*',
      },
    ]
  },
}

export default nextConfig
