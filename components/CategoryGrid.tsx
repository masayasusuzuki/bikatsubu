import React from 'react';
import type { Category } from '../types';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface CategoryGridProps {
  categories: Category[];
}

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const handleClick = () => {
    const categoryPath = category.title.toLowerCase()
      .replace(/・/g, '-')
      .replace(/\s+/g, '-')
      .replace('肌育', 'skin-development')
      .replace('最新の美容機器', 'beauty-technology')
      .replace('ホームケア', 'home-care')
      .replace('サロン経営', 'salon-management')
      .replace('海外トレンド', 'global-trends');

    window.location.href = `/category/${categoryPath}`;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <img src={optimizeAnyImageUrl(category.imageUrl, 400, 160)} alt={category.title} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <h3 className="text-white text-2xl font-bold text-center leading-tight">{category.title}</h3>
        </div>
      </div>
      <div className="p-6">
        <ul className="space-y-2">
          {category.subcategories.map(sub => (
            <li key={sub} className="text-sm text-gray-700 flex items-center">
              <span className="inline-block w-2 h-2 bg-[#d11a68] rounded-full mr-3 flex-shrink-0"></span>
              <a href="#" className="hover:text-[#d11a68] transition-colors">{sub}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {categories.map(category => (
        <CategoryCard key={category.title} category={category} />
      ))}
    </div>
  );
};

export default CategoryGrid;