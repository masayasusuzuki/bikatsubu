import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Sitemap: React.FC = () => {
  const sitemapSections = [
    {
      title: '主要ページ',
      links: [
        { name: 'トップページ', href: '/' },
        { name: '肌タイプ診断', href: '/skin-diagnosis' },
        { name: '記事検索', href: '/search' },
        { name: '広告掲載について', href: '/media' },
      ]
    },
    {
      title: 'カテゴリー',
      links: [
        { name: 'シミ・くすみ', href: '/category/spots-dullness' },
        { name: '毛穴', href: '/category/pores' },
        { name: '赤み・赤ら顔', href: '/category/redness' },
        { name: 'たるみ・しわ', href: '/category/aging' },
        { name: 'ニキビ・ニキビ跡', href: '/category/acne' },
      ]
    },
    {
      title: '美容総合',
      links: [
        { name: '肌育', href: '/category/skin-development' },
        { name: '最新の美容機器', href: '/category/beauty-technology' },
        { name: 'ホームケア', href: '/category/home-care' },
        { name: 'サロン経営', href: '/category/salon-management' },
        { name: '海外トレンド', href: '/category/global-trends' },
      ]
    },
    {
      title: '記事一覧',
      links: [
        { name: 'Hot Cosmetics', href: '/articles/hot-cosmetics' },
        { name: 'Beauty Topics', href: '/articles/beauty-topics' },
        { name: 'プロフェッショナルコラム', href: '/articles/professional-column' },
        { name: 'イベント情報', href: '/articles/events' },
      ]
    },
    {
      title: 'サポート',
      links: [
        { name: 'ご利用ガイド', href: '/guide' },
        { name: 'よくある質問', href: '/faq' },
        { name: 'プライバシーポリシー', href: '/privacy' },
        { name: '利用規約', href: '/terms' },
        { name: '特定商取引法に基づく表示', href: '/commercial-transaction' },
      ]
    },
  ];

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">サイトマップ</h1>
          <p className="text-lg md:text-xl opacity-90">
            美活部のページ一覧
          </p>
        </div>
      </div>

      {/* Sitemap Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <p className="text-gray-600 text-center mb-8">
              美活部の全ページへのリンク一覧です。お探しの情報を見つけるのにお役立てください。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sitemapSections.map((section) => (
                <div key={section.title} className="border-l-4 border-pink-500 pl-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-gray-700 hover:text-pink-600 transition-colors flex items-center group"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400 group-hover:text-pink-500 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              お探しのページが見つかりませんか？
            </h3>
            <p className="text-gray-600 mb-6">
              記事検索機能を使って、キーワードから記事を探すことができます
            </p>
            <a
              href="/search"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              記事を検索する
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Sitemap;
