import React, { useState, useRef, useEffect } from 'react';
import { articlesAPI, CreateArticle } from '../src/lib/supabase';
import { fetchCloudinaryImages, CloudinaryImage, deleteCloudinaryImage } from '../src/api/cloudinary';
import { activityLogService } from '../services/activityLogService';
import { useSessionTimeout } from '../src/hooks/useSessionTimeout';
import { renderArticleContent } from '../utils/contentRenderer';
import { generateSEOMetadata } from '../services/geminiService';
import RichTextEditor, { RichTextEditorRef } from './RichTextEditor';
import ImageSelectorModal from './ImageSelectorModal';
import FeaturedImageModal from './FeaturedImageModal';

interface ArticleData {
  title: string;
  content: string;
  metaDescription: string;
  keywords: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  category2: string;
  articleType: string;
  brand: string;
  price: string;
  releaseDate: string;
  rating: number;
  scheduledPublishAt: string;
}

interface ArticleEditorProps {
  articleId?: string;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ articleId }) => {
  // セッションタイムアウト
  useSessionTimeout();

  const [article, setArticle] = useState<ArticleData>({
    title: '',
    content: '',
    metaDescription: '',
    keywords: '',
    slug: '',
    status: 'draft',
    featuredImage: '',
    featuredImageAlt: '',
    category: '',
    category2: '',
    articleType: 'article',
    brand: '',
    price: '',
    releaseDate: '',
    rating: 0,
    scheduledPublishAt: ''
  });

  const [isPreview, setIsPreview] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [cloudinaryImages, setCloudinaryImages] = useState<CloudinaryImage[]>([]);
  const [loadingCloudinary, setLoadingCloudinary] = useState(false);

  // 編集モードとプレビューモードのスクロール位置を独立管理
  const [editScrollTop, setEditScrollTop] = useState(0);
  const [previewScrollTop, setPreviewScrollTop] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const richTextEditorRef = useRef<RichTextEditorRef>(null);

  // モーダルの状態
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFeaturedImageModalOpen, setIsFeaturedImageModalOpen] = useState(false);

  // タブの状態管理
  const [activeTab, setActiveTab] = useState<'basic' | 'publish' | 'seo'>('basic');

  const isEditMode = Boolean(articleId);

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
    loadCloudinaryImages();
  }, [articleId]);

  const loadArticle = async () => {
    if (!articleId) return;

    try {
      setLoading(true);
      const data = await articlesAPI.getArticleById(articleId);

      // データベースから取得したUTC時刻をローカル時刻に変換
      let scheduledPublishAtLocal = '';
      if (data.scheduled_publish_at) {
        const utcDate = new Date(data.scheduled_publish_at);
        // datetime-local 入力用に "YYYY-MM-DDTHH:mm" 形式に変換
        const year = utcDate.getFullYear();
        const month = String(utcDate.getMonth() + 1).padStart(2, '0');
        const day = String(utcDate.getDate()).padStart(2, '0');
        const hours = String(utcDate.getHours()).padStart(2, '0');
        const minutes = String(utcDate.getMinutes()).padStart(2, '0');
        scheduledPublishAtLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
      }

      setArticle({
        title: data.title,
        content: data.content,
        metaDescription: data.meta_description || '',
        keywords: data.keywords || '',
        slug: data.slug,
        status: data.status,
        featuredImage: data.featured_image || '',
        featuredImageAlt: data.featured_image_alt || '',
        category: data.category || '',
        category2: data.category2 || '',
        articleType: data.article_type || 'article',
        brand: data.brand || '',
        price: data.price || '',
        releaseDate: data.release_date || '',
        rating: data.rating || 0,
        scheduledPublishAt: scheduledPublishAtLocal
      });
      
      // 記事読み込み時に保存状態をリセット
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('記事の読み込みに失敗:', error);
      alert('記事の読み込みに失敗しました');
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


  const wrapSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = article.content.substring(start, end) || 'テキスト';
    const newContent =
      article.content.substring(0, start) + before + selected + after + article.content.substring(end);
    setArticle(prev => ({ ...prev, content: newContent }));
    setTimeout(() => {
      const scrollTop = textarea.scrollTop;
      textarea.focus();
      const cursor = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(cursor, cursor);
      textarea.scrollTop = scrollTop;
    }, 0);
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = article.content.lastIndexOf('\n', start - 1) + 1;
    const newContent = article.content.substring(0, lineStart) + prefix + article.content.substring(lineStart);
    setArticle(prev => ({ ...prev, content: newContent }));
    setTimeout(() => {
      const scrollTop = textarea.scrollTop;
      textarea.focus();
      const pos = start + prefix.length;
      textarea.setSelectionRange(pos, pos);
      textarea.scrollTop = scrollTop;
    }, 0);
  };

  const insertImageTextLayout = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const template = '[image-text]![画像の説明](画像URLをここに貼り付け)|右側に表示する説明文をここに入力[/image-text]';
    const start = textarea.selectionStart;
    const newContent = article.content.substring(0, start) + '\n\n' + template + '\n\n' + article.content.substring(start);
    
    setArticle(prev => ({ ...prev, content: newContent }));
    setHasUnsavedChanges(true);
    
    setTimeout(() => {
      textarea.focus();
      const pos = start + 2 + template.indexOf('画像URLをここに貼り付け');
      textarea.setSelectionRange(pos, pos + '画像URLをここに貼り付け'.length);
    }, 0);
  };

  const insertAtMultipleLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      // 選択なしの場合は従来通り1行に挿入
      insertAtLineStart(prefix);
      return;
    }

    const selectedText = article.content.substring(start, end);
    const lines = selectedText.split('\n');

    let modifiedLines;
    if (prefix.includes('1. ')) {
      // 番号付きリストの場合は連番にする
      modifiedLines = lines.map((line, index) => `${index + 1}. ${line}`);
    } else {
      // 通常のリストの場合は同じプレフィックスを使用
      modifiedLines = lines.map(line => prefix + line);
    }

    const newSelectedText = modifiedLines.join('\n');

    const newContent = article.content.substring(0, start) + newSelectedText + article.content.substring(end);
    setArticle(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      const scrollTop = textarea.scrollTop;
      textarea.focus();
      const newEnd = start + newSelectedText.length;
      textarea.setSelectionRange(start, newEnd);
      textarea.scrollTop = scrollTop;
    }, 0);
  };


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // ファイルサイズチェック（5MB = 5 * 1024 * 1024 bytes）
    // Cloudinaryが自動的に最適化（JPEG変換・圧縮）するため5MBまで許可
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    setIsUploading(true);
    try {
      // 環境変数の確認
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmxlepoau';
      console.log('Cloud Name:', cloudName);
      console.log('All env vars:', import.meta.env);

      if (!cloudName) {
        throw new Error('VITE_CLOUDINARY_CLOUD_NAME が設定されていません');
      }

      // Cloudinaryにアップロード（WebP変換付き）
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      // アップロード時の自動変換設定
      // WebP形式で保存することで容量を約30-50%削減
      // 注意: eager transformationは変換済みバージョンを作成するだけで、
      // 元画像も保存されるため、完全な容量削減にはならない

      // 方法1: eager transformation（変換済みバージョンを生成）
      // formData.append('eager', 'w_2000,h_2000,c_limit,q_auto:good,f_webp');
      // formData.append('eager_async', 'true');

      // 方法2: incoming transformation（元画像自体を変換）
      // この場合、upload_presetで設定する必要がある
      // Cloudinaryダッシュボードで'ml_default'プリセットに以下を追加:
      // - Format: webp
      // - Quality: auto:good
      // - Resize: limit, 2000x2000

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload success:', data);
      const publicUrl = data.secure_url;

      setUploadedImages(prev => [...prev, publicUrl]);
      insertImageIntoContent(publicUrl);
    } catch (e) {
      alert('画像アップロードに失敗しました');
      console.error(e);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // ファイルサイズチェック（5MB = 5 * 1024 * 1024 bytes）
    // Cloudinaryが自動的に最適化（JPEG変換・圧縮）するため5MBまで許可
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = '';
      return;
    }
    
    setIsUploadingFeatured(true);

    try {
      // 環境変数の確認
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmxlepoau';
      console.log('Featured Image Cloud Name:', cloudName);

      if (!cloudName) {
        throw new Error('VITE_CLOUDINARY_CLOUD_NAME が設定されていません');
      }

      // Cloudinaryにアップロード（WebP変換付き）
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      // アップロード時の自動変換設定
      // WebP形式で保存することで容量を約30-50%削減
      // 注意: eager transformationは変換済みバージョンを作成するだけで、
      // 元画像も保存されるため、完全な容量削減にはならない

      // 方法1: eager transformation（変換済みバージョンを生成）
      // formData.append('eager', 'w_2000,h_2000,c_limit,q_auto:good,f_webp');
      // formData.append('eager_async', 'true');

      // 方法2: incoming transformation（元画像自体を変換）
      // この場合、upload_presetで設定する必要がある
      // Cloudinaryダッシュボードで'ml_default'プリセットに以下を追加:
      // - Format: webp
      // - Quality: auto:good
      // - Resize: limit, 2000x2000

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('Featured Image Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Featured Image Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Featured Image Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Featured Image Upload success:', data);
      const publicUrl = data.secure_url;

      setArticle(prev => ({ ...prev, featuredImage: publicUrl }));
    } catch (e) {
      alert('アイキャッチ画像のアップロードに失敗しました');
      console.error(e);
    } finally {
      setIsUploadingFeatured(false);
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = '';
    }
  };

  const insertImageIntoContent = (imageUrl: string) => {
    // RichTextEditorに画像を挿入
    if (richTextEditorRef.current) {
      richTextEditorRef.current.insertImage(imageUrl);
    }
  };

  // モーダルから画像を選択した時の処理
  const handleImageSelectFromModal = (imageUrl: string) => {
    insertImageIntoContent(imageUrl);
    setIsImageModalOpen(false);
  };

  // アイキャッチ画像をモーダルから選択した時の処理
  const handleFeaturedImageSelectFromModal = (imageUrl: string) => {
    setArticle(prev => ({ ...prev, featuredImage: imageUrl }));
    setIsFeaturedImageModalOpen(false);
  };

  // 目次生成機能
  const generateTableOfContents = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 記事内容から見出しを抽出（H1とH2のみ）
    const headingRegex = /^(#{1,2})\s+(.+)$/gm;
    const headings: { level: number; text: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(article.content)) !== null) {
      const level = match[1].length; // #の数
      // H3（###）は目次に含めない
      if (level > 2) continue;
      
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }

    if (headings.length === 0) {
      alert('見出し（# ##）が見つかりません。先に見出しを作成してください。');
      return;
    }

    // 目次のマークダウンを生成（専用の装飾タグを使用）
    let tocMarkdown = '\n<div class="table-of-contents">\n';
    tocMarkdown += '<div class="toc-title">📋 目次</div>\n';
    tocMarkdown += '<ul class="toc-list">\n';
    headings.forEach(heading => {
      tocMarkdown += `<li class="toc-level-${heading.level}"><a href="#${heading.id}">${heading.text}</a></li>\n`;
    });
    tocMarkdown += '</ul>\n';
    tocMarkdown += '</div>\n\n';

    // カーソル位置に目次を挿入
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent =
      article.content.substring(0, start) +
      tocMarkdown +
      article.content.substring(end);

    setArticle(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      const scrollTop = textarea.scrollTop;
      textarea.focus();
      textarea.setSelectionRange(
        start + tocMarkdown.length,
        start + tocMarkdown.length
      );
      textarea.scrollTop = scrollTop;
    }, 0);
  };

  // 装飾機能
  const applyDecoration = (type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = article.content.substring(start, end);

    if (!selectedText) {
      alert('装飾を適用するテキストを選択してください');
      return;
    }

    // 吹き出しはタイトル不要、その他はタイトル設定
    let title = '';
    if (type !== 'speech-bubble') {
      if (type === 'success') {
        title = '💡ミライのひとことアドバイス';
      } else if (type === 'info') {
        title = '本記事のテーマ';
      } else {
        // その他のタイプ（warning, error, quote）は従来通りプロンプト表示
        title = prompt('囲い線のタイトルを入力してください（空白可）:', '');
        if (title === null) return; // キャンセルされた場合
      }
    }

    const decorations = {
      'info': `<div class="decoration-info" data-title="${title}">${selectedText}</div>`,
      'warning': `<div class="decoration-warning" data-title="${title}">${selectedText}</div>`,
      'success': `<div class="decoration-success" data-title="${title}">${selectedText}</div>`,
      'error': `<div class="decoration-error" data-title="${title}">${selectedText}</div>`,
      'quote': `<div class="decoration-quote" data-title="${title}">${selectedText}</div>`,
      'speech-bubble': `<div class="decoration-speech-bubble" data-title="">${selectedText}</div>`
    };

    const decoratedText = decorations[type as keyof typeof decorations];
    if (!decoratedText) return;

    const newContent =
      article.content.substring(0, start) +
      decoratedText +
      article.content.substring(end);

    setArticle(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      const scrollTop = textarea.scrollTop;
      textarea.focus();
      const newPos = start + decoratedText.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.scrollTop = scrollTop;
    }, 0);
  };

  const generateSlug = (title: string) => {
    // 日本語タイトルの場合、日付ベースのSlugを生成
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(title);

    if (hasJapanese) {
      // 日本語が含まれる場合は日付ベースのSlugを生成
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      return `article-${year}${month}${day}-${hour}${minute}`;
    }

    // 英数字の場合は従来通り
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setArticle(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
    setHasUnsavedChanges(true);
  };

  const renderPreview = () => {
    // 共通関数を使用してプレビューをレンダリング
    const contentHtml = renderArticleContent(article.content).__html;
    
    // タイトルとアイキャッチ画像を含む完全なプレビューHTMLを生成
    return `
      <article class="bg-white border border-gray-200 p-6">
        <div class="mb-6">
          <a href="#" class="text-xs text-brand-primary">${article.category || 'カテゴリなし'}</a>
          <h1 class="text-3xl font-bold text-gray-900 mt-2">${article.title || 'タイトル未設定'}</h1>
          <div class="text-gray-500 text-sm mt-2">
            ${new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric'
            })}
          </div>
        </div>

        ${article.featuredImage ? `
          <div class="rounded overflow-hidden mb-6">
            <div class="relative bg-gray-100" style="padding-bottom: 52.36%">
              <img
                src="${article.featuredImage}"
                alt="${article.featuredImageAlt || article.title}"
                class="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        ` : ''}

        <div class="max-w-none" style="font-size: 16px; color: #374151;">
          ${contentHtml}
        </div>
      </article>
    `;
  };

  const handleGenerateSEO = async () => {
    if (!article.title || !article.content) {
      alert('タイトルと本文を入力してからSEOメタデータを生成してください');
      return;
    }

    setIsGeneratingSEO(true);
    try {
      const metadata = await generateSEOMetadata(article.title, article.content);
      setArticle(prev => ({
        ...prev,
        metaDescription: metadata.metaDescription,
        keywords: metadata.keywords
      }));
      setHasUnsavedChanges(true);
      alert('SEOメタデータを生成しました');
    } catch (error) {
      console.error('Error generating SEO metadata:', error);
      alert('SEOメタデータの生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published' | 'scheduled') => {
    if (!article.title || !article.content) {
      alert('タイトルと本文は必須です');
      return;
    }

    // 予約公開の場合、日時が設定されているかチェック
    if (status === 'scheduled' && !article.scheduledPublishAt) {
      alert('予約公開日時を設定してください');
      return;
    }

    // 予約公開日時が過去の場合はエラー
    if (status === 'scheduled' && article.scheduledPublishAt) {
      const scheduledDate = new Date(article.scheduledPublishAt);
      const now = new Date();
      if (scheduledDate <= now) {
        alert('予約公開日時は未来の日時を設定してください');
        return;
      }
    }

    // カテゴリのバリデーション
    if (!article.category && !article.category2) {
      alert('カテゴリ1またはカテゴリ2のうち、最低1つは選択してください');
      return;
    }

    // Slugが空の場合は再生成
    if (!article.slug) {
      const newSlug = generateSlug(article.title);
      setArticle(prev => ({ ...prev, slug: newSlug }));
      console.warn('Slugが空だったため再生成しました:', newSlug);
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // datetime-localの値をJSTからUTCに変換
      let scheduledPublishAtUTC: string | undefined = undefined;
      if (status === 'scheduled' && article.scheduledPublishAt) {
        // datetime-local の値は "2025-01-15T14:30" のような形式
        // これを日本時間として解釈し、UTC に変換する
        const localDate = new Date(article.scheduledPublishAt);
        scheduledPublishAtUTC = localDate.toISOString();
      }

      const articleData: CreateArticle = {
        title: article.title,
        content: article.content,
        meta_description: article.metaDescription,
        keywords: article.keywords,
        slug: article.slug,
        status,
        featured_image: article.featuredImage,
        featured_image_alt: article.featuredImageAlt || undefined,
        category: article.category,
        category2: article.category2,
        article_type: article.articleType,
        brand: article.brand || undefined,
        price: article.price || undefined,
        release_date: article.releaseDate || undefined,
        rating: article.rating || undefined,
        scheduled_publish_at: scheduledPublishAtUTC
      };

      let savedArticle;
      if (isEditMode) {
        savedArticle = await articlesAPI.updateArticle(articleId!, articleData);
        setSaveMessage(`記事を${status === 'draft' ? '下書きとして' : '公開して'}更新しました`);

        // アクティビティログを記録（更新）
        await activityLogService.logActivity({
          operationType: 'update',
          targetType: 'article',
          targetId: articleId!,
          targetTitle: article.title
        });
      } else {
        savedArticle = await articlesAPI.createArticle(articleData);
        setSaveMessage(`記事を${status === 'draft' ? '下書きとして' : '公開して'}保存しました`);

        // アクティビティログを記録（新規作成）
        await activityLogService.logActivity({
          operationType: 'create',
          targetType: 'article',
          targetId: savedArticle.id,
          targetTitle: article.title
        });
      }

      console.log('Saved article:', savedArticle);

      // 保存状態を更新
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      // 成功メッセージを表示
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    if (hasUnsavedChanges && confirm('変更が保存されていない可能性があります。戻りますか？')) {
      window.history.back();
    } else if (!hasUnsavedChanges) {
      window.history.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68] mx-auto"></div>
          <p className="mt-4 text-gray-600">記事を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                ← 記事管理に戻る
              </button>
              <h1 className="text-lg font-bold text-slate-800">
                {isEditMode ? '記事編集' : '新規記事作成'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {saveMessage && (
                <span className="text-green-600 text-sm font-medium">{saveMessage}</span>
              )}
              <button
                onClick={() => {
                  // 現在のページスクロール位置を保存
                  if (isPreview) {
                    setPreviewScrollTop(window.scrollY);
                  } else {
                    setEditScrollTop(window.scrollY);
                  }

                  setIsPreview(!isPreview);

                  // モード切り替え後にスクロール位置を復元
                  setTimeout(() => {
                    if (!isPreview) {
                      window.scrollTo(0, previewScrollTop);
                    } else {
                      window.scrollTo(0, editScrollTop);
                    }
                  }, 50);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 text-sm font-medium transition-colors"
                disabled={isSaving}
              >
                {isPreview ? '編集' : 'プレビュー'}
              </button>
              <button
                onClick={() => handleSave('draft')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '下書き保存'}
              </button>

              {/* 予約公開ボタン */}
              <button
                onClick={() => handleSave('scheduled')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isSaving || !article.scheduledPublishAt}
                title={!article.scheduledPublishAt ? '予約公開日時を設定してください' : ''}
              >
                {isSaving ? '保存中...' : '予約公開'}
              </button>

              <button
                onClick={() => handleSave('published')}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '即時公開'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-6 lg:px-8 py-8 pt-24">
        {isPreview ? (
          <div className="container mx-auto px-4 py-10 max-w-4xl">
            <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
          </div>
        ) : (
          <>
          {/* タブナビゲーション */}
          <div className="bg-white border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  基本設定
                </span>
              </button>
              <button
                onClick={() => setActiveTab('publish')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'publish'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  公開設定
                </span>
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'seo'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  SEO設定
                </span>
              </button>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="flex gap-6">
            {activeTab === 'basic' && (
              <div className="flex-1 space-y-6">
                {/* Title */}
                <div className="bg-white border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    記事タイトル
                  </label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="記事のタイトルを入力してください"
                    className="w-full px-3 py-2 border border-gray-300 text-lg focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>

              {/* Toolbar & Content Editor */}
              <div className="bg-white border border-gray-200 p-6">
              {/* Fixed Toolbar */}
              <div className="mb-4 pb-4 border-b border-gray-200 space-y-3">
                {/* Image Selection Button */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    画像を挿入
                  </button>
                  <span className="ml-2 text-xs text-gray-500">
                    ※ クリックして画像を選択またはアップロード
                  </span>
                </div>

                {/* Editor Toolbar Placeholder - Will be populated by RichTextEditor */}
                <div id="editor-toolbar-container" className="bg-gray-50 border border-gray-300 rounded p-2"></div>
              </div>

              {/* Scrollable Editor Area */}
              <div className="max-h-[700px] overflow-y-auto">
                <RichTextEditor
                  ref={richTextEditorRef}
                  content={article.content}
                  onChange={(newContent) => {
                    setArticle(prev => ({ ...prev, content: newContent }));
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="記事の内容を入力してください... ## で見出し、**太字**、*斜体* など"
                />
                </div>
              </div>
            )}

            {activeTab === 'publish' && (
              <div className="flex-1 space-y-6">
              {/* Publication Settings */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-slate-700 mb-4 pb-2 border-b border-gray-100">
                  公開設定
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      記事タイプ
                    </label>
                    <select
                      value={article.articleType}
                      onChange={(e) => setArticle(prev => ({ ...prev, articleType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    >
                      <option value="article">通常記事</option>
                      <option value="event">イベント・その他</option>
                      <option value="survey">調査レポート</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      カテゴリ1 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={article.category}
                      onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    >
                      <option value="">選択してください</option>
                      <option value="シミ・くすみ">シミ・くすみ</option>
                      <option value="毛穴">毛穴</option>
                      <option value="ニキビ・ニキビ跡">ニキビ・ニキビ跡</option>
                      <option value="赤み・赤ら顔">赤み・赤ら顔</option>
                      <option value="乾燥・皮むけ">乾燥・皮むけ</option>
                      <option value="たるみ・しわ">たるみ・しわ</option>
                      <option value="アンチエイジング">アンチエイジング</option>
                      <option value="肌育">肌育</option>
                      <option value="美容ニュース">美容ニュース</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      カテゴリ2 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={article.category2}
                      onChange={(e) => setArticle(prev => ({ ...prev, category2: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    >
                      <option value="">選択してください</option>
                      <option value="国内">国内</option>
                      <option value="海外">海外</option>
                      <option value="ホームケア">ホームケア</option>
                      <option value="最新機器">最新機器</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      ※ カテゴリ1とカテゴリ2のうち、最低1つは選択してください
                    </p>
                  </div>

                  {/* 予約公開日時 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      予約公開日時
                    </label>
                    <input
                      type="datetime-local"
                      value={article.scheduledPublishAt}
                      onChange={(e) => setArticle(prev => ({ ...prev, scheduledPublishAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      設定すると「予約公開」ボタンが有効になります
                    </p>
                    {article.scheduledPublishAt && (
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        {new Date(article.scheduledPublishAt).toLocaleString('ja-JP')} に公開予定
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      アイキャッチ画像URL
                    </label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={article.featuredImage}
                        onChange={(e) => setArticle(prev => ({ ...prev, featuredImage: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />

                      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                        <label className="flex items-center text-sm font-bold text-amber-900 mb-2">
                          <span className="text-xl mr-2">⚠️</span>
                          アイキャッチ画像のalt属性（代替テキスト）
                        </label>
                        <input
                          type="text"
                          value={article.featuredImageAlt}
                          onChange={(e) => setArticle(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                          placeholder="画像の説明を入力してください"
                          className="w-full px-3 py-2 border-2 border-amber-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white rounded"
                        />
                        <p className="text-xs text-amber-800 mt-2 font-medium">
                          💡 SEOとアクセシビリティ向上のため、画像の内容を説明するテキストを必ず入力してください
                        </p>
                      </div>

                      {/* 画像選択ボタン */}
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsFeaturedImageModalOpen(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          画像を選択
                        </button>
                        <span className="text-xs text-gray-500">または上記URLを直接入力</span>
                      </div>

                      {/* ファイルアップロード注意書き */}
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                        <strong>注意:</strong> アップロードされた画像は自動的に1.91:1の比率（1200×628px相当）で表示されます。上下が切り取られる場合があります。
                      </div>

                      {/* 画像プレビュー */}
                      {article.featuredImage && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-slate-600 mb-2">プレビュー (1.91:1で表示されます)</label>
                          <div className="border border-gray-200 rounded overflow-hidden max-w-sm">
                            <div className="relative bg-gray-100" style={{ paddingBottom: '52.36%' }}>
                              <img
                                src={article.featuredImage}
                                alt={article.featuredImageAlt || "アイキャッチ画像プレビュー"}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">画像を読み込めません</div>';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cosmetics Settings - only show when articleType is 'cosmetic' (legacy) */}
              {article.articleType === 'cosmetic' && (
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-slate-700 mb-4 pb-2 border-b border-gray-100">
                    コスメ情報
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ブランド名
                      </label>
                      <input
                        type="text"
                        value={article.brand}
                        onChange={(e) => setArticle(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="例: 資生堂"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        価格
                      </label>
                      <input
                        type="text"
                        value={article.price}
                        onChange={(e) => setArticle(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="例: ¥3,980"
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        発売日
                      </label>
                      <input
                        type="date"
                        value={article.releaseDate}
                        onChange={(e) => setArticle(prev => ({ ...prev, releaseDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        評価 (1-5)
                      </label>
                      <select
                        value={article.rating}
                        onChange={(e) => setArticle(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                      >
                        <option value={0}>評価なし</option>
                        <option value={1}>★☆☆☆☆ (1)</option>
                        <option value={1.5}>★★☆☆☆ (1.5)</option>
                        <option value={2}>★★☆☆☆ (2)</option>
                        <option value={2.5}>★★★☆☆ (2.5)</option>
                        <option value={3}>★★★☆☆ (3)</option>
                        <option value={3.5}>★★★★☆ (3.5)</option>
                        <option value={4}>★★★★☆ (4)</option>
                        <option value={4.5}>★★★★★ (4.5)</option>
                        <option value={5}>★★★★★ (5)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="flex-1 space-y-6">
                {/* SEO Settings with Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-blue-300">
                  <h3 className="flex items-center text-lg font-bold text-blue-900">
                  <span className="text-2xl mr-2">🎯</span>
                  SEO設定（重要）
                </h3>
                  <button
                    type="button"
                    onClick={handleGenerateSEO}
                    disabled={isGeneratingSEO || !article.title || !article.content}
                    className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                      isGeneratingSEO || !article.title || !article.content
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isGeneratingSEO ? (
                      <>
                        <span className="animate-spin mr-2">⚙️</span>
                        生成中...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        Gemini生成
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: SEO Input Fields */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <label className="flex items-center text-sm font-bold text-blue-900 mb-2">
                        <span className="mr-2">🔗</span>
                        URL スラッグ
                      </label>
                      <input
                        type="text"
                        value={article.slug}
                        onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="article-url-slug"
                        className="w-full px-3 py-2 border-2 border-blue-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded"
                      />
                      <div className="mt-1 text-xs text-blue-700 font-medium">
                        URL: /articles/{article.slug}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <label className="flex items-center text-sm font-bold text-blue-900 mb-2">
                        <span className="mr-2">📝</span>
                        メタディスクリプション
                      </label>
                      <textarea
                        value={article.metaDescription}
                        onChange={(e) => setArticle(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="検索結果に表示される記事の説明文（155文字以内推奨）"
                        rows={3}
                        maxLength={160}
                        className="w-full px-3 py-2 border-2 border-blue-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded"
                      />
                      <div className="mt-1 text-xs text-blue-700 font-medium">
                        {article.metaDescription.length}/160文字
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <label className="flex items-center text-sm font-bold text-blue-900 mb-2">
                        <span className="mr-2">🏷️</span>
                        キーワード
                      </label>
                      <input
                        type="text"
                        value={article.keywords}
                        onChange={(e) => setArticle(prev => ({ ...prev, keywords: e.target.value }))}
                        placeholder="スキンケア, 美容液, 保湿"
                        className="w-full px-3 py-2 border-2 border-blue-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded"
                      />
                      <div className="mt-1 text-xs text-blue-700 font-medium">
                        カンマ区切りで入力
                      </div>
                    </div>
                    <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-xs text-blue-900 font-semibold">
                        💡 検索エンジン最適化のため、すべての項目を入力することを強く推奨します
                      </p>
                    </div>
                  </div>

                  {/* Right: SEO Preview */}
                  <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                    <h4 className="text-sm font-bold text-blue-900 mb-4 pb-2 border-b border-blue-200">
                      🔍 検索結果プレビュー
                    </h4>
                    <div className="space-y-2">
                      <div className="text-blue-600 text-sm hover:underline cursor-pointer">
                        {article.title || 'タイトルを入力してください'}
                      </div>
                      <div className="text-green-700 text-xs">
                        https://bikatsu-bu.com/articles/{article.slug || 'url-slug'}
                      </div>
                      <div className="text-gray-700 text-sm leading-5">
                        {(() => {
                          const description = article.metaDescription || 'メタディスクリプションを入力してください';
                          const maxLength = 155; // Googleの推奨文字数
                          if (description.length <= maxLength) {
                            return description;
                          }
                          // 155文字で切って「...」を追加
                          return description.substring(0, maxLength) + '...';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* 画像選択モーダル */}
    <ImageSelectorModal
      isOpen={isImageModalOpen}
      onClose={() => setIsImageModalOpen(false)}
      onSelect={handleImageSelectFromModal}
      cloudinaryImages={cloudinaryImages}
      isLoadingImages={loadingCloudinary}
      onUpload={async (file: File) => {
        // ダミーのイベントオブジェクトを作成
        const dummyEvent = {
          target: {
            files: [file],
            value: ''
          }
        } as any;
        await handleImageUpload(dummyEvent);
        // 画像リストを再読み込み
        await loadCloudinaryImages();
      }}
    />

    {/* アイキャッチ画像選択モーダル */}
    <FeaturedImageModal
      isOpen={isFeaturedImageModalOpen}
      onClose={() => setIsFeaturedImageModalOpen(false)}
      onSelect={handleFeaturedImageSelectFromModal}
      cloudinaryImages={cloudinaryImages}
      currentImage={article.featuredImage}
      onUpload={async (file: File) => {
        // ダミーのイベントオブジェクトを作成
        const dummyEvent = {
          target: {
            files: [file],
            value: ''
          }
        } as any;
        await handleFeaturedImageUpload(dummyEvent);
        // 画像リストを再読み込み
        await loadCloudinaryImages();
      }}
    />
    </>
  );
};

export default ArticleEditor;
