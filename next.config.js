/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // 既存のViteプロジェクトと並行して開発
  async rewrites() {
    return [
      // API Routes
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // 環境変数のプレフィックス設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
  },
}

export default nextConfig