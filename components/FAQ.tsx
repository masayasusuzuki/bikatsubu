import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqItems: FAQItem[] = [
    // サイト利用について
    {
      id: 1,
      question: '美活部とはどのようなサイトですか？',
      answer: '美活部は、美容に関する情報を発信する専門メディアサイトです。コスメ情報、美容テクニック、イベント情報などを提供し、ユーザーの美容活動をサポートしています。最新のトレンドからプロの技術まで、幅広い美容情報をお届けしています。',
      category: 'site'
    },
    {
      id: 2,
      question: 'サイトの利用は無料ですか？',
      answer: '基本的なコンテンツの閲覧は無料でご利用いただけます。ユーザー登録も無料で、お気に入り記事の保存やマイページ機能をご利用いただけます。',
      category: 'site'
    },
    {
      id: 3,
      question: '記事はどのくらいの頻度で更新されますか？',
      answer: '美容トレンドや新商品情報に合わせて定期的に更新しています。新しい記事は週に複数回投稿され、イベントやキャンペーン情報もタイムリーにお届けしています。',
      category: 'site'
    },
    {
      id: 4,
      question: 'スマートフォンでも利用できますか？',
      answer: 'はい、スマートフォン、タブレット、PCなど、あらゆるデバイスに対応しています。レスポンシブデザインにより、どのデバイスでも快適にご利用いただけます。',
      category: 'site'
    },

    // 会員登録・ログインについて
    {
      id: 5,
      question: 'ユーザー登録は必要ですか？',
      answer: '記事の閲覧は登録なしでも可能ですが、ユーザー登録をすることで、お気に入り記事の保存、マイページでの履歴管理、パーソナライズされたおすすめ情報などの機能をご利用いただけます。',
      category: 'account'
    },
    {
      id: 6,
      question: 'パスワードを忘れてしまいました',
      answer: 'ログインページの「パスワードを忘れた方はこちら」から、登録メールアドレスを入力してください。パスワード再設定用のメールをお送りします。メールが届かない場合は、迷惑メールフォルダもご確認ください。',
      category: 'account'
    },
    {
      id: 7,
      question: '退会したい場合はどうすればよいですか？',
      answer: 'マイページの設定画面から退会手続きを行えます。退会すると、保存した記事や履歴などのデータは削除され、復元できませんのでご注意ください。',
      category: 'account'
    },

    // 記事・コンテンツについて
    {
      id: 8,
      question: '記事の情報は信頼できますか？',
      answer: '美容の専門知識を持つライターや美容師、エステティシャンなどの協力のもと、信頼性の高い情報をお届けしています。ただし、個人差があるため、肌に合わない場合は使用を中止し、必要に応じて専門医にご相談ください。',
      category: 'content'
    },
    {
      id: 9,
      question: '商品の価格や販売情報が古い場合があります',
      answer: '記事公開時点での情報を掲載していますが、価格や販売状況は変更される場合があります。最新の情報は、各メーカーや販売店の公式サイトでご確認ください。',
      category: 'content'
    },
    {
      id: 10,
      question: '特定の商品について詳しく知りたいです',
      answer: '記事内で紹介している商品について、より詳しい情報が必要な場合は、メーカーの公式サイトや販売店にお問い合わせください。また、関連記事も合わせてご参照ください。',
      category: 'content'
    },
    {
      id: 11,
      question: '肌診断の結果は正確ですか？',
      answer: '肌診断は一般的な傾向をもとにした簡易診断です。より詳しい肌質の判定については、美容皮膚科やエステサロンでの専門的な診断をおすすめします。',
      category: 'content'
    },

    // 技術的な問題について
    {
      id: 12,
      question: 'ページが正しく表示されません',
      answer: 'ブラウザのキャッシュをクリアするか、別のブラウザでアクセスしてください。Chrome、Firefox、Safari、Edgeの最新版を推奨しています。問題が解決しない場合は、お問い合わせください。',
      category: 'technical'
    },
    {
      id: 13,
      question: '画像が表示されません',
      answer: 'インターネット接続を確認し、ページを再読み込みしてください。広告ブロッカーを使用している場合は、一時的に無効にして確認してください。',
      category: 'technical'
    },
    {
      id: 14,
      question: '検索機能が正しく動作しません',
      answer: 'キーワードを変更して再度検索してみてください。ひらがな、カタカナ、漢字などの表記を変えることで、より多くの結果が見つかる場合があります。',
      category: 'technical'
    },

    // その他
    {
      id: 15,
      question: '広告掲載について教えてください',
      answer: '美容関連の商品やサービスの掲載をご希望の場合は、ヘッダーの「美活部に掲載」からお問い合わせください。掲載内容や料金について詳しくご案内いたします。',
      category: 'other'
    },
    {
      id: 16,
      question: '記事の内容について間違いを見つけました',
      answer: '記事内容に誤りがある場合は、お問い合わせフォームからご連絡ください。確認の上、必要に応じて修正いたします。より正確な情報提供のために、皆様のご協力をお願いいたします。',
      category: 'other'
    },
    {
      id: 17,
      question: 'SNSでシェアしても良いですか？',
      answer: 'はい、記事のシェアは歓迎いたします。SNSでシェアする際は、元記事のリンクを含めていただければと思います。ただし、記事内容の無断転載はご遠慮ください。',
      category: 'other'
    }
  ];

  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'site', name: 'サイト利用' },
    { id: 'account', name: '会員登録・ログイン' },
    { id: 'content', name: '記事・コンテンツ' },
    { id: 'technical', name: '技術的な問題' },
    { id: 'other', name: 'その他' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">よくある質問</h1>
            <p className="text-gray-600">
              美活部のご利用について、よく寄せられる質問をまとめました。<br />
              お探しの情報が見つからない場合は、お気軽にお問い合わせください。
            </p>
          </div>

          {/* カテゴリフィルター */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">カテゴリで絞り込む</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#d11a68] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ項目 */}
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:ring-opacity-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Q. {item.question}
                      </h3>
                    </div>
                    <div className="ml-4">
                      <svg
                        className={`w-6 h-6 text-gray-500 transition-transform ${
                          openItem === item.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
                
                {openItem === item.id && (
                  <div className="px-6 pb-6">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed">
                        <strong className="text-[#d11a68]">A.</strong> {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">該当する質問が見つかりません</h3>
              <p className="text-gray-500">別のカテゴリを選択してください</p>
            </div>
          )}

          {/* お問い合わせセクション */}
          <div className="bg-gradient-to-r from-[#d11a68] to-pink-600 rounded-lg p-8 mt-12 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">解決しない問題がありますか？</h2>
            <p className="mb-6">
              上記で解決しない場合や、その他のご質問がございましたら、<br />
              お気軽にお問い合わせください。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#d11a68] font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                お問い合わせフォーム
              </button>
              <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-[#d11a68] transition-colors">
                SNSで質問する
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
