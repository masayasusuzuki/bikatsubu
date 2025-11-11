import React, { useState, useEffect } from 'react';
import { CloudinaryImage } from '../src/api/cloudinary';
import OptimizedImage from './OptimizedImage';

interface FeaturedImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  cloudinaryImages: CloudinaryImage[];
  currentImage?: string;
  onUpload?: (file: File) => Promise<void>;
}

const FeaturedImageModal: React.FC<FeaturedImageModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  cloudinaryImages,
  currentImage,
  onUpload
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 検索フィルタリング
  const filteredImages = cloudinaryImages.filter(img =>
    img.public_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(currentImage || '');
      setSearchTerm('');
    }
  }, [isOpen, currentImage]);

  // ファイルアップロード処理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      setIsUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('画像のアップロードに失敗しました。');
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col pointer-events-auto">

          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">アイキャッチ画像を選択</h2>
              <p className="text-sm text-gray-500 mt-1">記事の顔となる画像を選択してください</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* プレビューエリア */}
          {selectedImage && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <div className="w-48 rounded-lg overflow-hidden shadow-md bg-gray-100 flex items-center justify-center" style={{ height: '108px' }}>
                  <OptimizedImage
                    src={selectedImage}
                    alt="選択中の画像"
                    width={192}
                    height={108}
                    className="w-full h-full object-contain"
                    sizes="192px"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">選択中の画像</p>
                  <p className="text-xs text-gray-500 truncate">{selectedImage}</p>
                </div>
                <button
                  onClick={() => setSelectedImage('')}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  選択解除
                </button>
              </div>
            </div>
          )}

          {/* 検索・アップロード */}
          <div className="flex items-center gap-4 p-4 border-b">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="画像を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <label className="relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}>
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>アップロード中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>アップロード</span>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* 画像グリッド */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.public_id}
                  onClick={() => setSelectedImage(image.secure_url)}
                  className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImage === image.secure_url
                      ? 'ring-4 ring-blue-500 scale-95'
                      : 'hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <OptimizedImage
                      src={image.secure_url}
                      alt={image.public_id}
                      width={320}
                      height={180}
                      className="w-full h-full object-contain"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  {selectedImage === image.secure_url && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white rounded-full p-2">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* フッター */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedImage}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedImage
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              この画像を使用
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturedImageModal;