import React from 'react';

const Header: React.FC = () => {
    const mainNavItems = ['シミ・くすみ', '毛穴', '赤み・赤ら顔', 'たるみ・しわ', 'ニキビ・ニキビ跡', '肌タイプ診断'];
    const subNavItems: string[] = [];
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
          <div className="flex items-center space-x-4 text-sm">
            <a href="/media" className="text-gray-600 hover:text-[#d11a68]">美活部に掲載</a>
            <a href="/login" className="bg-[#d11a68] text-white font-bold py-2 px-4 rounded hover:bg-opacity-90">新規登録/ログイン</a>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex justify-center items-center py-3 space-x-1">
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