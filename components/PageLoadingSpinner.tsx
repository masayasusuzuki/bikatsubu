import React from 'react';

const PageLoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-brand-primary"></div>
        <p className="mt-4 text-gray-600">ページを読み込んでいます...</p>
      </div>
    </div>
  );
};

export default PageLoadingSpinner;