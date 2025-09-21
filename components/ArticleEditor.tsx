import React, { useState, useRef, useEffect } from 'react';
import { articlesAPI, CreateArticle } from '../src/lib/supabase';
import { fetchCloudinaryImages, CloudinaryImage } from '../src/api/cloudinary';

interface ArticleData {
  title: string;
  content: string;
  metaDescription: string;
  keywords: string;
  slug: string;
  status: 'draft' | 'published';
  featuredImage: string;
  category: string;
  category2: string;
  articleType: string;
  brand: string;
  price: string;
  releaseDate: string;
  rating: number;
}

interface ArticleEditorProps {
  articleId?: string;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ articleId }) => {
  const [article, setArticle] = useState<ArticleData>({
    title: '',
    content: '',
    metaDescription: '',
    keywords: '',
    slug: '',
    status: 'draft',
    featuredImage: '',
    category: '',
    category2: '',
    articleType: 'article',
    brand: '',
    price: '',
    releaseDate: '',
    rating: 0
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
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
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
        category: data.category || '',
        category2: data.category2 || '',
        articleType: data.article_type || 'article',
        brand: data.brand || '',
        price: data.price || '',
        releaseDate: data.release_date || '',
        rating: data.rating || 0
      });
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
    setIsUploading(true);
    try {
      // 環境変数の確認
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmxlepoau';
      console.log('Cloud Name:', cloudName);
      console.log('All env vars:', process.env);

      if (!cloudName) {
        throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME が設定されていません');
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
    setIsUploadingFeatured(true);

    try {
      // 環境変数の確認
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmxlepoau';
      console.log('Featured Image Cloud Name:', cloudName);

      if (!cloudName) {
        throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME が設定されていません');
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

    // 記事内容から見出しを抽出
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const headings: { level: number; text: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(article.content)) !== null) {
      const level = match[1].length; // #の数
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }

    if (headings.length === 0) {
      alert('見出し（# ## ###）が見つかりません。先に見出しを作成してください。');
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
  };

  const renderPreview = () => {
    let htmlContent = article.content;

    // 自動目次生成（記事内容から見出しを抽出して冒頭に挿入）
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const headings: { level: number; text: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(htmlContent)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      // HTMLで使用されるIDと同じ生成ロジックを使用
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }

    // 見出しが2個以上ある場合のみ目次を自動生成
    if (headings.length >= 2) {
      const tocItems = headings.map((heading, index) => {
        const indent = (heading.level - 1) * 16;
        const fontSize = heading.level === 1 ? '14px' : heading.level === 2 ? '13px' : '12px';
        const fontWeight = heading.level === 1 ? '700' : heading.level === 2 ? '600' : '500';
        const color = heading.level === 1 ? '#1e293b' : heading.level === 2 ? '#475569' : '#64748b';
        const marginTop = index === 0 ? '0' : (heading.level === 1 ? '1px' : '0px');
        const levelIcon = heading.level === 1 ? '📍' : heading.level === 2 ? '▸' : '•';

        return `<li style="margin: ${marginTop} 0 0 ${indent}px; padding: 0; line-height: 1; display: block;">
          <a href="#${heading.id}" style="color: ${color}; text-decoration: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-size: ${fontSize}; font-weight: ${fontWeight}; display: flex; align-items: center; padding: 2px 6px; border-radius: 4px; position: relative;" onclick="event.preventDefault(); document.getElementById('${heading.id}')?.scrollIntoView({behavior: 'smooth', block: 'start'});" onmouseover="this.style.color='#2563eb'; this.style.backgroundColor='#f1f5f9'; this.style.transform='translateX(2px)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)';" onmouseout="this.style.color='${color}'; this.style.backgroundColor='transparent'; this.style.transform='translateX(0)'; this.style.boxShadow='none';"><span style="margin-right: 6px; font-size: 10px; opacity: 0.7;">${levelIcon}</span>${heading.text}</a>
        </li>`;
      }).join('');

      const autoToc = `<div style="background: linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px; margin: 24px auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05); max-width: 750px; width: fit-content; min-width: 400px; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899); opacity: 0.6;"></div>
        <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #cbd5e1; letter-spacing: 0.3px; display: flex; align-items: center;"><span style="margin-right: 8px; font-size: 16px;">📋</span>目次</div>
        <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.2;">${tocItems}</ul>
      </div>`;

      // 最初の見出しの前に目次を挿入
      const firstHeadingMatch = htmlContent.match(/^#{1,3}\s+.+$/m);
      if (firstHeadingMatch) {
        const firstHeadingIndex = htmlContent.indexOf(firstHeadingMatch[0]);
        htmlContent = htmlContent.substring(0, firstHeadingIndex) + autoToc + '\n\n' + htmlContent.substring(firstHeadingIndex);
      }
    }

    // 古い手動目次タグを除去
    htmlContent = htmlContent.replace(/<div class="table-of-contents">[\s\S]*?<\/div>/g, '');

    // 装飾ボックスの処理（エスケープ前に実行）
    htmlContent = htmlContent.replace(/<div class="decoration-info" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #1d4ed8;">${title}</div>` : '';
        return `<div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 16px 0; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 6px solid #1d4ed8; color: #1e3a8a;">${titleHtml}${content}</div>`;
      });

    htmlContent = htmlContent.replace(/<div class="decoration-warning" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #d97706;">${title}</div>` : '';
        return `<div style="border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 16px 0; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 6px solid #d97706; color: #78350f;">${titleHtml}${content}</div>`;
      });

    htmlContent = htmlContent.replace(/<div class="decoration-success" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #047857;">${title}</div>` : '';
        return `<div style="border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin: 16px 0; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 6px solid #047857; color: #064e3b;">${titleHtml}${content}</div>`;
      });

    htmlContent = htmlContent.replace(/<div class="decoration-error" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #dc2626;">${title}</div>` : '';
        return `<div style="border: 2px solid #ef4444; border-radius: 8px; padding: 16px; margin: 16px 0; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 6px solid #dc2626; color: #7f1d1d;">${titleHtml}${content}</div>`;
      });

    htmlContent = htmlContent.replace(/<div class="decoration-quote" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #374151;">${title}</div>` : '';
        return `<div style="border: 2px solid #6b7280; border-radius: 8px; padding: 16px; margin: 16px 0; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-left: 6px solid #374151; color: #4b5563; font-style: italic;">${titleHtml}${content}</div>`;
      });

    htmlContent = htmlContent.replace(/<div class="decoration-speech-bubble" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: white;">${title}</div>` : '';
        return `<div style="position: relative; background: linear-gradient(135deg, #e91e63 0%, #d81b60 100%); color: white; padding: 2px 12px; border-radius: 8px; margin: 2px 0; box-shadow: 0 1px 3px rgba(233, 30, 99, 0.2); max-width: 300px; display: inline-block; line-height: 1.2; font-size: 14px;">
          ${titleHtml}${content}
          <div style="position: absolute; bottom: -4px; left: 16px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #d81b60;"></div>
        </div>`;
      });


    // Escape basic HTML after decoration processing
    htmlContent = htmlContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Re-convert the processed decoration and table HTML back to valid HTML
    htmlContent = htmlContent.replace(/&lt;div style="([^"]*)"&gt;/g, '<div style="$1">');
    htmlContent = htmlContent.replace(/&lt;div class="([^"]*)"&gt;/g, '<div class="$1">');
    htmlContent = htmlContent.replace(/&lt;\/div&gt;/g, '</div>');
    htmlContent = htmlContent.replace(/&lt;span style="([^"]*)"&gt;/g, '<span style="$1">');
    htmlContent = htmlContent.replace(/&lt;\/span&gt;/g, '</span>');
    htmlContent = htmlContent.replace(/&lt;strong style="([^"]*)"&gt;/g, '<strong style="$1">');
    htmlContent = htmlContent.replace(/&lt;\/strong&gt;/g, '</strong>');
    htmlContent = htmlContent.replace(/&lt;ul style="([^"]*)"&gt;/g, '<ul style="$1">');
    htmlContent = htmlContent.replace(/&lt;ul class="([^"]*)"&gt;/g, '<ul class="$1">');
    htmlContent = htmlContent.replace(/&lt;\/ul&gt;/g, '</ul>');
    htmlContent = htmlContent.replace(/&lt;li style="([^"]*)"&gt;/g, '<li style="$1">');
    htmlContent = htmlContent.replace(/&lt;li class="([^"]*)"&gt;/g, '<li class="$1">');
    htmlContent = htmlContent.replace(/&lt;\/li&gt;/g, '</li>');

    // aタグの復元（目次のリンクなど）
    htmlContent = htmlContent.replace(/&lt;a ([^&]*)&gt;/g, (match, attributes) => {
      // クォートも復元
      const restoredAttributes = attributes.replace(/&quot;/g, '"');
      return `<a ${restoredAttributes}>`;
    });
    htmlContent = htmlContent.replace(/&lt;\/a&gt;/g, '</a>');

    // ulとliタグの復元（目次用）
    htmlContent = htmlContent.replace(/&lt;ul style="([^"]*)"&gt;/g, '<ul style="$1">');
    htmlContent = htmlContent.replace(/&lt;\/ul&gt;/g, '</ul>');
    htmlContent = htmlContent.replace(/&lt;li style="([^"]*)"&gt;/g, '<li style="$1">');
    htmlContent = htmlContent.replace(/&lt;\/li&gt;/g, '</li>');

    // spanタグの復元（目次アイコン用）
    htmlContent = htmlContent.replace(/&lt;span style="([^"]*)"&gt;/g, '<span style="$1">');
    htmlContent = htmlContent.replace(/&lt;\/span&gt;/g, '</span>');

    // Table tags
    htmlContent = htmlContent.replace(/&lt;table class="([^"]*)"&gt;/g, '<table class="$1">');
    htmlContent = htmlContent.replace(/&lt;\/table&gt;/g, '</table>');
    htmlContent = htmlContent.replace(/&lt;thead&gt;/g, '<thead>');
    htmlContent = htmlContent.replace(/&lt;\/thead&gt;/g, '</thead>');
    htmlContent = htmlContent.replace(/&lt;tbody&gt;/g, '<tbody>');
    htmlContent = htmlContent.replace(/&lt;\/tbody&gt;/g, '</tbody>');
    htmlContent = htmlContent.replace(/&lt;tr&gt;/g, '<tr>');
    htmlContent = htmlContent.replace(/&lt;\/tr&gt;/g, '</tr>');
    htmlContent = htmlContent.replace(/&lt;th class="([^"]*)"&gt;/g, '<th class="$1">');
    htmlContent = htmlContent.replace(/&lt;\/th&gt;/g, '</th>');
    htmlContent = htmlContent.replace(/&lt;td class="([^"]*)"&gt;/g, '<td class="$1">');
    htmlContent = htmlContent.replace(/&lt;\/td&gt;/g, '</td>');

    // Images ![alt](url)
    htmlContent = htmlContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4" />');
    // Links [text](url)
    htmlContent = htmlContent.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-600 underline">$1<\/a>');
    // Bold **text**
    htmlContent = htmlContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
    // Headings ###, ##, #（IDを追加してアンカーリンクに対応）
    htmlContent = htmlContent.replace(/^###\s+(.+)$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h3 id="${id}" class="text-xl font-semibold mt-6 mb-2">${title}<\/h3>`;
    });
    htmlContent = htmlContent.replace(/^##\s+(.+)$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h2 id="${id}" class="text-2xl font-bold mt-8 mb-3">${title}<\/h2>`;
    });
    htmlContent = htmlContent.replace(/^#\s+(.+)$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h1 id="${id}" class="text-3xl font-bold mt-10 mb-4">${title}<\/h1>`;
    });
    // Unordered list（改良されたデザイン）
    htmlContent = htmlContent.replace(/^(?:-\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^-\s+/, '').trim()).map(li => `<li style="position: relative; padding-left: 20px; margin-bottom: 8px; line-height: 1.6;"><span style="position: absolute; left: 0; top: 0; color: #e91e63; font-weight: bold;">•</span>${li}<\/li>`).join('');
      return `<ul style="margin: 16px 0; padding: 0; list-style: none;">${items}<\/ul>`;
    });
    // Ordered list（改良されたデザイン）
    htmlContent = htmlContent.replace(/^(?:\d+\.\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map((l, index) => {
        const text = l.replace(/^\d+\.\s+/, '').trim();
        return `<li style="position: relative; padding-left: 28px; margin-bottom: 8px; line-height: 1.6;"><span style="position: absolute; left: 0; top: 0; color: #e91e63; font-weight: bold; background: #fce4ec; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${index + 1}</span>${text}<\/li>`;
      }).join('');
      return `<ol style="margin: 16px 0; padding: 0; list-style: none;">${items}<\/ol>`;
    });
    // Horizontal rule
    htmlContent = htmlContent.replace(/^---$/gm, '<hr style="border: none; height: 3px; background: linear-gradient(to right, #e5e5e5, #999, #e5e5e5); margin: 24px 0; border-radius: 2px;" />');

    // Table処理 (Markdown table)
    // テーブルブロック全体を処理
    htmlContent = htmlContent.replace(/(?:^\|.+\|\s*$\n?)+/gm, (tableBlock) => {
      const lines = tableBlock.trim().split('\n').map(line => line.trim());
      if (lines.length < 2) return tableBlock;

      // セパレーター行を見つける
      const separatorIndex = lines.findIndex(line => /^\|[\s\-\|:]+\|$/.test(line));
      if (separatorIndex === -1) return tableBlock;

      const headerLine = lines[separatorIndex - 1];
      const dataLines = lines.slice(separatorIndex + 1);

      if (!headerLine) return tableBlock;

      // ヘッダー行を処理
      const headerCells = headerLine.split('|').slice(1, -1).map(cell => cell.trim());
      const headerHtml = headerCells.map(cell => `<th class="px-4 py-2 bg-gray-100 font-semibold text-left border border-gray-300">${cell}</th>`).join('');

      // データ行を処理
      const dataRowsHtml = dataLines.map(line => {
        const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
        const cellsHtml = cells.map(cell => `<td class="px-4 py-2 border border-gray-300">${cell}</td>`).join('');
        return `<tr>${cellsHtml}</tr>`;
      }).join('');

      return `<table class="w-full border-collapse border border-gray-300 my-4">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${dataRowsHtml}</tbody>
      </table>`;
    });

    // シンプルな改行処理: 全ての改行をbrタグに変換
    htmlContent = htmlContent.replace(/\n/g, '<br />');

    return (
      <article className="bg-white border border-gray-200 p-6">
        <div className="mb-6">
          <a href="#" className="text-xs text-[#d11a68]">{article.category}</a>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{article.title}</h1>
          <div className="text-gray-500 text-sm mt-2">
            {new Date().toLocaleDateString('ja-JP')}
          </div>
        </div>

        {article.featuredImage && (
          <div className="rounded overflow-hidden mb-6">
            <div className="relative bg-gray-100" style={{ paddingBottom: '52.36%' }}>
              <img
                src={article.featuredImage}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div
          className="max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            fontSize: '16px',
            color: '#374151'
          }}
        />
      </article>
    );
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!article.title || !article.content) {
      alert('タイトルと本文は必須です');
      return;
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
        category: article.category,
        category2: article.category2,
        article_type: article.articleType,
        brand: article.brand || undefined,
        price: article.price || undefined,
        release_date: article.releaseDate || undefined,
        rating: article.rating || undefined
      };

      let savedArticle;
      if (isEditMode) {
        savedArticle = await articlesAPI.updateArticle(articleId!, articleData);
        setSaveMessage(`記事を${status === 'draft' ? '下書きとして' : '公開して'}更新しました`);
      } else {
        savedArticle = await articlesAPI.createArticle(articleData);
        setSaveMessage(`記事を${status === 'draft' ? '下書きとして' : '公開して'}保存しました`);
      }
      setTimeout(() => setSaveMessage(null), 3000);
      console.log('Saved article:', savedArticle);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    if (confirm('変更が保存されていない可能性があります。戻りますか？')) {
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
              <button
                onClick={() => handleSave('published')}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '公開'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-24">
        {isPreview ? (
          <div className="container mx-auto px-4 py-10 max-w-4xl">
            {renderPreview()}
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
                <div className="flex justify-between items-center mb-4">
                  <div></div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => insertAtLineStart('# ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H1</button>
                    <button onClick={() => insertAtLineStart('## ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H2</button>
                    <button onClick={() => insertAtLineStart('### ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H3</button>
                    <button onClick={() => wrapSelection('**', '**')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">太字</button>
                    <button onClick={() => insertAtMultipleLines('- ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">• リスト</button>
                    <button onClick={() => insertAtMultipleLines('1. ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">1. リスト</button>
                    <button onClick={() => wrapSelection('[', '](https://)')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">リンク</button>
                    <button onClick={() => insertAtLineStart('---\n')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">——</button>

                    {/* 装飾ボタン */}
                    <div className="border-l border-gray-300 mx-2"></div>
                    <button onClick={() => applyDecoration('info')} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs border border-blue-300 rounded">💡 本記事のテーマ</button>
                    <button onClick={() => applyDecoration('warning')} className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs border border-yellow-300 rounded">⚠️ 注意</button>
                    <button onClick={() => applyDecoration('success')} className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs border border-green-300 rounded">💡ミライのひとことアドバイス</button>
                    <button onClick={() => applyDecoration('error')} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs border border-red-300 rounded">❌ 警告</button>
                    <button onClick={() => applyDecoration('quote')} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs border border-gray-300 rounded">💬 引用</button>
                    <button onClick={() => applyDecoration('speech-bubble')} className="px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs border border-pink-300 rounded">💭 吹き出し</button>


                    <div className="border-l border-gray-300 mx-2"></div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 text-sm font-medium transition-colors"
                      disabled={isUploading}
                    >
                      {isUploading ? 'アップロード中...' : '画像をアップロード'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={article.content}
                  onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
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
                    <span className="ml-2 text-xs text-gray-500">({cloudinaryImages.length}件)</span>
                  </h3>
                  <button
                    onClick={loadCloudinaryImages}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    disabled={loadingCloudinary}
                  >
                    {loadingCloudinary ? '読み込み中...' : '🔄 更新'}
                  </button>
                </div>
                {cloudinaryImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cloudinaryImages.map((image) => (
                      <div key={image.public_id} className="relative group">
                        <div className="aspect-video bg-gray-100 border border-gray-200 rounded overflow-hidden">
                          <img
                            src={image.secure_url}
                            alt={image.public_id}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-slate-500">画像を読み込めません</div>';
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(image.secure_url)}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                            >
                              URLをコピー
                            </button>
                            <button
                              onClick={() => insertImageIntoContent(image.secure_url)}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                            >
                              本文に挿入
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    {loadingCloudinary ? 'Cloudinary画像を読み込み中...' : 'Cloudinary画像が見つかりません'}
                  </div>
                )}
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
                      <option value="赤み・赤ら顔">赤み・赤ら顔</option>
                      <option value="たるみ・しわ">たるみ・しわ</option>
                      <option value="ニキビ・ニキビ跡">ニキビ・ニキビ跡</option>
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
                      <option value="肌育">肌育</option>
                      <option value="最新の美容機器">最新の美容機器</option>
                      <option value="ホームケア">ホームケア</option>
                      <option value="サロン経営">サロン経営</option>
                      <option value="海外トレンド">海外トレンド</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      ※ カテゴリ1とカテゴリ2のうち、最低1つは選択してください
                    </p>
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
                                alt="アイキャッチ画像プレビュー"
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
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-slate-700 mb-4 pb-2 border-b border-gray-100">
                  SEO設定
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      URL スラッグ
                    </label>
                    <input
                      type="text"
                      value={article.slug}
                      onChange={(e) => setArticle(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="article-url-slug"
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                    <div className="mt-1 text-xs text-slate-500">
                      URL: /articles/{article.slug}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      メタディスクリプション
                    </label>
                    <textarea
                      value={article.metaDescription}
                      onChange={(e) => setArticle(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="検索結果に表示される記事の説明文（155文字以内推奨）"
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                    <div className="mt-1 text-xs text-slate-500">
                      {article.metaDescription.length}/160文字
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      キーワード
                    </label>
                    <input
                      type="text"
                      value={article.keywords}
                      onChange={(e) => setArticle(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="スキンケア, 美容液, 保湿"
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                    <div className="mt-1 text-xs text-slate-500">
                      カンマ区切りで入力
                    </div>
                  </div>
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