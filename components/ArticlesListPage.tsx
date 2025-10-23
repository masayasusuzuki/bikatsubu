import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { articlesAPI, Article, pageSectionsAPI } from '../src/lib/supabase';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';
import { usePageTracking } from '../hooks/usePageTracking';

interface ArticleListItem {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  readTime: string;
  publishDate: string;
  tags: string[];
  category: string;
}

interface ArticlesListPageProps {
  sectionType: 'hot_cosmetics' | 'brand_updates' | 'management_tips' | 'beauty_events' | 'surveys';
}

const ArticlesListPage: React.FC<ArticlesListPageProps> = ({ sectionType }) => {
  usePageTracking();

  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSectionInfo = (sectionType: string) => {
    const sectionMap: { [key: string]: {
      title: string;
      description: string;
      heroImage: string;
      bgColor: string;
      pageTitle: string;
    } } = {
      'hot_cosmetics': {
        title: 'Hot Medical Beauty',
        description: '話題の美容医療情報と海外トレンドをお届けします',
        heroImage: 'https://res.cloudinary.com/dmxlepoau/image/upload/v1758225206/qlkiruomvvduujr8a9kx.jpg',
        bgColor: 'bg-pink-50',
        pageTitle: '美容医療・海外トレンド記事一覧'
      },
      'brand_updates': {
        title: 'Beauty Topics',
        description: '美容に関するすべての記事をここでご覧いただけます',
        heroImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-blue-50',
        pageTitle: '全記事一覧'
      },
      'management_tips': {
        title: "Professional's Column",
        description: 'プロの美容テクニックとノウハウ',
        heroImage: 'https://res.cloudinary.com/dmxlepoau/image/upload/v1758431008/j5uscvqffqejezo3spaz.png',
        bgColor: 'bg-emerald-50',
        pageTitle: 'プロフェッショナルコラム記事一覧'
      },
      'beauty_events': {
        title: 'Featured Events',
        description: '注目の美容イベント情報',
        heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-purple-50',
        pageTitle: '美容イベント記事一覧'
      },
      'surveys': {
        title: '美容調査レポート',
        description: '美容に関する意識調査レポート・アンケート結果',
        heroImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=400&fit=crop&auto=format',
        bgColor: 'bg-indigo-50',
        pageTitle: '美容調査レポート一覧'
      }
    };

    return sectionMap[sectionType] || {
      title: '記事一覧',
      description: '',
      heroImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=400&fit=crop&auto=format',
      bgColor: 'bg-gray-50',
      pageTitle: '記事一覧'
    };
  };

  const sectionInfo = getSectionInfo(sectionType);

  useEffect(() => {
    document.title = `${sectionInfo.pageTitle} | 美活部（公式）`;
  }, [sectionInfo.pageTitle]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        if (sectionType === 'hot_cosmetics') {
          // Hot Medical Beautyの場合は、セクション記事 + 海外トレンドカテゴリの記事を取得
          const sections = await pageSectionsAPI.getSectionByName(sectionType);
          const articleIds = sections.map(section => section.article_id).filter(id => id !== null);
          
          const allArticles = await articlesAPI.getPublishedArticles();
          
          // セクションに関連付けられた記事
          const sectionArticles = allArticles.filter(article => 
            articleIds.includes(article.id)
          );
          
          // 海外トレンドカテゴリの記事
          const globalTrendArticles = await articlesAPI.getArticlesByCategory('海外トレンド');
          
          // 重複を除いて結合
          const combinedArticles = [...sectionArticles];
          globalTrendArticles.forEach(article => {
            if (!combinedArticles.find(existing => existing.id === article.id)) {
              combinedArticles.push(article);
            }
          });
          
          setArticles(combinedArticles);
        } else if (sectionType === 'brand_updates') {
          // Beauty Topicsの場合は、すべての公開記事を表示
          const allArticles = await articlesAPI.getPublishedArticles();
          setArticles(allArticles);
        } else if (sectionType === 'surveys') {
          // 調査レポートの場合は、article_type='survey'の記事を取得
          const surveyArticles = await articlesAPI.getArticlesByType('survey');
          setArticles(surveyArticles);
        } else {
          // 他のセクションは従来通り
          const sections = await pageSectionsAPI.getSectionByName(sectionType);
          const articleIds = sections.map(section => section.article_id).filter(id => id !== null);
          
          if (articleIds.length > 0) {
            // 記事IDから記事データを取得
            const allArticles = await articlesAPI.getAllArticles();
            const sectionArticles = allArticles.filter(article => 
              articleIds.includes(article.id) && article.status === 'published'
            );
            setArticles(sectionArticles);
          } else {
            // フォールバック: すべての公開記事を取得
            const allArticles = await articlesAPI.getPublishedArticles();
            setArticles(allArticles.slice(0, 12)); // 最大12件
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('記事の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [sectionType]);

  const sectionInfo = getSectionInfo(sectionType);

  // 記事を表示用にフォーマット
  const formatArticleForDisplay = (article: Article): ArticleListItem => {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.meta_description || article.content.substring(0, 200) + '...',
      imageUrl: article.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format',
      readTime: '5分', // 固定値または計算で求める
      publishDate: article.created_at,
      tags: article.keywords ? article.keywords.split(',').map(tag => tag.trim()) : [],
      category: article.category
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

      {/* パンくずリスト */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-[#d11a68] transition-colors">
                ホーム
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-[#d11a68] font-medium">{sectionInfo.title}</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center tracking-tight">
            {sectionInfo.title}
          </h1>
        </div>
      </div>

      {/* Search Section */}
      <div className={`${sectionInfo.bgColor} py-8`}>
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
                    src={optimizeAnyImageUrl(article.imageUrl, 320, 160)}
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

                    <p className="text-sm text-[#d11a68] font-semibold mb-2">{article.category}</p>

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

        {!loading && !error && displayArticles.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">記事がありません</h3>
            <p className="text-gray-500">まだこのセクションに記事が登録されていません</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ArticlesListPage;
