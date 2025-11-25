import React, { useState, useEffect, useCallback } from 'react';
import { CloudinaryImage } from '../src/api/cloudinary';
import OptimizedImage from './OptimizedImage';

interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  cloudinaryImages: CloudinaryImage[];
  isLoadingImages: boolean;
  onUpload?: (file: File) => Promise<void>;
  selectedImage?: string;
}

const ImageSelectorModal: React.FC<ImageSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  cloudinaryImages,
  isLoadingImages,
  onUpload,
  selectedImage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'recent' | 'all'>('recent');
  const [localSelectedImage, setLocalSelectedImage] = useState<string>(selectedImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 最近使用した画像（仮実装 - 実際はlocalStorageなどから取得）
  const recentImages = cloudinaryImages.slice(0, 8);

  // 検索フィルタリング
  const filteredImages = cloudinaryImages.filter(img =>
    img.public_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.secure_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayImages = selectedTab === 'recent' ? recentImages : filteredImages;

  // モーダルが開いたときに選択状態をリセット
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedImage(selectedImage || '');
      setSearchTerm('');
      setSelectedTab('recent');
    }
  }, [isOpen, selectedImage]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // ファイルアップロード処理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    // ファイルサイズチェック（20MB）
    if (file.size > 20 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。20MB以下のファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // プログレスシミュレーション（実際のアップロードでは進捗をトラッキング）
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // アップロード完了後、少し待ってからリセット
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('画像のアップロードに失敗しました。');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setLocalSelectedImage(imageUrl);
  };

  const handleConfirmSelection = () => {
    if (localSelectedImage) {
      onSelect(localSelectedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col pointer-events-auto">

          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">画像を選択</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ツールバー */}
          <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
            {/* 検索 */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="画像を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* タブ切り替え */}
            <div className="flex bg-white rounded-lg border">
              <button
                onClick={() => setSelectedTab('recent')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  selectedTab === 'recent'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                最近使用
              </button>
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  selectedTab === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                すべて
              </button>
            </div>

            {/* アップロードボタン */}
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
                    <span>新規アップロード</span>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* アップロード進捗バー */}
          {isUploading && (
            <div className="px-6 py-2 bg-blue-50">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 画像グリッド */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoadingImages ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto mb-4" />
                  <p className="text-gray-500">画像を読み込んでいます...</p>
                </div>
              </div>
            ) : displayImages.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">画像が見つかりません</p>
                  <p className="text-sm text-gray-400 mt-2">新規アップロードから画像を追加してください</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayImages.map((image) => (
                  <div
                    key={image.public_id}
                    onClick={() => handleImageSelect(image.secure_url)}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
                      localSelectedImage === image.secure_url
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
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>

                    {/* 選択チェックマーク */}
                    {localSelectedImage === image.secure_url && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                        <div className="bg-white rounded-full p-2">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* ホバー時の詳細 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{image.public_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              {localSelectedImage && '1つの画像を選択中'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!localSelectedImage}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  localSelectedImage
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                画像を挿入
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageSelectorModal;