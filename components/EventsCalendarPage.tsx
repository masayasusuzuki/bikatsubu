import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MiniCalendar from './MiniCalendar';
import EventTimeline from './EventTimeline';
import type { BeautyEvent } from '../types';
import { beautyEventsAPI } from '../src/lib/supabase';
import { useCanonical } from '../src/hooks/useCanonical';

const EventsCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<BeautyEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useCanonical('https://www.bikatsubu-media.jp/articles/events');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await beautyEventsAPI.getAllEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('イベントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // カテゴリーフィルター用の状態
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');

  // 利用可能なカテゴリーを取得
  const categories = ['すべて', ...Array.from(new Set(events.map(e => e.category)))];

  // フィルター適用
  const filteredEvents = selectedCategory === 'すべて'
    ? events
    : events.filter(e => e.category === selectedCategory);

  return (
    <div className="bg-gradient-to-b from-rose-50 to-white min-h-screen font-sans">
      <Header />

      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-brand-primary transition-colors">
                ホーム
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-brand-primary font-medium">イベントカレンダー</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <img
              src="https://res.cloudinary.com/dmxlepoau/image/upload/v1763553057/k7chnfzszaoyqpz8pag4.jpg"
              alt="美容イベントカレンダー"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          <p className="mt-4 text-gray-600">イベント情報を読み込み中...</p>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{error}</h3>
          <button
            onClick={loadEvents}
            className="text-rose-600 hover:underline font-semibold mt-4"
          >
            再読み込み
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="container mx-auto px-4 py-12">
          {/* Category Filter */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-md">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-lg font-semibold text-sm transition-all
                    ${selectedCategory === category
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-transparent text-gray-600 hover:bg-rose-50'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Mini Calendar */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-4">
                <MiniCalendar
                  events={filteredEvents}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />

                {/* Stats Card */}
                <div className="mt-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">イベント統計</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-rose-100">今月のイベント</span>
                      <span className="text-2xl font-bold">
                        {events.filter(e => {
                          const eventDate = new Date(e.date);
                          return eventDate.getMonth() === selectedDate.getMonth() &&
                                 eventDate.getFullYear() === selectedDate.getFullYear();
                        }).length}件
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-rose-100">全イベント</span>
                      <span className="text-2xl font-bold">{events.length}件</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Event Timeline */}
            <div className="lg:col-span-8">
              <EventTimeline
                events={filteredEvents}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventsCalendarPage;
