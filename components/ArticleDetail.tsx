import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { articlesAPI, pageSectionsAPI, Article } from '../src/lib/supabase';

interface ArticleDetailProps {
  articleId: string;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ articleId }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [sameCategoyArticles, setSameCategoryArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 記事データを取得
        const articleData = await articlesAPI.getArticleById(articleId);
        setArticle(articleData);

        // 最新の公開記事を取得（現在の記事を除く）
        const allArticles = await articlesAPI.getAllArticles();
        console.log('全記事:', allArticles);
        console.log('現在の記事:', articleData);

        const latestPublishedArticles = allArticles
          .filter(a => a.status === 'published' && a.id !== articleData.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        console.log('最新の公開記事:', latestPublishedArticles);
        setLatestArticles(latestPublishedArticles);

        // 同じカテゴリーの記事を取得
        const sameCategoryArticles = allArticles
          .filter(a => a.category === articleData.category && a.id !== articleData.id && a.status === 'published')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        console.log('同じカテゴリーの記事:', sameCategoryArticles);
        console.log('フィルター条件:', {
          category: articleData.category,
          excludeId: articleData.id,
          status: 'published'
        });
        setSameCategoryArticles(sameCategoryArticles);

        setError(null);
      } catch (e) {
        setError('記事が見つかりませんでした');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [articleId]);

  const renderContent = (content: string) => {
    let html = content;

    // 装飾機能の処理（エスケープ前に処理）
    html = html.replace(/<div class="decoration-info" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #1d4ed8;">${title}</div>` : '';
        return `<div style="border: 2px solid #3b82f6; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e3a8a; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #1d4ed8;">${titleHtml}${content}</div>`;
      });
    html = html.replace(/<div class="decoration-warning" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #d97706;">${title}</div>` : '';
        return `<div style="border: 2px solid #f59e0b; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #78350f; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #d97706;">${titleHtml}${content}</div>`;
      });
    html = html.replace(/<div class="decoration-success" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #047857;">${title}</div>` : '';
        return `<div style="border: 2px solid #10b981; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #064e3b; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #047857;">${titleHtml}${content}</div>`;
      });
    html = html.replace(/<div class="decoration-error" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #dc2626;">${title}</div>` : '';
        return `<div style="border: 2px solid #ef4444; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #7f1d1d; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #dc2626;">${titleHtml}${content}</div>`;
      });
    html = html.replace(/<div class="decoration-quote" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #374151;">${title}</div>` : '';
        return `<div style="border: 2px solid #6b7280; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); color: #4b5563; padding: 16px; margin: 16px 0; border-radius: 8px; border-left: 6px solid #374151; font-style: italic;">${titleHtml}${content}</div>`;
      });

    // 安全のため基本エスケープ→必要なMarkdownだけHTML化（装飾処理後に実行）
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 装飾HTMLタグを復元
    html = html.replace(/&lt;div style="([^"]*)"&gt;/g, '<div style="$1">');
    html = html.replace(/&lt;\/div&gt;/g, '</div>');

    // Table tags
    html = html.replace(/&lt;table class="([^"]*)"&gt;/g, '<table class="$1">');
    html = html.replace(/&lt;\/table&gt;/g, '</table>');
    html = html.replace(/&lt;thead&gt;/g, '<thead>');
    html = html.replace(/&lt;\/thead&gt;/g, '</thead>');
    html = html.replace(/&lt;tbody&gt;/g, '<tbody>');
    html = html.replace(/&lt;\/tbody&gt;/g, '</tbody>');
    html = html.replace(/&lt;tr&gt;/g, '<tr>');
    html = html.replace(/&lt;\/tr&gt;/g, '</tr>');
    html = html.replace(/&lt;th class="([^"]*)"&gt;/g, '<th class="$1">');
    html = html.replace(/&lt;\/th&gt;/g, '</th>');
    html = html.replace(/&lt;td class="([^"]*)"&gt;/g, '<td class="$1">');
    html = html.replace(/&lt;\/td&gt;/g, '</td>');

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

    // Table処理 (Markdown table)
    // テーブルブロック全体を処理
    html = html.replace(/(?:^\|.+\|\s*$\n?)+/gm, (tableBlock) => {
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

  const renderArticleCard = (article: Article) => (
    <div key={article.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
      <a href={`/article/${article.id}`} className="block hover:opacity-80 transition-opacity">
        <div className="flex gap-3">
          {article.featured_image && (
            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#d11a68] mb-1">{article.category}</div>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight">{article.title}</h3>
            <div className="text-xs text-gray-500">
              {new Date(article.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>
      </a>
    </div>
  );

  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {loading && (
              <div className="lg:col-span-4 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68]"></div>
                <p className="mt-4 text-gray-600">読み込み中...</p>
              </div>
            )}

            {error && (
              <div className="lg:col-span-4 text-center py-20">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-700 mb-2">{error}</h1>
                <a href="/" className="text-[#d11a68] hover:underline">トップに戻る</a>
              </div>
            )}

            {!loading && !error && article && (
              <>
                {/* メインコンテンツ */}
                <div className="lg:col-span-3">
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
                </div>

                {/* サイドバー */}
                <div className="lg:col-span-1">
                  {/* 最新の記事 */}
                  <div className="bg-white border border-gray-200 p-4 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">最新の記事を読む</h2>
                    <div className="space-y-4">
                      {latestArticles.length > 0 ? (
                        latestArticles.map(renderArticleCard)
                      ) : (
                        <p className="text-gray-500 text-sm">記事がありません</p>
                      )}
                    </div>
                  </div>

                  {/* 同じカテゴリーの記事 */}
                  <div className="bg-white border border-gray-200 p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">同じカテゴリーの記事を読む</h2>
                    <div className="space-y-4">
                      {sameCategoyArticles.length > 0 ? (
                        sameCategoyArticles.map(renderArticleCard)
                      ) : (
                        <p className="text-gray-500 text-sm">同じカテゴリーの記事がありません</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetail;


