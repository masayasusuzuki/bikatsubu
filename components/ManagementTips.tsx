import React from 'react';
import type { Article } from '../types';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface ManagementTipsProps {
  tips: Article[];
}

const TipCard: React.FC<{ tip: Article }> = ({ tip }) => (
    <div
        className="bg-white rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-2"
        style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
        onClick={() => window.location.href = `/article/${tip.slug || tip.id}`}
    >
        <div className="overflow-hidden relative" style={{ flexShrink: 0 }}>
            <img src={optimizeAnyImageUrl(tip.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=320&h=160&fit=crop&auto=format', 320, 160)} alt={tip.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-5" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
                <p className="text-xs text-rose-500 font-bold uppercase tracking-wide">{tip.category}</p>
                <p className="font-bold text-gray-800 mt-2 group-hover:text-rose-500 transition-colors duration-300 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tip.title}</p>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                {new Date(tip.published_at || tip.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
            </p>
        </div>
    </div>
);


const ManagementTips: React.FC<ManagementTipsProps> = ({ tips }) => {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">Professional's Column</h2>
        <p className="text-gray-500 text-lg font-light">プロの美容テクニック</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tips.map(tip => (
          <TipCard key={tip.id} tip={tip}/>
        ))}
      </div>
      <div className="text-center mt-12">
        <button
          className="bg-gradient-to-r from-slate-700 to-gray-800 text-white font-bold py-4 px-14 hover:from-slate-800 hover:to-gray-900 hover:shadow-xl transition-all duration-300 rounded-full"
          onClick={() => window.location.href = '/articles/professional-column'}
        >
          プロの記事一覧を見る →
        </button>
      </div>
    </section>
  );
};

export default ManagementTips;