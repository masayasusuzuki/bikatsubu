import React, { useState, useRef, useEffect } from 'react';
import { articlesAPI, CreateArticle, supabase } from '../src/lib/supabase';

interface ArticleData {
  title: string;
  content: string;
  metaDescription: string;
  keywords: string;
  slug: string;
  status: 'draft' | 'published';
  featuredImage: string;
  category: string;
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
    category: 'シミ・くすみ',
    articleType: 'article',
    brand: '',
    price: '',
    releaseDate: '',
    rating: 0
  });

  const [isPreview, setIsPreview] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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
        category: data.category,
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
      textarea.focus();
      const cursor = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(cursor, cursor);
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
      textarea.focus();
      const pos = start + prefix.length;
      textarea.setSelectionRange(pos, pos);
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
      textarea.focus();
      const newEnd = start + newSelectedText.length;
      textarea.setSelectionRange(start, newEnd);
    }, 0);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

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
      const fileExt = file.name.split('.').pop();
      const filePath = `featured-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

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
        textarea.focus();
        textarea.setSelectionRange(
          start + imageMarkdown.length,
          start + imageMarkdown.length
        );
      }, 0);
    }
  };

  const generateSlug = (title: string) => {
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

    // Escape basic HTML
    htmlContent = htmlContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Images ![alt](url)
    htmlContent = htmlContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4" />');
    // Links [text](url)
    htmlContent = htmlContent.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-600 underline">$1<\/a>');
    // Bold **text**
    htmlContent = htmlContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
    // Headings ###, ##, #
    htmlContent = htmlContent.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-2">$1<\/h3>');
    htmlContent = htmlContent.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1<\/h2>');
    htmlContent = htmlContent.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-4">$1<\/h1>');
    // Unordered list
    htmlContent = htmlContent.replace(/^(?:-\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^-\s+/, '').trim()).map(li => `<li class="list-disc ml-6">${li}<\/li>`).join('');
      return `<ul class="my-4">${items}<\/ul>`;
    });
    // Ordered list
    htmlContent = htmlContent.replace(/^(?:\d+\.\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^\d+\.\s+/, '').trim()).map(li => `<li class="list-decimal ml-6">${li}<\/li>`).join('');
      return `<ol class="my-4">${items}<\/ol>`;
    });
    // Horizontal rule
    htmlContent = htmlContent.replace(/^---$/gm, '<hr class="my-6" />');
    // Paragraphs: convert remaining line breaks
    htmlContent = htmlContent.replace(/\n{2,}/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>').replace(/\n/g, '<br />');

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

        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </article>
    );
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!article.title || !article.content) {
      alert('タイトルと本文は必須です');
      return;
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
      <header className="bg-white border-b border-gray-300 shadow-sm">
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
                onClick={() => setIsPreview(!isPreview)}
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

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
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
                  <label className="block text-sm font-medium text-slate-700">
                    記事本文
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => insertAtLineStart('# ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H1</button>
                    <button onClick={() => insertAtLineStart('## ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H2</button>
                    <button onClick={() => insertAtLineStart('### ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">H3</button>
                    <button onClick={() => wrapSelection('**', '**')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">太字</button>
                    <button onClick={() => insertAtMultipleLines('- ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">• リスト</button>
                    <button onClick={() => insertAtMultipleLines('1. ')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">1. リスト</button>
                    <button onClick={() => wrapSelection('[', '](https://)')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">リンク</button>
                    <button onClick={() => insertAtLineStart('---\n')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs">——</button>
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
                  rows={20}
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
                          onClick={() => navigator.clipboard.writeText(`![画像の説明](${url})`)}
                          className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          マークダウンをコピー
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                      <option value="cosmetic">コスメ記事</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      カテゴリ
                    </label>
                    <select
                      value={article.category}
                      onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    >
                      <option value="シミ・くすみ">シミ・くすみ</option>
                      <option value="毛穴">毛穴</option>
                      <option value="赤み・赤ら顔">赤み・赤ら顔</option>
                      <option value="たるみ・しわ">たるみ・しわ</option>
                      <option value="ニキビ・ニキビ跡">ニキビ・ニキビ跡</option>
                    </select>
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

              {/* Cosmetics Settings - only show when articleType is 'cosmetic' */}
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
                  <div className="text-gray-700 text-sm">
                    {article.metaDescription || 'メタディスクリプションを入力してください'}
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