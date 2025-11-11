import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* ロゴ部分 */}
        <div className="mb-8">
          <div className="mb-2 flex justify-center">
            <img 
              src="/header/logo.png" 
              alt="美活部" 
              className="h-16 w-auto animate-pulse"
            />
          </div>
          <p className="text-sm text-gray-500 tracking-wider">BEAUTY ACTIVE CLUB</p>
        </div>

        {/* ローディングアニメーション */}
        <div className="relative">
          {/* 外側のリング */}
          <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin border-t-[#d11a68] mx-auto"></div>

          {/* 中央のドット */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* ローディングテキスト */}
        <p className="text-gray-600 mt-6 text-sm animate-pulse">
          最新情報に更新中
        </p>

        {/* 装飾的な要素 */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-pink-300 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute bottom-32 right-24 w-1 h-1 bg-purple-300 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-32 right-32 w-1.5 h-1.5 bg-pink-200 rounded-full animate-bounce opacity-50" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;