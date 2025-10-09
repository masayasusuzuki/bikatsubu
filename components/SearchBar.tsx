import React, { useState } from 'react';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="記事を検索（例: 美容医療、スキンケア、毛穴ケア）"
              className="w-full pl-12 pr-32 py-4 text-gray-900 placeholder-gray-500 bg-white border-2 border-transparent rounded-full shadow-lg focus:outline-none focus:border-pink-400 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              検索
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            💡 記事のタイトル、カテゴリー、キーワードから検索できます
          </p>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
