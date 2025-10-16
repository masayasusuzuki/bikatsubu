import React from 'react';
import type { Article } from '../types';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface SurveyReportsProps {
  reports: Article[];
}

const ReportCard: React.FC<{ report: Article }> = ({ report }) => (
    <div
        className="bg-white rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border border-indigo-100 hover:border-indigo-200 hover:-translate-y-2"
        style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
        onClick={() => window.location.href = `/article/${report.id}`}
    >
        <div className="overflow-hidden relative" style={{ flexShrink: 0 }}>
            <img src={optimizeAnyImageUrl(report.imageUrl, 320, 160)} alt={report.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"/>
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                調査データ
            </div>
        </div>
        <div className="p-5" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide">{report.category}</p>
                <p className="font-bold text-gray-800 mt-2 group-hover:text-indigo-600 transition-colors duration-300 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.title}</p>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                {report.date}
            </p>
        </div>
    </div>
);


const SurveyReports: React.FC<SurveyReportsProps> = ({ reports }) => {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-3 tracking-tight">Survey Reports</h2>
        <p className="text-gray-500 text-lg font-light">美容に関する意識調査レポート</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reports.slice(0, 3).map(report => (
          <ReportCard key={report.id} report={report}/>
        ))}
      </div>
      <div className="text-center mt-12">
        <button
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-14 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-300 rounded-full"
          onClick={() => window.location.href = '/articles/surveys'}
        >
          調査レポート一覧を見る →
        </button>
      </div>
    </section>
  );
};

export default SurveyReports;
