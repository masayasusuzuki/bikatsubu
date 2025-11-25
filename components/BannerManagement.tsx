import React, { useState, useEffect } from 'react';
import { bannersAPI, Banner, CreateBanner } from '../src/lib/supabase';
import { fetchCloudinaryImages, CloudinaryImage } from '../src/api/cloudinary';
import ImageSelectorModal from './ImageSelectorModal';

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [cloudinaryImages, setCloudinaryImages] = useState<CloudinaryImage[]>([]);
  const [loadingCloudinary, setLoadingCloudinary] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState<CreateBanner>({
    name: '',
    image_url: '',
    link_url: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    loadBanners();
    loadCloudinaryImages();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannersAPI.getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error('バナーの読み込みに失敗:', error);
      alert('バナーの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadCloudinaryImages = async () => {
    try {
      setLoadingCloudinary(true);
      const images = await fetchCloudinaryImages();
      setCloudinaryImages(images);
    } catch (error) {
      console.error('Cloudinary画像の読み込みに失敗:', error);
    } finally {
      setLoadingCloudinary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.image_url || !formData.link_url) {
      alert('バナー名、画像URL、リンク先URLは必須です');
      return;
    }

    try {
      if (editingBanner) {
        await bannersAPI.updateBanner(editingBanner.id, formData);
        alert('バナーを更新しました');
      } else {
        await bannersAPI.createBanner(formData);
        alert('バナーを作成しました');
      }

      resetForm();
      await loadBanners();
    } catch (error) {
      console.error('バナーの保存に失敗:', error);
      alert('バナーの保存に失敗しました');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      image_url: banner.image_url,
      link_url: banner.link_url,
      is_active: banner.is_active,
      display_order: banner.display_order
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このバナーを削除しますか？')) return;

    try {
      await bannersAPI.deleteBanner(id);
      alert('バナーを削除しました');
      await loadBanners();
    } catch (error) {
      console.error('バナーの削除に失敗:', error);
      alert('バナーの削除に失敗しました');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await bannersAPI.updateBanner(banner.id, { is_active: !banner.is_active });
      await loadBanners();
    } catch (error) {
      console.error('ステータスの更新に失敗:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image_url: '',
      link_url: '',
      is_active: true,
      display_order: banners.length
    });
    setEditingBanner(null);
    setIsEditing(false);
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
    setIsImageModalOpen(false);
  };

  // 画像アップロード処理
  const handleImageUpload = async (file: File) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmxlepoau';
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', 'ml_default');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    setFormData(prev => ({ ...prev, image_url: data.secure_url }));
    await loadCloudinaryImages();
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6 pb-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">バナー管理</h2>
          {!isEditing && (
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  image_url: '',
                  link_url: '',
                  is_active: true,
                  display_order: banners.length
                });
                setIsEditing(true);
              }}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              新規作成
            </button>
          )}
        </div>
      </div>

      {/* 新規作成・編集フォーム */}
      {isEditing && (
        <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-slate-700 mb-4">
            {editingBanner ? 'バナーを編集' : '新規バナー作成'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                バナー名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例: 春のキャンペーンバナー"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                バナー画像URL <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  画像を選択
                </button>
              </div>
              {formData.image_url && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">プレビュー:</p>
                  <img
                    src={formData.image_url}
                    alt="バナープレビュー"
                    className="max-w-md h-auto border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                リンク先URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://example.com/campaign"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                表示順
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="w-32 px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                />
                <span className="text-sm font-medium text-slate-700">有効にする</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 text-sm font-medium transition-colors"
              >
                {editingBanner ? '更新' : '作成'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 text-sm font-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* バナー一覧 */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                プレビュー
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                バナー名
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                リンク先
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                表示順
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                    <span className="ml-2 text-sm sm:text-base text-slate-600">読み込み中...</span>
                  </div>
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-slate-500">
                  バナーがありません
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <img
                      src={banner.image_url}
                      alt={banner.name}
                      className="w-32 h-auto border border-gray-200 rounded"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-sm font-medium text-slate-900">{banner.name}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block max-w-[200px]"
                    >
                      {banner.link_url}
                    </a>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-sm text-slate-600">{banner.display_order}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <label className="inline-flex items-center">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={banner.is_active}
                          onChange={() => handleToggleActive(banner)}
                        />
                        <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors cursor-pointer ${
                          banner.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}>
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform ${
                            banner.is_active ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </div>
                      <span className={`ml-2 text-xs font-medium whitespace-nowrap ${
                        banner.is_active ? 'text-emerald-800' : 'text-gray-600'
                      }`}>
                        {banner.is_active ? '有効' : '無効'}
                      </span>
                    </label>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-slate-600 hover:text-slate-800 text-xs sm:text-sm font-medium text-left"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium text-left"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 画像選択モーダル */}
      <ImageSelectorModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={handleImageSelect}
        cloudinaryImages={cloudinaryImages}
        isLoadingImages={loadingCloudinary}
        onUpload={handleImageUpload}
      />
    </div>
  );
};

export default BannerManagement;
