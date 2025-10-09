import React from 'react';

const Footer: React.FC = () => {
  const footerLinks = {
    'カテゴリー': [
      { name: 'シミ・くすみ', href: '/category/spots-dullness' },
      { name: '毛穴', href: '/category/pores' },
      { name: '赤み・赤ら顔', href: '/category/redness' },
      { name: 'たるみ・しわ', href: '/category/aging' },
      { name: 'ニキビ・ニキビ跡', href: '/category/acne' }
    ],
    '美容総合': [
      { name: '肌育', href: '/category/skin-development' },
      { name: '最新の美容機器', href: '/category/beauty-technology' },
      { name: 'ホームケア', href: '/category/home-care' },
      { name: 'サロン経営', href: '/category/salon-management' },
      { name: '海外トレンド', href: '/category/global-trends' }
    ],
    '美活部について': [
      '株式会社LOGICA', 
      'お問い合わせ', 
      { name: '広告掲載について', href: '/media' }
    ],
    'サポート': [
      { name: 'ご利用ガイド', href: '/guide' },
      { name: 'よくある質問', href: '/faq' },
      { name: 'プライバシーポリシー', href: '/privacy' },
      { name: '利用規約', href: '/terms' }
    ],
  };

  return (
    <footer className="bg-[#d11a68] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold">美活部</h2>
            </div>
            <div className="flex space-x-4">
                <a href="https://x.com/bikatsubu_mirai" target="_blank" rel="noopener noreferrer" className="text-xl p-2 bg-white text-[#d11a68] rounded-full w-10 h-10 flex items-center justify-center"><i className="fab fa-x-twitter"></i></a>
                <a href="https://www.tiktok.com/@bikatsubu_mirai" target="_blank" rel="noopener noreferrer" className="text-xl p-2 bg-white text-[#d11a68] rounded-full w-10 h-10 flex items-center justify-center"><i className="fab fa-tiktok"></i></a>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/30 pt-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold mb-4">{title}</h3>
              {Array.isArray(links) && links.length > 0 && (
                <ul>
                  {links.map((link, index) => (
                    <li key={typeof link === 'string' ? link : link.name || index} className="mb-2">
                      {typeof link === 'string' ? (
                        <a href="#" className="text-sm hover:underline">{link}</a>
                      ) : (
                        <a href={link.href} className="text-sm hover:underline">{link.name}</a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="text-sm mt-12 border-t border-white/30 pt-6 text-center">
            <div className="flex justify-center space-x-4">
                <a href="/sitemap" className="hover:underline">サイトマップ</a>
                <a href="/commercial-transaction" className="hover:underline">特定商取引法に基づく表示</a>
            </div>
        </div>
      </div>
      <div className="bg-black/20 text-center py-4">
        <div className="flex justify-center items-center space-x-4">
          <p className="text-xs">&copy; 2024 Bikatsu-bu Inc. All Rights Reserved.</p>
          <a href="/admin" className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors">
            管理者ログイン
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;