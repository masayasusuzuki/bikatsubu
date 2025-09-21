import React from 'react';
import type { Article } from '../types';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface ManagementTipsProps {
  tips: Article[];
}

const TipCard: React.FC<{ tip: Article }> = ({ tip }) => (
    <div
        className="bg-white shadow rounded-lg overflow-hidden group cursor-pointer"
        style={{ height: '288px', display: 'flex', flexDirection: 'column' }}
        onClick={() => window.location.href = `/article/${tip.id}`}
    >
        <div className="overflow-hidden" style={{ flexShrink: 0 }}>
            <img src={optimizeAnyImageUrl(tip.imageUrl, 320, 160)} alt={tip.title} className="w-full h-40 object-cover rounded-t group-hover:scale-105 transition-transform duration-300"/>
        </div>
        <div className="p-4" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
                <p className="text-sm text-[#d11a68] font-semibold">{tip.category}</p>
                <p className="font-semibold text-gray-800 mt-1 group-hover:text-[#d11a68]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tip.title}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">{tip.date}</p>
        </div>
    </div>
);


const ManagementTips: React.FC<ManagementTipsProps> = ({ tips }) => {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Professional's Column</h2>
        <p className="text-gray-600">プロの美容テクニック (Tips from the Experts)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map(tip => (
          <TipCard key={tip.id} tip={tip}/>
        ))}
      </div>
      <div className="text-center mt-8">
        <button className="bg-gray-800 text-white font-bold py-3 px-12 hover:bg-gray-700 transition-colors rounded-md">
          プロの記事一覧を見る
        </button>
      </div>
    </section>
  );
};

export default ManagementTips;