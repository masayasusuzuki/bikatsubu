import React from 'react';
import type { Article } from '../types';

interface BeautyEventsProps {
  events: Article[];
}

const EventCard: React.FC<{ event: Article }> = ({ event }) => (
  <div
    className="bg-white text-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
    style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
    onClick={() => window.location.href = `/article/${event.id}`}
  >
    <div className="relative" style={{ flexShrink: 0 }}>
      <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
      {event.tag && <span className="absolute top-2 left-2 bg-[#d11a68] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">{event.tag}</span>}
    </div>
    <div className="p-4" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <p className="font-bold text-gray-700">{event.date}</p>
        <p className="text-sm mt-1 font-semibold" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.title}</p>
      </div>
    </div>
  </div>
);

const BeautyEvents: React.FC<BeautyEventsProps> = ({ events }) => {
  // トップページでは4つまでに制限
  const displayedEvents = events.slice(0, 4);

  const handleViewAllEvents = () => {
    // 別ページに遷移（後で実装）
    window.location.href = '/events';
  };

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Featured Events</h2>
        <p>注目の美容イベント (Upcoming Beauty Events)</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <div className="text-center mt-10">
        <button
          onClick={handleViewAllEvents}
          className="bg-white text-[#d11a68] font-bold py-3 px-12 hover:bg-gray-200 transition-colors text-lg rounded-md"
        >
            イベント一覧を見る
        </button>
      </div>
    </section>
  );
};

export default BeautyEvents;