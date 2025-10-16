import React from 'react';
import type { Article, Product, Manufacturer } from '../types';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface BrandUpdatesProps {
  articles: Article[];
  products: Product[];
  manufacturers: Manufacturer[];
  popularMedicalBeauty: Article[];
}

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
    <div
        className="bg-white rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border border-rose-100 hover:border-rose-200 hover:-translate-y-2"
        style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
        onClick={() => window.location.href = `/article/${article.id}`}
    >
        <div className="overflow-hidden relative" style={{ flexShrink: 0 }}>
          <img src={optimizeAnyImageUrl(article.imageUrl, 320, 160)} alt={article.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"/>
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-5" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p className="text-sm font-bold text-gray-800 group-hover:text-rose-500 transition-colors duration-300 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                {article.date}
            </p>
        </div>
    </div>
);


const SidebarProduct: React.FC<{ product: Product }> = ({ product }) => (
    <div
        className="flex items-start space-x-3 mb-4 cursor-pointer hover:bg-rose-50 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-200 hover:shadow-md"
        onClick={() => window.location.href = `/article/${product.id}`}
    >
        <img src={optimizeAnyImageUrl(product.imageUrl, 64, 64)} alt={product.name} className="w-16 h-16 object-cover flex-shrink-0 rounded-lg shadow-sm" />
        <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight hover:text-rose-500 transition-colors">{product.name}</p>
            <p className="text-xs text-gray-500 mt-1">{product.subText}</p>
        </div>
    </div>
);

const SidebarManufacturer: React.FC<{ manufacturer: Manufacturer }> = ({ manufacturer }) => (
    <div className="flex items-start space-x-3 mb-4 p-3 border rounded hover:shadow-md transition-shadow">
        <img src={manufacturer.logoUrl} alt={manufacturer.name} className="w-16 h-16 object-contain flex-shrink-0" />
        <div>
            <p className="text-sm font-bold text-[#d11a68] leading-tight">{manufacturer.name}</p>
            <p className="text-xs text-gray-600 mt-1">{manufacturer.description}</p>
        </div>
    </div>
);


const BrandUpdates: React.FC<BrandUpdatesProps> = ({ articles, products, manufacturers, popularMedicalBeauty }) => {
  return (
    <section>
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">Beauty Topics</h2>
            <p className="text-gray-500 text-lg font-light">最新美容ニュース</p>
        </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map(article => (
                <ArticleCard key={article.id} article={article}/>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-4 px-14 hover:from-rose-600 hover:to-pink-600 hover:shadow-xl transition-all duration-300 rounded-full"
              onClick={() => window.location.href = '/articles/beauty-topics'}
            >
              記事一覧を見る →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-1/3">
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-rose-100">
            <h3 className="font-bold text-xl text-gray-800 pb-3 mb-5 border-b-2 border-rose-200">人気の美容医療ランキング</h3>
            {popularMedicalBeauty && popularMedicalBeauty.length > 0 ? (
              popularMedicalBeauty.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-start space-x-3 mb-4 cursor-pointer hover:bg-rose-50 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-200 hover:shadow-md"
                  onClick={() => window.location.href = `/article/${article.id}`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={optimizeAnyImageUrl(article.imageUrl, 64, 64)} alt={article.title} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                    <div className="absolute -top-2 -left-2 bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight hover:text-rose-500 transition-colors">{article.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{article.category || article.date}</p>
                  </div>
                </div>
              ))
            ) : (
              products.map(product => (
                <SidebarProduct key={product.id} product={product} />
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default BrandUpdates;