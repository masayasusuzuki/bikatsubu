export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
}

/**
 * フロントエンド用のAPI関数
 * Supabase記事テーブルからCloudinary画像を取得
 */
export async function fetchCloudinaryImages(): Promise<CloudinaryImage[]> {
  try {
    console.log('=== Cloudinary Image Fetch from Supabase ===');

    // 動的インポートでsupabase関数を取得
    const { articlesAPI } = await import('../lib/supabase');

    // Supabaseから記事のCloudinary画像を取得
    const dbImages = await articlesAPI.getCloudinaryImages();

    console.log(`Found ${dbImages.length} Cloudinary images in articles`);

    // CloudinaryImageFromDB を CloudinaryImage に変換
    const cloudinaryImages: CloudinaryImage[] = dbImages.map(dbImage => {
      const { publicId, width, height, format } = extractCloudinaryInfo(dbImage.image_url);

      return {
        public_id: publicId,
        secure_url: dbImage.image_url,
        width,
        height,
        format,
        created_at: dbImage.created_at,
        bytes: 0, // データベースにはサイズ情報がないため0に設定
      };
    });

    console.log(`Converted to ${cloudinaryImages.length} CloudinaryImage objects`);
    return cloudinaryImages;

  } catch (error) {
    console.error('Failed to fetch Cloudinary images from Supabase:', error);
    return [];
  }
}

/**
 * Cloudinary画像を削除
 */
export async function deleteCloudinaryImage(imageUrl: string): Promise<boolean> {
  try {
    console.log('=== Deleting Cloudinary Image ===');
    console.log('Image URL:', imageUrl);

    const { publicId } = extractCloudinaryInfo(imageUrl);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmxlepoau';

    // Cloudinaryの削除はサーバーサイドで行う必要があるため、
    // ここではSupabaseのメタデータのみ削除します
    const { imageMetadataAPI } = await import('../lib/supabase');

    // 画像メタデータを削除
    await imageMetadataAPI.deleteImageMetadata(imageUrl);

    console.log('Image metadata deleted successfully');
    return true;

  } catch (error) {
    console.error('Failed to delete Cloudinary image:', error);
    return false;
  }
}

/**
 * Cloudinary URLから情報を抽出
 */
function extractCloudinaryInfo(url: string): {
  publicId: string;
  width: number;
  height: number;
  format: string;
} {
  try {
    // URL例: https://res.cloudinary.com/dmxlepoau/image/upload/v1640000000/sample.jpg
    // または: https://res.cloudinary.com/dmxlepoau/image/upload/c_fill,w_400,h_300/sample.jpg

    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // public_idを抽出（拡張子を除く）
    const publicId = fileName.includes('.')
      ? fileName.substring(0, fileName.lastIndexOf('.'))
      : fileName;

    // 拡張子を抽出
    const format = fileName.includes('.')
      ? fileName.substring(fileName.lastIndexOf('.') + 1)
      : 'jpg';

    // URLからサイズを抽出（変換パラメータがある場合）
    const widthMatch = url.match(/w_(\d+)/);
    const heightMatch = url.match(/h_(\d+)/);

    const width = widthMatch ? parseInt(widthMatch[1]) : 400;
    const height = heightMatch ? parseInt(heightMatch[1]) : 300;

    return {
      publicId,
      width,
      height,
      format
    };
  } catch (error) {
    console.error('Failed to extract Cloudinary info from URL:', url, error);
    return {
      publicId: `unknown_${Date.now()}`,
      width: 400,
      height: 300,
      format: 'jpg'
    };
  }
}

