import React, { useState } from 'react';
import type { Product } from '../types';
import type { Article } from '../src/lib/supabase';
import OptimizedImage from './OptimizedImage';

interface ProductCarouselProps {
  products: Product[];
  mostRead: Article[];
}

const MostReadArticle: React.FC<{ article: Article }> = ({ article }) => (
  <div
    className="flex items-start space-x-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
    onClick={() => window.location.href = `/article/${article.slug || article.id}`}
  >
    <div className="w-16 h-16 flex-shrink-0">
      <OptimizedImage
        src={article.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=64&h=64&fit=crop&auto=format'}
        alt={article.title}
        width={64}
        height={64}
        className="rounded"
        sizes="64px"
      />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-800 leading-tight hover:text-brand-primary">{article.title}</p>
      <p className="text-xs text-gray-500 mt-1">{article.category}</p>
    </div>
  </div>
);

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, mostRead }) => {
  const displayedArticles = mostRead.slice(0, 5);

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">最新の記事一覧</h2>
        <p className="text-gray-600">Latest Articles</p>
      </div>

      <div className="w-full">
        {displayedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {displayedArticles.map(article => (
                <div
                  key={article.id}
                  className="group cursor-pointer"
                  onClick={() => window.location.href = `/article/${article.slug || article.id}`}
                >
                  <div className="overflow-hidden rounded-lg">
                    <OptimizedImage
                      src={article.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format'}
                      alt={article.title}
                      width={320}
                      height={180}
                      className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>
                  <div className="py-3">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-primary line-clamp-2">{article.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{article.category}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(article.published_at || article.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                className="bg-gray-800 text-white font-bold py-3 px-12 hover:bg-gray-700 transition-colors rounded-md"
                onClick={() => window.location.href = '/articles/latest'}
              >
                記事一覧を見る
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">記事がありません</h3>
            <p className="text-gray-500">管理画面から記事を追加してください</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCarousel;