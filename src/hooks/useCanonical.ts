import { useEffect } from 'react';

/**
 * ページのcanonicalタグを動的に設定するカスタムフック
 * @param url - 正規URL（フルパス）
 */
export function useCanonical(url: string) {
  useEffect(() => {
    // 既存のcanonicalタグを削除
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // 新しいcanonicalタグを追加
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = url;
    document.head.appendChild(canonicalLink);

    // クリーンアップ関数
    return () => {
      const currentCanonical = document.querySelector('link[rel="canonical"]');
      if (currentCanonical && currentCanonical.getAttribute('href') === url) {
        currentCanonical.remove();
      }
    };
  }, [url]);
}
