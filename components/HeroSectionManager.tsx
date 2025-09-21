import React, { useState, useEffect, useRef } from 'react';
import { articlesAPI, heroSlidesAPI, Article, HeroSlide as DBHeroSlide, CreateHeroSlide } from '../src/lib/supabase';

interface HeroSlideUI {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
  articleId?: string;
}

const HeroSectionManager: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlideUI[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlideUI | null>(null);

  // 固定で5枚のスライド
  const HERO_SLIDES_COUNT = 5;

  useEffect(() => {
    loadData();
  }, []);

  const convertDBSlideToUI = (dbSlide: DBHeroSlide): HeroSlideUI => {
    return {
      id: dbSlide.id,
      imageUrl: dbSlide.image_url,
      alt: dbSlide.alt_text,
      order: dbSlide.order_position,
      articleId: dbSlide.article_id || undefined
    };
  };

  const convertUISlideToDB = (uiSlide: HeroSlideUI): CreateHeroSlide => {
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

      // 記事データ取得
      try {
        const articlesData = await articlesAPI.getAllArticles();
        setArticles(articlesData);
      } catch (articlesError) {
        console.warn('Failed to load articles:', articlesError);
        setArticles([]);
      }

      // ヒーロースライドデータ取得
      try {
        const slidesData = await heroSlidesAPI.getAllSlides();
        const uiSlides = slidesData.map(convertDBSlideToUI);

        // 5枚になるように調整
        const adjustedSlides = Array.from({ length: HERO_SLIDES_COUNT }, (_, index) => {
          const existingSlide = uiSlides.find(s => s.order === index + 1);
          return existingSlide || {
            id: `placeholder-${index + 1}`,
            imageUrl: '',
            alt: '',
            order: index + 1,
            articleId: undefined
          };
        });

        setSlides(adjustedSlides);
      } catch (slidesError) {
        console.warn('Failed to load hero slides, using fallback:', slidesError);
        // フォールバック用データ（空のスライド）
        setSlides([
          { id: 'temp-1', imageUrl: '', alt: '', order: 1, articleId: undefined },
          { id: 'temp-2', imageUrl: '', alt: '', order: 2, articleId: undefined },
          { id: 'temp-3', imageUrl: '', alt: '', order: 3, articleId: undefined },
          { id: 'temp-4', imageUrl: '', alt: '', order: 4, articleId: undefined },
          { id: 'temp-5', imageUrl: '', alt: '', order: 5, articleId: undefined },
        ]);
      }
    } catch (error) {
      console.error('データの読み込みに失敗:', error);
      setMessage('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlide = (slide: HeroSlideUI) => {
    setEditingSlide({ ...slide });
  };

  const handleSaveSlide = async () => {
    if (!editingSlide) return;

    console.log('=== Hero Slide Save Debug ===');
    console.log('Editing slide:', editingSlide);

    try {
      setSaving(true);

      if (editingSlide.id.startsWith('placeholder-') || editingSlide.id.startsWith('temp-')) {
        // 新規スライドの作成
        console.log('Creating new slide...');
        const dbSlide = convertUISlideToDB(editingSlide);
        console.log('DB slide data:', dbSlide);

        const createdSlide = await heroSlidesAPI.createSlide(dbSlide);
        console.log('Created slide:', createdSlide);

        const uiSlide = convertDBSlideToUI(createdSlide);
        setSlides(slides.map(s => s.order === editingSlide.order ? uiSlide : s));
      } else {
        // 既存スライドの更新
        console.log('Updating existing slide...');
        const dbSlide = convertUISlideToDB(editingSlide);
        console.log('DB slide data:', dbSlide);

        const updatedSlide = await heroSlidesAPI.updateSlide(editingSlide.id, dbSlide);
        console.log('Updated slide:', updatedSlide);
        
        const uiSlide = convertDBSlideToUI(updatedSlide);
        setSlides(slides.map(s => s.id === editingSlide.id ? uiSlide : s));
      }

      setEditingSlide(null);
      setMessage('スライドを保存しました');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('=== Save Error Details ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      setMessage(`スライドの保存に失敗しました: ${error.message}`);
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
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
          <h3 className="text-lg font-semibold text-slate-700">1. ヒーローセクション管理</h3>
          <p className="text-sm text-gray-600 mt-1">トップページのメインスライド画像を管理します（5枚固定）</p>
        </div>

      </div>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${
          message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* スライド一覧 */}
      <div className="grid grid-cols-1 gap-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="border border-gray-200 rounded p-4 flex items-center gap-4">
            {/* 順序表示 */}
            <div className="flex-shrink-0 w-8 h-8 bg-[#d11a68] text-white rounded-full flex items-center justify-center text-sm font-medium">
              {slide.order}
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                画像URL: {slide.imageUrl ? slide.imageUrl.substring(0, 50) + '...' : '未設定'}
              </p>
              {slide.articleId && (
                <p className="text-xs text-blue-600 mt-1">
                  リンク先: {articles.find(a => a.id === slide.articleId)?.title || '記事が見つかりません'}
                </p>
              )}
            </div>

            {/* 編集ボタン */}
            <button
              onClick={() => handleEditSlide(slide)}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors rounded"
            >
              編集
            </button>
          </div>
        ))}
      </div>

      {/* 編集モーダル */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">
              スライド {editingSlide.order} を編集
            </h4>

            <div className="space-y-4">
              {/* サムネイル設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  サムネイル画像URL
                </label>
                <input
                  type="url"
                  value={editingSlide.imageUrl}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-[#d11a68] focus:border-[#d11a68] rounded"
                />
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

export default HeroSectionManager;