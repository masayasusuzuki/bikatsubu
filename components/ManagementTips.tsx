import React from 'react';
import type { Article } from '../types';

interface ManagementTipsProps {
  tips: Article[];
  mostRead: Article[];
}

const TipCard: React.FC<{ tip: Article }> = ({ tip }) => (
    <div
        className="bg-white shadow rounded-lg overflow-hidden group cursor-pointer"
        style={{ height: '288px', display: 'flex', flexDirection: 'column' }}
        onClick={() => window.location.href = `/article/${tip.id}`}
    >
        <div className="overflow-hidden" style={{ flexShrink: 0 }}>
            <img src={tip.imageUrl} alt={tip.title} className="w-full h-40 object-cover rounded-t group-hover:scale-105 transition-transform duration-300"/>
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

const MostReadArticle: React.FC<{ article: Article }> = ({ article }) => (
    <div
        className="flex items-start space-x-3 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
        onClick={() => window.location.href = `/article/${article.id}`}
    >
        <img src={article.imageUrl} alt={article.title} className="w-16 h-16 object-cover flex-shrink-0 rounded" />
        <div>
            <p className="text-xs bg-yellow-400 inline-block px-2 py-0.5 font-bold mb-1 rounded">{article.category}</p>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{article.title}</p>
        </div>
    </div>
);


const ManagementTips: React.FC<ManagementTipsProps> = ({ tips, mostRead }) => {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Professional's Column</h2>
        <p className="text-gray-600">プロの美容テクニック (Tips from the Experts)</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-2/3">
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
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-1/3">
          <div className="bg-white p-4 rounded shadow">
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

export default ManagementTips;