/**
 * Cloudinary画像最適化ユーティリティ
 */

export const optimizeCloudinaryUrl = (url: string, width: number, height: number): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
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
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format`;
  }

  // その他のURLはそのまま返す
  return url;
};