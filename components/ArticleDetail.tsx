import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { articlesAPI, Article } from '../src/lib/supabase';

interface ArticleDetailProps {
  articleId: string;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ articleId }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await articlesAPI.getArticleById(articleId);
        setArticle(data);
        setError(null);
      } catch (e) {
        setError('記事が見つかりませんでした');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  const renderContent = (content: string) => {
    // 安全のため基本エスケープ→必要なMarkdownだけHTML化
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 装飾機能の処理（エスケープ前の内容で処理）
    html = html.replace(/<div class="decoration-info">(.*?)<\/div>/g,
      '<div style="border: 2px solid #3b82f6; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e3a8a; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #1d4ed8;">$1</div>');
    html = html.replace(/<div class="decoration-warning">(.*?)<\/div>/g,
      '<div style="border: 2px solid #f59e0b; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #78350f; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #d97706;">$1</div>');
    html = html.replace(/<div class="decoration-success">(.*?)<\/div>/g,
      '<div style="border: 2px solid #10b981; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #064e3b; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #047857;">$1</div>');
    html = html.replace(/<div class="decoration-error">(.*?)<\/div>/g,
      '<div style="border: 2px solid #ef4444; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #7f1d1d; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #dc2626;">$1</div>');
    html = html.replace(/<div class="decoration-quote">(.*?)<\/div>/g,
      '<div style="border: 2px solid #6b7280; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); color: #4b5563; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #374151; font-style: italic;">$1</div>');

    // 画像 ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4" />');
    // リンク [text](url)
    html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-600 underline">$1<\/a>');
    // 太字 **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
    // 見出し ###, ##, #（順序に注意）
    html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-2">$1<\/h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1<\/h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-4">$1<\/h1>');
    // 箇条書き
    html = html.replace(/^(?:-\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^-\s+/, '').trim()).map(li => `<li class=\"list-disc ml-6\">${li}<\/li>`).join('');
      return `<ul class=\"my-4\">${items}<\/ul>`;
    });
    // 番号付きリスト
    html = html.replace(/^(?:\d+\.\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^\d+\.\s+/, '').trim()).map(li => `<li class=\"list-decimal ml-6\">${li}<\/li>`).join('');
      return `<ol class=\"my-4\">${items}<\/ol>`;
    });
    // 罫線
    html = html.replace(/^---$/gm, '<hr class="my-6" />');
    // 段落/改行の処理を大幅に改善

    // まず、連続する改行を処理
    // 2つ以上の改行を段落区切りとして扱う
    const paragraphs = html.split(/\n\s*\n/);

    // 各段落を処理
    html = paragraphs.map(paragraph => {
      if (!paragraph.trim()) {
        // 完全に空の段落は空白段落として表示
        return '<p style="margin-bottom: 1.5rem; height: 1.5rem;">&nbsp;</p>';
      }
      // 段落内の単一改行はbrタグに変換
      const processedParagraph = paragraph.replace(/\n/g, '<br />');
      return `<p style="margin-bottom: 1.5rem; line-height: 1.7;">${processedParagraph}</p>`;
    }).join('');

    return { __html: html };
  };

  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68]"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-700 mb-2">{error}</h1>
              <a href="/" className="text-[#d11a68] hover:underline">トップに戻る</a>
            </div>
          )}

          {!loading && !error && article && (
            <article className="bg-white border border-gray-200 p-6">
              <div className="mb-6">
                <a href={`/category/${encodeURIComponent(article.category)}`} className="text-xs text-[#d11a68]">{article.category}</a>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{article.title}</h1>
                <div className="text-gray-500 text-sm mt-2">
                  {new Date(article.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              {article.featured_image && (
                <div className="rounded overflow-hidden mb-6">
                  <div className="relative bg-gray-100" style={{ paddingBottom: '52.36%' }}>
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div
                className="max-w-none article-content"
                dangerouslySetInnerHTML={renderContent(article.content)}
                style={{
                  lineHeight: '1.7',
                  fontSize: '16px',
                  color: '#374151'
                }}
              />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetail;


