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
 * Cloudinary Admin APIを使用して画像を取得
 */
export async function fetchCloudinaryImages(): Promise<CloudinaryImage[]> {
  try {
    // セキュリティのため、フロントエンドからCloudinary Admin APIを直接呼び出すべきではない
    // しかし、デモ目的で実装を試す

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmxlepoau';
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    console.log('Cloudinary cloud name:', cloudName);

    // 認証情報が設定されていない場合は早期リターン
    if (!apiKey || !apiSecret) {
      console.warn('Cloudinary API認証情報が設定されていません');
      return [];
    }

    // 注意：これはセキュリティ上の理由で本番環境では推奨されません
    // 本来はサーバーサイドAPIエンドポイント経由で呼び出すべきです

    try {
      // Cloudinary Admin APIの直接呼び出しを試す
      const { v2: cloudinary } = await import('cloudinary');

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const result = await cloudinary.search
        .expression('resource_type:image')
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      return result.resources.map((resource: any) => ({
        public_id: resource.public_id,
        secure_url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        created_at: resource.created_at,
        bytes: resource.bytes,
      }));
    } catch (apiError) {
      console.error('Cloudinary Admin API Error:', apiError);

      // API呼び出しに失敗した場合、空配列を返す
      console.warn('Cloudinary Admin APIの呼び出しに失敗しました。フロントエンドから直接Admin APIを呼び出すことはセキュリティ上推奨されません。');
      return [];
    }

  } catch (error) {
    console.error('Failed to fetch Cloudinary images:', error);
    return [];
  }
}

/**
 * 実際のCloudinary Admin APIを使用する関数（バックエンド用）
 * この関数は適切なAPIエンドポイントで使用すべき
 */
export async function getAllCloudinaryImagesServer(apiKey: string, apiSecret: string): Promise<CloudinaryImage[]> {
  // この関数はサーバーサイドでのみ使用すべき
  // フロントエンドからAPIエンドポイント経由で呼び出す

  try {
    const { v2: cloudinary } = await import('cloudinary');

    cloudinary.config({
      cloud_name: 'dmxlepoau',
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      created_at: resource.created_at,
      bytes: resource.bytes,
    }));
  } catch (error) {
    console.error('Cloudinary API Error:', error);
    throw new Error('Failed to fetch images from Cloudinary');
  }
}