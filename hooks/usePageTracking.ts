import { useEffect } from 'react';

// Google Analytics ページビュー追跡フック
export const usePageTracking = () => {
  useEffect(() => {
    const trackPageView = () => {
      const path = window.location.pathname;
      const title = document.title;

      // Google Analyticsにページビューを送信
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', 'G-XWX8QJBS9X', {
          page_path: path,
          page_title: title,
        });

        console.log('GA Page View Tracked:', { path, title });
      }
    };

    // 初回ロード時
    trackPageView();

    // URLが変更された時を検知（履歴API使用時）
    const handlePopState = () => {
      trackPageView();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};

// TypeScript用のgtag型定義
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: {
        page_path?: string;
        page_title?: string;
      }
    ) => void;
  }
}
