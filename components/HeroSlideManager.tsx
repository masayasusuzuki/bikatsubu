import React, { useState, useEffect, useRef } from 'react';
import { articlesAPI, heroSlidesAPI, Article, HeroSlide as DBHeroSlide, CreateHeroSlide } from '../src/lib/supabase';

interface HeroSlide {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
  articleId?: string;
}

const HeroSlideManager: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const convertDBSlideToUISlide = (dbSlide: DBHeroSlide): HeroSlide => {
    return {
      id: dbSlide.id,
      imageUrl: dbSlide.image_url,
      alt: dbSlide.alt_text,
      order: dbSlide.order_position,
      articleId: dbSlide.article_id || undefined
    };
  };

  const convertUISlideToDBSlide = (uiSlide: HeroSlide): CreateHeroSlide => {
    return {
      image_url: uiSlide.imageUrl,
      alt_text: uiSlide.alt,
      order_position: uiSlide.order,
      article_id: uiSlide.articleId || null
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Try to load articles, use empty array if fails
      try {
        const articlesData = await articlesAPI.getAllArticles();
        setArticles(articlesData);
      } catch (articlesError) {
        console.warn('Failed to load articles:', articlesError);
        setArticles([]);
      }

      // Try to load slides, use fallback data if fails
      try {
        const slidesData = await heroSlidesAPI.getAllSlides();
        setSlides(slidesData.map(convertDBSlideToUISlide));
      } catch (slidesError) {
        console.warn('Failed to load hero slides, using fallback:', slidesError);
        // フォールバック用の仮データ
        setSlides([
          { id: 'temp-1', imageUrl: '/hero/samune1.png', alt: '美活部 - あなたのキレイを応援する美容メディア', order: 1, articleId: 'd660b75c-d62f-481e-8c46-3889527ecefd' },
          { id: 'temp-2', imageUrl: '/hero/samune2.png', alt: '美活部 - メイクアップ特集', order: 2, articleId: 'd4a59830-89c1-4974-9325-40f791a841e4' },
          { id: 'temp-3', imageUrl: 'https://source.unsplash.com/1200x500/?haircare,shiny,hair', alt: 'お悩み別ヘアケア診断', order: 3 },
        ]);
      }
    } catch (error) {
      console.error('データの読み込みに失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: 'new-' + Date.now(),
      imageUrl: '',
      alt: '',
      order: slides.length + 1,
      articleId: undefined
    };
    setEditingSlide(newSlide);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
  };

  const handleSaveSlide = async () => {
    if (!editingSlide) return;

    try {
      setSaving(true);

      if (editingSlide.id.startsWith('new-')) {
        // 新規スライドの追加
        const dbSlide = convertUISlideToDBSlide(editingSlide);
        const createdSlide = await heroSlidesAPI.createSlide(dbSlide);
        const uiSlide = convertDBSlideToUISlide(createdSlide);
        setSlides([...slides, uiSlide]);
      } else {
        // 既存スライドの更新
        const dbSlide = convertUISlideToDBSlide(editingSlide);
        await heroSlidesAPI.updateSlide(editingSlide.id, dbSlide);
        setSlides(slides.map(s => s.id === editingSlide.id ? editingSlide : s));
      }
      setEditingSlide(null);
    } catch (error) {
      console.error('スライドの保存に失敗:', error);
      alert('スライドの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('このスライドを削除しますか？')) return;

    try {
      setSaving(true);

      if (!id.startsWith('temp-')) {
        await heroSlidesAPI.deleteSlide(id);
      }
      setSlides(slides.filter(s => s.id !== id));
    } catch (error) {
      console.error('スライドの削除に失敗:', error);
      alert('スライドの削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingSlide) return;

    setIsUploading(true);
    try {
      // TODO: Cloudinaryにアップロード
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset'); // 実際のプリセット名に変更

      const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setEditingSlide({ ...editingSlide, imageUrl: data.secure_url });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const moveSlide = async (fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);

    // 順序を更新
    const updatedSlides = newSlides.map((slide, index) => ({
      ...slide,
      order: index + 1
    }));

    setSlides(updatedSlides);

    try {
      // データベースの順序も更新
      const orderUpdates = updatedSlides
        .filter(slide => !slide.id.startsWith('temp-') && !slide.id.startsWith('new-'))
        .map(slide => ({
          id: slide.id,
          order_position: slide.order
        }));

      if (orderUpdates.length > 0) {
        await heroSlidesAPI.updateSlidesOrder(orderUpdates);
      }
    } catch (error) {
      console.error('順序の更新に失敗:', error);
      // エラーが発生した場合はデータを再読み込み
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68]"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">ヒーロースライド管理</h3>
          <p className="text-sm text-gray-600 mt-1">トップページのメインスライド画像を管理します</p>
        </div>
        <button
          onClick={handleAddSlide}
          className="bg-[#d11a68] text-white px-4 py-2 text-sm font-medium hover:bg-pink-700 transition-colors rounded"
        >
          + スライド追加
        </button>
      </div>

      {/* スライド一覧 */}
      <div className="space-y-4">
        {slides.sort((a, b) => a.order - b.order).map((slide, index) => (
          <div key={slide.id} className="border border-gray-200 rounded p-4 flex items-center gap-4">
            {/* プレビュー画像 */}
            <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>

            {/* スライド情報 */}
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-800">{slide.alt || '（タイトルなし）'}</p>
              <p className="text-xs text-gray-500 mt-1">順序: {slide.order}</p>
              {slide.articleId && (
                <p className="text-xs text-blue-600 mt-1">
                  リンク先: {articles.find(a => a.id === slide.articleId)?.title || '記事が見つかりません'}
                </p>
              )}
            </div>

            {/* 操作ボタン */}
            <div className="flex items-center gap-2">
              {/* 順序変更 */}
              <button
                onClick={() => index > 0 && moveSlide(index, index - 1)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="上に移動"
              >
                ↑
              </button>
              <button
                onClick={() => index < slides.length - 1 && moveSlide(index, index + 1)}
                disabled={index === slides.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="下に移動"
              >
                ↓
              </button>

              {/* 編集・削除 */}
              <button
                onClick={() => handleEditSlide(slide)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors rounded"
              >
                編集
              </button>
              <button
                onClick={() => handleDeleteSlide(slide.id)}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors rounded"
              >
                削除
              </button>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🖼️</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">スライドがありません</h3>
            <p className="text-gray-500">「スライド追加」ボタンから最初のスライドを作成してください</p>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">
              {slides.find(s => s.id === editingSlide.id) ? 'スライド編集' : 'スライド追加'}
            </h4>

            <div className="space-y-4">
              {/* 画像URL入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL
                </label>
                <input
                  type="url"
                  value={editingSlide.imageUrl}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-[#d11a68] focus:border-[#d11a68] rounded"
                />
              </div>

              {/* 画像アップロード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  または画像をアップロード
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 rounded"
                >
                  {isUploading ? 'アップロード中...' : '画像を選択'}
                </button>
              </div>

              {/* ALTテキスト */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ALTテキスト（説明）
                </label>
                <input
                  type="text"
                  value={editingSlide.alt}
                  onChange={(e) => setEditingSlide({ ...editingSlide, alt: e.target.value })}
                  placeholder="画像の説明を入力"
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-[#d11a68] focus:border-[#d11a68] rounded"
                />
              </div>

              {/* 記事選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  リンク先記事（オプション）
                </label>
                <select
                  value={editingSlide.articleId || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, articleId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-[#d11a68] focus:border-[#d11a68] rounded"
                >
                  <option value="">記事を選択（リンクなし）</option>
                  {articles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title} - {article.category}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  選択した記事へのリンクがスライドに設定されます
                </p>
              </div>

              {/* プレビュー */}
              {editingSlide.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プレビュー
                  </label>
                  <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={editingSlide.imageUrl}
                      alt={editingSlide.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveSlide}
                disabled={!editingSlide.imageUrl || !editingSlide.alt || saving}
                className="px-4 py-2 text-sm bg-[#d11a68] text-white hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlideManager;