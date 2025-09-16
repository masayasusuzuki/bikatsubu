import React from 'react';

const Footer: React.FC = () => {
  const footerLinks = {
    'カテゴリー': ['スキンケア', 'メイクアップ', 'ヘアケア', 'ボディケア', 'インナービューティー'],
    '特集': ['新作コスメレビュー', '専門家インタビュー', 'お悩み別解決法', 'How-to & Tips', 'イベントレポート'],
    '美活部について': ['美活部とは', '運営会社', 'お問い合わせ', '広告掲載について'],
    'サポート': ['ご利用ガイド', 'よくある質問', 'プライバシーポリシー', '利用規約'],
  };

  return (
    <footer className="bg-[#d11a68] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold">美活部</h2>
            </div>
            <div className="flex space-x-4">
                <a href="#" className="text-xl p-2 bg-white text-[#d11a68] rounded-full w-10 h-10 flex items-center justify-center"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-xl p-2 bg-white text-[#d11a68] rounded-full w-10 h-10 flex items-center justify-center"><i className="fab fa-x-twitter"></i></a>
                <a href="#" className="text-xl p-2 bg-white text-[#d11a68] rounded-full w-10 h-10 flex items-center justify-center"><i className="fab fa-line"></i></a>
            </div>
             <a href="#" className="bg-white text-[#d11a68] font-bold py-2 px-4 rounded hover:bg-opacity-90">新規登録/ログイン →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/30 pt-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold mb-4">{title}</h3>
              {links.length > 0 && (
                <ul>
                  {links.map(link => (
                    <li key={link} className="mb-2">
                      <a href="#" className="text-sm hover:underline">{link}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="text-sm mt-12 border-t border-white/30 pt-6 text-center">
            <div className="flex justify-center space-x-4">
                <a href="#">サイトマップ</a>
                <a href="#">特定商取引法に基づく表示</a>
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