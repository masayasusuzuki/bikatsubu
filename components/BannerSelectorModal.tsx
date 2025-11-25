import React, { useState, useEffect } from 'react';
import { bannersAPI, Banner } from '../src/lib/supabase';
import OptimizedImage from './OptimizedImage';

interface BannerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (banner: Banner) => void;
}

const BannerSelectorModal: React.FC<BannerSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBanners();
      setSelectedBanner(null);
    }
  }, [isOpen]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannersAPI.getActiveBanners();
      setBanners(data);
    } catch (error) {
      console.error('バナーの読み込みに失敗:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleConfirmSelection = () => {
    if (selectedBanner) {
      onSelect(selectedBanner);
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
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col pointer-events-auto">

          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">バナーを選択</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 説明 */}
          <div className="px-6 py-3 bg-blue-50 border-b">
            <p className="text-sm text-blue-700">
              挿入したいバナーを選択してください。バナーは中サイズで記事内に表示されます。
            </p>
          </div>

          {/* バナーグリッド */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto mb-4" />
                  <p className="text-gray-500">バナーを読み込んでいます...</p>
                </div>
              </div>
            ) : banners.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">有効なバナーがありません</p>
                  <p className="text-sm text-gray-400 mt-2">管理画面のバナー管理からバナーを追加してください</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    onClick={() => setSelectedBanner(banner)}
                    className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                      selectedBanner?.id === banner.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="p-4">
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-3">
                        <OptimizedImage
                          src={banner.image_url}
                          alt={banner.name}
                          width={400}
                          height={225}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-800 truncate">{banner.name}</h3>
                        <p className="text-xs text-gray-500 truncate">
                          リンク先: {banner.link_url}
                        </p>
                      </div>
                    </div>

                    {/* 選択チェックマーク */}
                    {selectedBanner?.id === banner.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              {selectedBanner && `「${selectedBanner.name}」を選択中`}
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
                disabled={!selectedBanner}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedBanner
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                バナーを挿入
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerSelectorModal;
