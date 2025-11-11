/**
 * Cloudinary画像最適化ユーティリティ
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'pad';
  dpr?: 'auto' | number;
  blur?: number;
}

/**
 * Cloudinary URLを高度に最適化
 */
export const optimizeCloudinaryUrlAdvanced = (
  url: string,
  options: ImageOptimizationOptions = {}
): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    dpr = 'auto',
    blur
  } = options;

  // パラメータを構築
  const params: string[] = [];

  // フォーマット（WebP/AVIF自動選択）
  params.push(`f_${format}`);

  // 品質
  params.push(`q_${quality}`);

  // サイズ
  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);

  // クロップモード
  params.push(`c_${crop}`);

  // デバイスピクセル比
  params.push(`dpr_${dpr}`);

  // ぼかし効果（プレースホルダー用）
  if (blur) params.push(`e_blur:${blur}`);

  // 既存のupload/以降のパラメータを削除
  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/').pop()?.replace(/^[^/]*\//, '') || '';

  return `${baseUrl}/upload/${params.join(',')}/${imagePath}`;
};

/**
 * 低品質プレースホルダー画像URL生成（LQIP）
 */
export const generateLQIP = (url: string): string => {
  if (url.includes('cloudinary.com')) {
    return optimizeCloudinaryUrlAdvanced(url, {
      width: 40,
      quality: 30,
      blur: 1000,
      format: 'jpg'
    });
  }
  return url;
};

/**
 * レスポンシブ画像のsrcset生成
 */
export const generateSrcSet = (url: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1536, 1920]): string => {
  if (!url) return '';

  return sizes
    .map(size => {
      const optimizedUrl = optimizeAnyImageUrl(url, size, Math.round(size * 0.75));
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
};

// 既存の関数（後方互換性のため維持）
export const optimizeCloudinaryUrl = (url: string, width: number, height: number): string => {
  return optimizeCloudinaryUrlAdvanced(url, { width, height });
};

export const optimizeAnyImageUrl = (url: string, width: number, height: number): string => {
  if (!url) return url;

  // Cloudinary URLの場合は専用の最適化を適用
  if (url.includes('cloudinary.com')) {
    return optimizeCloudinaryUrl(url, width, height);
  }

  // Unsplash URLの場合は既存のパラメータを更新
  if (url.includes('images.unsplash.com')) {
    // 既存のパラメータを削除して新しいサイズを適用
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format,compress`;
  }

  // その他のURLはそのまま返す
  return url;
};

/**
 * 画像フォーマットのサポートチェック
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
};

export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('image/avif') === 5;
};