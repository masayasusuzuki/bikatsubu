import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean; // trueの場合は遅延読み込みをしない
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onClick?: () => void;
}

/**
 * Cloudinary URLを最適化する
 * @param url - 元のURL
 * @param width - 幅
 * @param quality - 品質（デフォルト: auto）
 */
const optimizeCloudinaryUrl = (url: string, width: number, quality: string = 'auto'): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // 既存のupload/以降のパラメータを削除
  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/').pop()?.replace(/^[^/]*\//, '') || '';

  // Cloudinaryの変換パラメータを追加
  // f_auto: 最適なフォーマット（WebP/AVIF）を自動選択
  // q_auto: 最適な品質を自動選択
  // dpr_auto: デバイスピクセル比を自動検出
  // c_limit: アスペクト比を維持しながらサイズ制限
  return `${baseUrl}/upload/f_auto,q_${quality},w_${width},c_limit,dpr_auto/${imagePath}`;
};

/**
 * Unsplash URLを最適化する
 */
const optimizeUnsplashUrl = (url: string, width: number): string => {
  if (!url || !url.includes('images.unsplash.com')) {
    return url;
  }

  const baseUrl = url.split('?')[0];
  return `${baseUrl}?w=${width}&fit=crop&auto=format,compress`;
};

/**
 * 任意の画像URLを最適化する
 */
const optimizeImageUrl = (url: string, width: number): string => {
  if (!url) return url;

  if (url.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(url, width);
  }

  if (url.includes('images.unsplash.com')) {
    return optimizeUnsplashUrl(url, width);
  }

  return url;
};

/**
 * 最適化された画像コンポーネント
 * - レスポンシブ画像（srcset）対応
 * - 遅延読み込み（Intersection Observer）
 * - WebP/AVIF自動変換（Cloudinary）
 * - プレースホルダー表示
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  priority = false,
  objectFit = 'cover',
  onClick
}) => {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // レスポンシブ画像のブレークポイント
  const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];

  // srcsetを生成
  const generateSrcSet = (): string => {
    if (!src) return '';

    return breakpoints
      .map(bp => `${optimizeImageUrl(src, bp)} ${bp}w`)
      .join(', ');
  };

  // Intersection Observerで遅延読み込み
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // 50px手前から読み込み開始
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // エラー時のフォールバック画像
  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // デフォルトのフォールバック画像
  const fallbackSrc = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop&auto=format';

  // 画像のスタイル
  const imgStyle: React.CSSProperties = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto'
  };

  // プレースホルダーのスタイル
  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    display: isLoaded ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // 画像URLを決定
  const imageSrc = hasError ? fallbackSrc : src;
  const optimizedSrc = optimizeImageUrl(imageSrc, width || 800);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
      onClick={onClick}
    >
      {/* プレースホルダー */}
      <div style={placeholderStyle}>
        <div className="animate-pulse">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* メイン画像 */}
      {isInView && (
        <picture>
          {/* WebP版（Cloudinaryのf_autoで自動対応） */}
          <source
            type="image/webp"
            srcSet={generateSrcSet()}
            sizes={sizes}
          />

          {/* フォールバック画像 */}
          <img
            ref={imgRef}
            src={optimizedSrc}
            srcSet={generateSrcSet()}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            style={imgStyle}
            className={className}
          />
        </picture>
      )}

      {/* 非表示の場合のプレースホルダー */}
      {!isInView && (
        <div ref={imgRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

export default OptimizedImage;