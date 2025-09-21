import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { articlesAPI, Article } from '../src/lib/supabase';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface CategoryArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  readTime: string;
  publishDate: string;
  tags: string[];
}

interface CategoryPageProps {
  category: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ category }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCategoryInfo = (category: string) => {
    const categoryMap: { [key: string]: {
      title: string;
      description: string;
      heroImage: string;
      bgColor: string;
    } } = {
      'シミ・くすみ': {
        title: 'シミ・くすみ対策',
        description: '透明感のある明るい肌を目指すためのケア方法とおすすめアイテムをご紹介',
        heroImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-amber-50'
      },
      '毛穴': {
        title: '毛穴ケア',
        description: '目立つ毛穴の原因から効果的なケア方法まで、毛穴レスな美肌を実現',
        heroImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-blue-50'
      },
      '赤み・赤ら顔': {
        title: '赤み・赤ら顔対策',
        description: '敏感肌や赤みが気になる方のための優しいケア方法とアイテム選び',
        heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-rose-50'
      },
      'たるみ・しわ': {
        title: 'たるみ・しわ対策',
        description: 'エイジングサインに効果的なケア方法で若々しい肌をキープ',
        heroImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-purple-50'
      },
      'ニキビ・ニキビ跡': {
        title: 'ニキビ・ニキビ跡ケア',
        description: 'ニキビの予防から跡のケアまで、クリアな肌を目指すためのソリューション',
        heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-green-50'
      },
      '肌育': {
        title: '肌育',
        description: '基礎からしっかりと肌を育てる、正しいスキンケア方法とアイテム選び',
        heroImage: 'https://res.cloudinary.com/dmxlepoau/image/upload/v1758430740/au1m8nxoah22uk4ogu5n.jpg',
        bgColor: 'bg-pink-50'
      },
      '最新の美容機器': {
        title: '最新の美容機器',
        description: '革新的な美容テクノロジーで理想の肌を手に入れる最新機器情報',
        heroImage: 'https://res.cloudinary.com/dmxlepoau/image/upload/v1758225206/qlkiruomvvduujr8a9kx.jpg',
        bgColor: 'bg-indigo-50'
      },
      'ホームケア': {
        title: 'ホームケア',
        description: 'おうちで実践できる本格的な美容ケアとリラクゼーション方法',
        heroImage: 'https://res.cloudinary.com/dmxlepoau/image/upload/v1758430743/fxc1lnhoa9h3flyotoj2.jpg',
        bgColor: 'bg-emerald-50'
      },
      'サロン経営': {
        title: 'サロン経営',
        description: '美容サロンの成功に導く経営戦略と実践的なノウハウ',
        heroImage: 'https://res.cloudinary.com/dmxlepoau/image/upload/v1758431008/j5uscvqffqejezo3spaz.png',
        bgColor: 'bg-orange-50'
      },
      '海外トレンド': {
        title: '海外トレンド',
        description: '世界の最新美容トレンドと海外で人気の美容法・コスメ情報',
        heroImage: 'https://res.cloudinary.com/dmxlepoau/image/upload/v1758431028/p1jvrsavrqax1mfy7tvs.jpg',
        bgColor: 'bg-violet-50'
      }
    };

    return categoryMap[category] || {
      title: category,
      description: '',
      heroImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=400&fit=crop&auto=format',
      bgColor: 'bg-gray-50'
    };
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const fetchedArticles = await articlesAPI.getArticlesByCategory(category);
        setArticles(fetchedArticles);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('記事の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

  const getArticlesForCategory = (category: string): CategoryArticle[] => {
    const articleData: { [key: string]: Article[] } = {
      'シミ・くすみ': [
        {
          id: '1',
          title: '【2024年版】シミに効く美白美容液おすすめ10選',
          excerpt: 'シミの原因から効果的な美白成分まで、専門家が選ぶ美白美容液をランキング形式でご紹介します。',
          imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=250&fit=crop&auto=format',
          readTime: '5分',
          publishDate: '2024-09-15',
          tags: ['美白', 'シミ', '美容液']
        },
        {
          id: '2',
          title: 'くすみ肌を即効で明るくする方法とは？',
          excerpt: '朝のメイク前でも実践できる、くすみを取って透明感をアップさせるスキンケア術をお教えします。',
          imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format',
          readTime: '3分',
          publishDate: '2024-09-12',
          tags: ['くすみ', 'スキンケア', '透明感']
        },
        {
          id: '3',
          title: 'プロが教える！シミを隠すコンシーラーテクニック',
          excerpt: 'メイクアップアーティストが実践する、シミを自然に隠すコンシーラーの使い方をマスターしましょう。',
          imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop&auto=format',
          readTime: '4分',
          publishDate: '2024-09-10',
          tags: ['コンシーラー', 'メイク', 'カバー']
        }
      ],
      '毛穴': [
        {
          id: '4',
          title: '毛穴の黒ずみを根本から解決する正しい洗顔法',
          excerpt: '毛穴の黒ずみの原因を理解して、効果的な洗顔方法とおすすめアイテムで毛穴レス肌を目指しましょう。',
          imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop&auto=format',
          readTime: '6分',
          publishDate: '2024-09-14',
          tags: ['毛穴', '洗顔', '黒ずみ']
        },
        {
          id: '5',
          title: '開き毛穴を引き締める化粧水の選び方',
          excerpt: '毛穴の開きが気になる方必見！毛穴を引き締める効果的な化粧水の成分と使い方をご紹介します。',
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format',
          readTime: '4分',
          publishDate: '2024-09-11',
          tags: ['毛穴', '化粧水', '引き締め']
        },
        {
          id: '6',
          title: '毛穴パックは本当に効果的？正しい使い方と注意点',
          excerpt: '人気の毛穴パックの効果と正しい使用方法、肌への影響について皮膚科医が解説します。',
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=250&fit=crop&auto=format',
          readTime: '5分',
          publishDate: '2024-09-08',
          tags: ['毛穴パック', 'スキンケア', '注意点']
        }
      ],
      '赤み・赤ら顔': [
        {
          id: '7',
          title: '敏感肌の赤みを抑える正しいスキンケア方法',
          excerpt: '肌の赤みやかゆみに悩む敏感肌の方のための、優しく効果的なスキンケアルーティンをご紹介します。',
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format',
          readTime: '5分',
          publishDate: '2024-09-13',
          tags: ['敏感肌', '赤み', 'スキンケア']
        },
        {
          id: '8',
          title: '赤ら顔をカバーするベースメイクテクニック',
          excerpt: '赤みが気になる肌を自然にカバーするファンデーションの選び方とメイク方法をプロが伝授します。',
          imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=250&fit=crop&auto=format',
          readTime: '4分',
          publishDate: '2024-09-09',
          tags: ['赤ら顔', 'ベースメイク', 'カバー']
        }
      ],
      'たるみ・しわ': [
        {
          id: '9',
          title: '30代から始めるたるみ予防のエイジングケア',
          excerpt: 'たるみが気になり始める30代のためのエイジングケア方法と、効果的な美容成分について解説します。',
          imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=250&fit=crop&auto=format',
          readTime: '6分',
          publishDate: '2024-09-16',
          tags: ['たるみ', 'エイジングケア', '30代']
        },
        {
          id: '10',
          title: 'しわ改善に効果的なレチノールの正しい使い方',
          excerpt: 'しわ改善に注目の成分レチノールの効果と、初心者でも安心して使える正しい使用方法をご紹介します。',
          imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format',
          readTime: '5分',
          publishDate: '2024-09-07',
          tags: ['しわ', 'レチノール', 'エイジング']
        }
      ],
      'ニキビ・ニキビ跡': [
        {
          id: '11',
          title: '大人ニキビの原因と効果的な治し方',
          excerpt: '20代以降にできる大人ニキビの原因を理解して、適切なケア方法でクリアな肌を目指しましょう。',
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=250&fit=crop&auto=format',
          readTime: '5分',
          publishDate: '2024-09-15',
          tags: ['大人ニキビ', 'スキンケア', '治療']
        },
        {
          id: '12',
          title: 'ニキビ跡を薄くする美容液とケア方法',
          excerpt: 'なかなか消えないニキビ跡を薄くするための効果的な美容成分と、正しいケア方法をご紹介します。',
          imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=250&fit=crop&auto=format',
          readTime: '4分',
          publishDate: '2024-09-06',
          tags: ['ニキビ跡', '美容液', 'ケア方法']
        }
      ]
    };

    return articleData[category] || [];
  };

  const categoryInfo = getCategoryInfo(category);

  // Supabaseから取得した記事を表示用にフォーマット
  const formatArticleForDisplay = (article: Article): CategoryArticle => {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.meta_description || article.content.substring(0, 200) + '...',
      imageUrl: article.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format',
      readTime: '5分', // 固定値または計算で求める
      publishDate: article.created_at,
      tags: article.keywords ? article.keywords.split(',') : []
    };
  };

  const displayArticles = articles.map(formatArticleForDisplay);

  const filteredArticles = displayArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-gray-100 font-sans">
      <Header />

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={optimizeAnyImageUrl(categoryInfo.heroImage, 1200, 400)}
          alt={categoryInfo.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{categoryInfo.title}</h1>
            <p className="text-xl max-w-2xl">{categoryInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className={`${categoryInfo.bgColor} py-8`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">記事を検索</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="キーワードで記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d11a68] focus:border-transparent text-gray-700"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {searchQuery ? `"${searchQuery}" の検索結果: ${filteredArticles.length}件` : `${displayArticles.length}件の記事があります`}
            </p>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68]"></div>
              <p className="mt-4 text-gray-600">記事を読み込み中...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">{error}</h3>
              <button
                onClick={() => window.location.reload()}
                className="text-[#d11a68] hover:underline"
              >
                再読み込み
              </button>
            </div>
          )}

          {!loading && !error && filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/article/${article.id}`}
              style={{ height: '200px' }}
            >
              <div className="flex items-start p-6 h-full">
                {/* Left side - Thumbnail */}
                <div className="flex-shrink-0 w-48 h-32 mr-6">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Right side - Content */}
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span>{new Date(article.publishDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#d11a68] font-semibold mb-2">{category}</p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3 hover:text-[#d11a68] transition-colors" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.title}
                    </h3>
                  </div>

                  <div className="mt-4">
                    <span className="text-[#d11a68] hover:text-pink-700 text-sm font-medium">
                      続きを読む →
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!loading && !error && filteredArticles.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">検索結果が見つかりません</h3>
            <p className="text-gray-500">別のキーワードで検索してみてください</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;