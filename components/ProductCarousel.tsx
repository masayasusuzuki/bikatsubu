import React, { useState } from 'react';
import type { Product } from '../types';

interface ProductCarouselProps {
  products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const prev = () => setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : totalPages - 1);
  const next = () => setCurrentIndex(currentIndex < totalPages - 1 ? currentIndex + 1 : 0);
  
  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6 border-b-2 border-[#d11a68] pb-2">話題のコスメ (Hot New Cosmetics)</h2>
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div key={pageIndex} className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage).map(product => (
                  <div
                    key={product.id}
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-300"
                    onClick={() => window.location.href = `/article/${product.id}`}
                  >
                    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4" />
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.subText}</p>
                    <p className="text-xs text-gray-400 mt-2">{product.date}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200"><i className="fas fa-chevron-left"></i></button>
        <button onClick={next} className="absolute top-1/2 -translate-y-1/2 -right-4 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200"><i className="fas fa-chevron-right"></i></button>
      </div>
       <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full ${currentIndex === index ? 'bg-[#d11a68]' : 'bg-gray-300'}`}
                />
            ))}
        </div>
    </div>
  );
};

export default ProductCarousel;