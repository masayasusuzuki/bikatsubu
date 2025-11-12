import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../index.css' // 既存のCSSを使用

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '美活部（公式）｜美容医療・スキンケア情報メディア',
    template: '%s | 美活部',
  },
  description: '美活部（公式）は美容医療・スキンケアの正しい知識を専門家監修で発信する美容メディアです。肌タイプ診断、最新コスメ情報、美容医療の体験談など、あなたの美活をサポートします。',
  keywords: '美容,コスメ,スキンケア,肌診断,美容メディア,化粧品,美活,美容医療,肌タイプ診断',
  metadataBase: new URL('https://bikatsu-bu.com'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://bikatsu-bu.com',
    siteName: '美活部',
    title: '美活部（公式）｜美容医療・スキンケア情報メディア',
    description: '美容医療・スキンケアの正しい知識を専門家監修で発信',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '美活部',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '美活部（公式）',
    description: '美容医療・スキンケアの正しい知識を専門家監修で発信',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}