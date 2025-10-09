import React, { useState } from 'react';

const Header: React.FC = () => {
    const mainNavItems = ['シミ・くすみ', '毛穴', '赤み・赤ら顔', 'たるみ・しわ', 'ニキビ・ニキビ跡', '肌タイプ診断'];
    const subNavItems: string[] = [];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <a href="/" className="block">
              <h1 className="text-2xl font-bold text-[#d11a68] hover:text-opacity-80 transition-colors">美活部</h1>
              <p className="text-xs text-gray-500">あなたのキレイを応援する美容メディア</p>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/media" className="text-sm text-gray-600 hover:text-[#d11a68] hidden md:block">美活部に掲載</a>
            {/* ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="メニューを開く"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Main Navigation - Desktop */}
        <nav className="hidden md:flex justify-center items-center py-3 space-x-1">
            {mainNavItems.map(item => {
                const getHref = (item: string) => {
                    switch (item) {
                        case 'シミ・くすみ': return '/category/spots-dullness';
                        case '毛穴': return '/category/pores';
                        case '赤み・赤ら顔': return '/category/redness';
                        case 'たるみ・しわ': return '/category/aging';
                        case 'ニキビ・ニキビ跡': return '/category/acne';
                        case '肌タイプ診断': return '/skin-diagnosis';
                        default: return '#';
                    }
                };

                return (
                    <a
                        key={item}
                        href={getHref(item)}
                        className={`text-center px-3 py-2 rounded-md text-sm font-medium w-36 ${
                            item === '肌タイプ診断'
                                ? 'text-[#d11a68] font-bold hover:bg-gray-100'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {item}
                    </a>
                );
            })}
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {mainNavItems.map(item => {
                const getHref = (item: string) => {
                  switch (item) {
                    case 'シミ・くすみ': return '/category/spots-dullness';
                    case '毛穴': return '/category/pores';
                    case '赤み・赤ら顔': return '/category/redness';
                    case 'たるみ・しわ': return '/category/aging';
                    case 'ニキビ・ニキビ跡': return '/category/acne';
                    case '肌タイプ診断': return '/skin-diagnosis';
                    default: return '#';
                  }
                };

                return (
                  <a
                    key={item}
                    href={getHref(item)}
                    className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      item === '肌タイプ診断'
                        ? 'text-[#d11a68] font-bold bg-pink-50 hover:bg-pink-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                );
              })}
              <a
                href="/media"
                className="px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 border-t pt-4 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                美活部に掲載
              </a>
            </div>
          </nav>
        )}
      </div>

       {/* Sub Navigation */}
       <div className="bg-gray-100">
        <div className="container mx-auto px-4 flex justify-end items-center py-2 space-x-6">
            {subNavItems.map(item => (
                <a key={item} href="#" className="text-gray-700 hover:text-[#d11a68] px-3 py-1 rounded-md text-sm font-semibold">{item}</a>
            ))}
        </div>
      </div>
    </header>
  );
};

export default Header;