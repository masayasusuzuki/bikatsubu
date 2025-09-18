import React, { useState } from 'react';
import type { Product, Article } from '../types';

interface ProductCarouselProps {
  products: Product[];
  mostRead: Article[];
}

const MostReadArticle: React.FC<{ article: Article }> = ({ article }) => (
  <div
    className="flex items-start space-x-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
    onClick={() => window.location.href = `/article/${article.id}`}
  >
    <img src={article.imageUrl} alt={article.title} className="w-16 h-16 object-cover flex-shrink-0 rounded" />
    <div>
      <p className="text-sm font-semibold text-gray-800 leading-tight hover:text-[#d11a68]">{article.title}</p>
      <p className="text-xs text-gray-500 mt-1">{article.category || article.date}</p>
    </div>
  </div>
);

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, mostRead }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const prev = () => setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : totalPages - 1);
  const next = () => setCurrentIndex(currentIndex < totalPages - 1 ? currentIndex + 1 : 0);
  
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Hot Medical Beauty</h2>
        <p className="text-gray-600">話題の美容医療 (Latest Medical Beauty)</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="group cursor-pointer"
                style={{ height: '256px', display: 'flex', flexDirection: 'column' }}
                onClick={() => window.location.href = `/article/${product.id}`}
              >
                <div className="overflow-hidden" style={{ flexShrink: 0 }}>
                  <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"/>
                </div>
                <div className="py-4" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#d11a68]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{product.date}</p>
                </div>
              </div>
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
            <h3 className="font-bold text-lg border-b-2 border-gray-300 pb-2 mb-4">人気記事ランキング (Most Read Articles)</h3>
            {mostRead.map(article => (
              <MostReadArticle key={article.id} article={article} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ProductCarousel;