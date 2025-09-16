import React from 'react';
import type { Article, Product, Manufacturer } from '../types';

interface BrandUpdatesProps {
  articles: Article[];
  products: Product[];
  manufacturers: Manufacturer[];
}

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
    <div
        className="bg-white group cursor-pointer"
        style={{ height: '256px', display: 'flex', flexDirection: 'column' }}
        onClick={() => window.location.href = `/article/${article.id}`}
    >
        <div className="overflow-hidden" style={{ flexShrink: 0 }}>
          <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"/>
        </div>
        <div className="py-4" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-[#d11a68]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</p>
            <p className="text-xs text-gray-500 mt-1">{article.date}</p>
        </div>
    </div>
);


const SidebarProduct: React.FC<{ product: Product }> = ({ product }) => (
    <div className="flex items-start space-x-3 mb-4">
        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover flex-shrink-0 rounded" />
        <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{product.name}</p>
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


const BrandUpdates: React.FC<BrandUpdatesProps> = ({ articles, products, manufacturers }) => {
  return (
    <section>
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Beauty Topics</h2>
            <p className="text-gray-600">最新美容ニュース (Latest Beauty News)</p>
        </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(article => (
                <ArticleCard key={article.id} article={article}/>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-gray-800 text-white font-bold py-3 px-12 hover:bg-gray-700 transition-colors rounded-md">
              記事一覧を見る
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-1/3">
          <div className="mb-8">
            <h3 className="font-bold text-lg border-b-2 border-gray-300 pb-2 mb-4">人気コスメランキング (Top Cosmetics)</h3>
            {products.map(product => (
              <SidebarProduct key={product.id} product={product} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default BrandUpdates;