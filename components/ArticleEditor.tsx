import React, { useState, useRef, useEffect } from 'react';
import { articlesAPI, CreateArticle, imageFoldersAPI, imageMetadataAPI, ImageFolder } from '../src/lib/supabase';
import { fetchCloudinaryImages, CloudinaryImage, deleteCloudinaryImage } from '../src/api/cloudinary';
import { activityLogService } from '../services/activityLogService';
import { useSessionTimeout } from '../src/hooks/useSessionTimeout';
import { renderArticleContent } from '../utils/contentRenderer';
import { generateSEOMetadata } from '../services/geminiService';

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

  // Image folder management state
  const [folders, setFolders] = useState<ImageFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | undefined>(undefined);

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

  const isEditMode = Boolean(articleId);

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
    loadCloudinaryImages();
    loadFolders();
  }, [articleId]);

  const loadArticle = async () => {
    if (!articleId) return;

    try {
      setLoading(true);
      const data = await articlesAPI.getArticleById(articleId);

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
        scheduledPublishAt: data.scheduled_publish_at || ''
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

  const loadFolders = async () => {
    try {
      const loadedFolders = await imageFoldersAPI.getAllFolders();
      setFolders(loadedFolders);
    } catch (error) {
      console.error('フォルダの読み込みに失敗:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('フォルダ名を入力してください');
      return;
    }
    try {
      await imageFoldersAPI.createFolder(newFolderName.trim());
      setNewFolderName('');
      await loadFolders();
    } catch (error) {
      console.error('フォルダの作成に失敗:', error);
      alert('フォルダの作成に失敗しました');
    }
  };

  const handleMoveImages = async (targetFolderId: string | null) => {
    if (selectedImages.size === 0) {
      alert('移動する画像を選択してください');
      return;
    }
    try {
      await imageMetadataAPI.moveMultipleImages(Array.from(selectedImages), targetFolderId);
      setSelectedImages(new Set());
      await loadFolders();
      alert('画像を移動しました');
    } catch (error) {
      console.error('画像の移動に失敗:', error);
      alert('画像の移動に失敗しました');
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageUrl)) {
        newSet.delete(imageUrl);
      } else {
        newSet.add(imageUrl);
      }
      return newSet;
    });
  };

  // ドラッグ&ドロップハンドラー
  const handleDragStart = (e: React.DragEvent, imageUrl: string) => {
    // 選択中の画像があれば、それらをまとめてドラッグ
    // なければ、この画像だけをドラッグ
    const imagesToDrag = selectedImages.has(imageUrl) && selectedImages.size > 0
      ? Array.from(selectedImages)
      : [imageUrl];

    e.dataTransfer.setData('imageUrls', JSON.stringify(imagesToDrag));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(undefined);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(undefined);

    try {
      const imageUrls = JSON.parse(e.dataTransfer.getData('imageUrls'));

      if (!imageUrls || imageUrls.length === 0) return;

      await imageMetadataAPI.moveMultipleImages(imageUrls, targetFolderId);
      setSelectedImages(new Set());
      await loadFolders();

      // 成功メッセージ
      const folderName = targetFolderId
        ? folders.find(f => f.id === targetFolderId)?.name
        : 'すべての画像';
      alert(`${imageUrls.length}枚の画像を「${folderName}」に移動しました`);
    } catch (error) {
      console.error('画像の移動に失敗:', error);
      alert('画像の移動に失敗しました');
    }
  };

  const getFilteredImages = async () => {
    if (selectedFolderId === null) {
      return cloudinaryImages;
    }

    try {
      const metadata = await imageMetadataAPI.getMetadataByFolder(selectedFolderId);
      const imageUrlsInFolder = new Set(metadata.map(m => m.image_url));
      return cloudinaryImages.filter(img => imageUrlsInFolder.has(img.secure_url));
    } catch (error) {
      console.error('フォルダ画像のフィルタリングに失敗:', error);
      return cloudinaryImages;
    }
  };

  const [filteredImages, setFilteredImages] = useState<CloudinaryImage[]>([]);

  useEffect(() => {
    const loadFilteredImages = async () => {
      const filtered = await getFilteredImages();
      setFilteredImages(filtered);
    };
    loadFilteredImages();
  }, [selectedFolderId, cloudinaryImages]);

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    if (!confirm(`フォルダ「${folder.name}」を削除しますか？\n※フォルダ内の画像は「未分類」に移動されます`)) {
      return;
    }

    try {
      await imageFoldersAPI.deleteFolder(folderId);
      await loadFolders();
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      alert('フォルダを削除しました');
    } catch (error) {
      console.error('フォルダの削除に失敗:', error);
      alert('フォルダの削除に失敗しました');
    }
  };

  const handleDeleteImages = async () => {
    if (selectedImages.size === 0) {
      alert('削除する画像を選択してください');
      return;
    }

    if (!confirm(`選択した${selectedImages.size}枚の画像を削除しますか？\n※この操作は取り消せません`)) {
      return;
    }

    try {
      // 画像メタデータを一括削除
      await imageMetadataAPI.deleteMultipleImages(Array.from(selectedImages));

      // 選択をクリア
      setSelectedImages(new Set());

      // 画像リストを再読み込み
      await loadCloudinaryImages();
      await loadFolders();

      alert('画像を削除しました');
    } catch (error) {
      console.error('画像の削除に失敗:', error);
      alert('画像の削除に失敗しました');
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
    
    // ファイルサイズチェック（1MB = 1 * 1024 * 1024 bytes）
    if (file.size > 1 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。1MB以下のファイルを選択してください。');
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

      // Cloudinaryにアップロード
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

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
    
    // ファイルサイズチェック（1MB = 1 * 1024 * 1024 bytes）
    if (file.size > 1 * 1024 * 1024) {
      alert('ファイルサイズが大きすぎます。1MB以下のファイルを選択してください。');
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

      // Cloudinaryにアップロード
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

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
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const imageMarkdown = `\n![画像の説明](${imageUrl})\n`;

      const newContent =
        article.content.substring(0, start) +
        imageMarkdown +
        article.content.substring(end);

      setArticle(prev => ({ ...prev, content: newContent }));

      setTimeout(() => {
        const scrollTop = textarea.scrollTop;
        textarea.focus();
        textarea.setSelectionRange(
          start + imageMarkdown.length,
          start + imageMarkdown.length
        );
        textarea.scrollTop = scrollTop;
      }, 0);
    }
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
          <a href="#" class="text-xs text-[#d11a68]">${article.category || 'カテゴリなし'}</a>
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
        scheduled_publish_at: status === 'scheduled' && article.scheduledPublishAt ? article.scheduledPublishAt : undefined
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

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-24">
        {isPreview ? (
          <div className="container mx-auto px-4 py-10 max-w-4xl">
            <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
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

              {/* Content Editor */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="mb-4">
                  <div className="flex flex-col gap-2">
                    {/* 1行目：装飾タグ関連 */}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => insertAtLineStart('# ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H1</button>
                      <button onClick={() => insertAtLineStart('## ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H2</button>
                      <button onClick={() => insertAtLineStart('### ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H3</button>
                      <button onClick={() => wrapSelection('**', '**')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">太字</button>
                      <button onClick={() => insertAtMultipleLines('- ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">• リスト</button>
                      <button onClick={() => insertAtMultipleLines('1. ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">1. リスト</button>
                      <button onClick={() => wrapSelection('[', '](https://)')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">リンク</button>
                      <button onClick={() => insertAtLineStart('---\n')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">——</button>
                    </div>

                    {/* 2行目：囲いタグ関連 */}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => applyDecoration('info')} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs border border-blue-300 rounded">💡 本記事のテーマ</button>
                      <button onClick={() => applyDecoration('warning')} className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs border border-yellow-300 rounded">⚠️ 注意</button>
                      <button onClick={() => applyDecoration('success')} className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs border border-green-300 rounded">💡ミライのひとことアドバイス</button>
                      <button onClick={() => applyDecoration('error')} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs border border-red-300 rounded">❌ 警告</button>
                      <button onClick={() => applyDecoration('quote')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs border border-gray-300 rounded">💬 引用</button>
                      <button onClick={() => applyDecoration('speech-bubble')} className="px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs border border-pink-300 rounded">💭 吹き出し</button>
                    </div>

                    {/* 3行目：画像関連 */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 text-sm font-medium transition-colors"
                        disabled={isUploading}
                      >
                        {isUploading ? 'アップロード中...' : '画像をアップロード'}
                      </button>
                      <button
                        onClick={insertImageTextLayout}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1 text-sm font-medium rounded transition-colors shadow-md"
                        title="左側に画像、右側に説明文を配置するレイアウトを挿入"
                      >
                        🖼️ 画像+テキストレイアウト
                      </button>
                      <a
                        href="https://www.iloveimg.com/ja/compress-image"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm font-medium rounded transition-colors"
                      >
                        画像変換サイト
                      </a>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={article.content}
                  onChange={(e) => {
                    setArticle(prev => ({ ...prev, content: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="記事の内容を入力してください。画像を挿入するには上の「画像をアップロード」ボタンを使用してください。"
                  rows={35}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500 font-mono"
                />
                <div className="mt-2 text-xs text-slate-500">
                  画像は ![説明](URL) の形式で挿入されます。アップロードボタンを使用すると自動で挿入されます。
                </div>
              </div>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-4">アップロード済み画像</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-slate-500">
                          画像プレビュー
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(url)}
                          className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          URLをコピー
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cloudinary画像ライブラリ */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-slate-700">
                    Cloudinary画像ライブラリ
                    <span className="ml-2 text-xs text-gray-500">({filteredImages.length}件)</span>
                  </h3>
                  <button
                    onClick={loadCloudinaryImages}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    disabled={loadingCloudinary}
                  >
                    {loadingCloudinary ? '読み込み中...' : '🔄 更新'}
                  </button>
                </div>

                {/* Folder management UI */}
                <div className="mb-6 flex gap-4" style={{ minHeight: '600px' }}>
                  {/* Folder list on left */}
                  <div className="w-56 bg-gray-50 border border-gray-200 rounded p-3 flex flex-col" style={{ height: '600px' }}>
                    <div className="text-xs font-semibold text-gray-700 mb-2">フォルダ</div>
                    <div className="space-y-1 flex-1 overflow-y-auto mb-3">
                      <button
                        onClick={() => setSelectedFolderId(null)}
                        onDragOver={(e) => handleDragOver(e, null)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, null)}
                        className={`w-full text-left text-xs px-2 py-1 rounded transition-all ${
                          dragOverFolderId === null
                            ? 'bg-green-200 text-green-900 font-bold ring-2 ring-green-400'
                            : selectedFolderId === null
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        📁 すべての画像 ({cloudinaryImages.length})
                      </button>
                      {folders.map(folder => (
                        <div key={folder.id} className="flex items-center gap-1 group">
                          <button
                            onClick={() => setSelectedFolderId(folder.id)}
                            onDragOver={(e) => handleDragOver(e, folder.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, folder.id)}
                            className={`flex-1 text-left text-xs px-2 py-1 rounded transition-all ${
                              dragOverFolderId === folder.id
                                ? 'bg-green-200 text-green-900 font-bold ring-2 ring-green-400'
                                : selectedFolderId === folder.id
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            📁 {folder.name} ({folder.image_count || 0})
                          </button>
                          <button
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-1 transition-opacity"
                            title="削除"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* New folder creation */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">新規フォルダ</div>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="フォルダ名"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2"
                      />
                      <button
                        onClick={handleCreateFolder}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition-colors"
                      >
                        + 作成
                      </button>
                    </div>
                  </div>

                  {/* Image grid on right */}
                  <div className="flex-1 overflow-y-auto" style={{ height: '600px' }}>
                    {/* Move images dropdown */}
                    {selectedImages.size > 0 && (
                      <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded p-3 sticky top-0 z-10">
                        <span className="text-xs text-blue-700 font-medium">
                          {selectedImages.size}枚選択中
                        </span>
                        <select
                          onChange={(e) => handleMoveImages(e.target.value || null)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="">フォルダに移動...</option>
                          {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleDeleteImages}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          🗑️ 削除
                        </button>
                        <button
                          onClick={() => setSelectedImages(new Set())}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          選択解除
                        </button>
                      </div>
                    )}

                    {filteredImages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                        {filteredImages.map((image) => (
                          <div
                            key={image.public_id}
                            className="relative group cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, image.secure_url)}
                          >
                            {/* Checkbox for selection */}
                            <div className="absolute top-3 left-3 z-20">
                              <input
                                type="checkbox"
                                checked={selectedImages.has(image.secure_url)}
                                onChange={() => toggleImageSelection(image.secure_url)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                              />
                            </div>

                            <div className="aspect-video bg-gray-100 border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              <img
                                src={image.secure_url}
                                alt={image.public_id}
                                className="w-full h-full object-cover pointer-events-none"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-slate-500">画像を読み込めません</div>';
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                              <div className="flex gap-2 pointer-events-auto">
                                <div className="relative group/copy">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(image.secure_url);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded shadow transition-all hover:scale-105"
                                  >
                                    📋
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/copy:opacity-100 transition-opacity pointer-events-none">
                                    URLをコピー
                                  </div>
                                </div>
                                <div className="relative group/insert">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      insertImageIntoContent(image.secure_url);
                                    }}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded shadow transition-all hover:scale-105"
                                  >
                                    ➕
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/insert:opacity-100 transition-opacity pointer-events-none">
                                    本文に挿入
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        {loadingCloudinary ? 'Cloudinary画像を読み込み中...' : 'このフォルダには画像がありません'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Settings Sidebar */}
            <div className="space-y-6">
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

                      {/* ファイルアップロード */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          ref={featuredImageInputRef}
                          onChange={handleFeaturedImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => featuredImageInputRef.current?.click()}
                          disabled={isUploadingFeatured}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium border border-gray-300 disabled:opacity-50 transition-colors"
                        >
                          {isUploadingFeatured ? 'アップロード中...' : 'ファイルを選択'}
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

              {/* SEO Settings */}
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
                </div>
                <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                  <p className="text-xs text-blue-900 font-semibold">
                    💡 検索エンジン最適化のため、すべての項目を入力することを強く推奨します
                  </p>
                </div>
              </div>

              {/* SEO Preview */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-slate-700 mb-4 pb-2 border-b border-gray-100">
                  検索結果プレビュー
                </h3>
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
    </div>
  );
};

export default ArticleEditor;
