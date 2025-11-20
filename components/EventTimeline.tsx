import React from 'react';
import type { BeautyEvent } from '../types';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface EventTimelineProps {
  events: BeautyEvent[];
  selectedDate: Date;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events, selectedDate }) => {
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  // 選択された月のイベントをフィルター
  const monthEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // カテゴリーごとの色
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      '展示会': 'bg-purple-100 text-purple-800',
      '新商品発売': 'bg-pink-100 text-pink-800',
      'セミナー': 'bg-blue-100 text-blue-800',
      'ワークショップ': 'bg-green-100 text-green-800',
      'その他': 'bg-gray-100 text-gray-800'
    };
    return colorMap[category] || colorMap['その他'];
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatDateRange = (startDate: string, endDate?: string): string => {
    if (!endDate) return formatDate(startDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  if (monthEvents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
        <div className="text-gray-300 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">この月にイベントはありません</p>
        <p className="text-gray-400 text-sm mt-2">別の月を選択してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {selectedYear}年{selectedMonth + 1}月のイベント
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {monthEvents.length}件
        </span>
      </div>

      {monthEvents.map((event, index) => (
        <div
          key={event.id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image section */}
            {event.image && (
              <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                <img
                  src={optimizeAnyImageUrl(event.image, 320, 240)}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Content section */}
            <div className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    {event.brand && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                        {event.brand}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                    {event.title}
                  </h4>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg">{formatDateRange(event.date, event.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-4">
                {event.description}
              </p>

              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-semibold transition-colors"
                >
                  詳細を見る
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventTimeline;
