import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import SearchBar from './SearchBar';
import { articlesAPI, Article as DBArticle } from '../src/lib/supabase';
import type { Article } from '../types';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

const SearchResultsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);

    if (query) {
      searchArticles(query);
    } else {
      setLoading(false);
    }
  }, []);

  const convertDBArticleToUIArticle = (dbArticle: DBArticle): Article => {
    return {
      id: dbArticle.id,
      title: dbArticle.title,
      imageUrl: dbArticle.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format',
      date: new Date(dbArticle.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      category: dbArticle.category,
      tag: dbArticle.keywords?.split(',')[0] || undefined,
      slug: dbArticle.slug
    };
  };

  const searchArticles = async (query: string) => {
    setLoading(true);
    try {
      const searchResults = await articlesAPI.searchArticles(query);
      const uiArticles = searchResults.map(convertDBArticleToUIArticle);
      setResults(uiArticles);
      setTotalResults(uiArticles.length);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <Header />

      {/* Search Bar */}
      <SearchBar />

      {/* Search Results */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Search Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              検索結果
            </h1>
            {searchQuery && (
              <p className="text-gray-600">
                「<span className="font-semibold text-pink-600">{searchQuery}</span>」の検索結果：
                <span className="ml-2 font-bold text-gray-800">{totalResults}件</span>
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
              <span className="ml-3 text-gray-600">検索中...</span>
            </div>
          )}

          {/* No Query */}
          {!loading && !searchQuery && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">検索キーワードを入力してください</h2>
              <p className="text-gray-600">上の検索バーから記事を検索できます</p>
            </div>
          )}

          {/* No Results */}
          {!loading && searchQuery && results.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">検索結果が見つかりませんでした</h2>
              <p className="text-gray-600 mb-6">
                「{searchQuery}」に一致する記事が見つかりませんでした
              </p>
              <div className="bg-pink-50 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-sm text-gray-700 mb-3 font-semibold">検索のヒント：</p>
                <ul className="text-sm text-gray-600 text-left space-y-2">
                  <li>• 別のキーワードで検索してみてください</li>
                  <li>• より一般的な用語を使用してみてください</li>
                  <li>• スペルを確認してください</li>
                </ul>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
                  onClick={() => window.location.href = `/article/${article.slug || article.id}`}
                >
                  <div className="overflow-hidden">
                    <img
                      src={optimizeAnyImageUrl(article.imageUrl, 400, 250)}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {article.category && (
                        <span className="inline-block bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                      )}
                      {article.tag && (
                        <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {article.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500">{article.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
