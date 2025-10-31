import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { articlesAPI, pageSectionsAPI, Article } from '../src/lib/supabase';
import { optimizeAnyImageUrl } from '../src/utils/imageOptimizer';

interface ArticleDetailProps {
  articleSlug: string;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ articleSlug }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [sameCategoyArticles, setSameCategoryArticles] = useState<Article[]>([]);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);

  // SEOメタタグを設定
  useEffect(() => {
    if (article) {
      // タイトル設定
      document.title = `${article.title} | 美活部`;

      // メタディスクリプション
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', article.meta_description || article.title);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = article.meta_description || article.title;
        document.head.appendChild(meta);
      }

      // メタキーワード
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', article.keywords || '美容,スキンケア');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = article.keywords || '美容,スキンケア';
        document.head.appendChild(meta);
      }

      // OGP - タイトル
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', article.title);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:title');
        meta.content = article.title;
        document.head.appendChild(meta);
      }

      // OGP - ディスクリプション
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', article.meta_description || article.title);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:description');
        meta.content = article.meta_description || article.title;
        document.head.appendChild(meta);
      }

      // OGP - 画像
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', article.featured_image || '');
      } else if (article.featured_image) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.content = article.featured_image;
        document.head.appendChild(meta);
      }

      // OGP - URL
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const currentUrl = `https://bikatsubu-media.jp/article/${article.slug || article.id}`;
      if (ogUrl) {
        ogUrl.setAttribute('content', currentUrl);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:url');
        meta.content = currentUrl;
        document.head.appendChild(meta);
      }

      // OGP - タイプ
      const ogType = document.querySelector('meta[property="og:type"]');
      if (ogType) {
        ogType.setAttribute('content', 'article');
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:type');
        meta.content = 'article';
        document.head.appendChild(meta);
      }

      // Twitter Card
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (twitterCard) {
        twitterCard.setAttribute('content', 'summary_large_image');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'twitter:card';
        meta.content = 'summary_large_image';
        document.head.appendChild(meta);
      }

      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', article.title);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'twitter:title';
        meta.content = article.title;
        document.head.appendChild(meta);
      }

      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', article.meta_description || article.title);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'twitter:description';
        meta.content = article.meta_description || article.title;
        document.head.appendChild(meta);
      }

      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', article.featured_image || '');
      } else if (article.featured_image) {
        const meta = document.createElement('meta');
        meta.name = 'twitter:image';
        meta.content = article.featured_image;
        document.head.appendChild(meta);
      }

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonical) {
        canonical.href = currentUrl;
      } else {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = currentUrl;
        document.head.appendChild(canonical);
      }
    }

    // クリーンアップ: コンポーネントがアンマウントされたらデフォルトに戻す
    return () => {
      document.title = '美活部 | 美容メディア';
    };
  }, [article]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 記事データをslugで取得
        const articleData = await articlesAPI.getArticleBySlug(articleSlug);
        setArticle(articleData);

        // 最新の公開記事を取得（現在の記事を除く）
        const allArticles = await articlesAPI.getAllArticles();
        console.log('全記事:', allArticles);
        console.log('現在の記事:', articleData);

        const latestPublishedArticles = allArticles
          .filter(a => a.status === 'published' && a.id !== articleData.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        console.log('最新の公開記事:', latestPublishedArticles);
        setLatestArticles(latestPublishedArticles);

        // 同じカテゴリーの記事を取得
        const sameCategoryArticles = allArticles
          .filter(a => a.category === articleData.category && a.id !== articleData.id && a.status === 'published')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        console.log('同じカテゴリーの記事:', sameCategoryArticles);
        console.log('フィルター条件:', {
          category: articleData.category,
          excludeId: articleData.id,
          status: 'published'
        });
        setSameCategoryArticles(sameCategoryArticles);

        // 次の記事を取得（アップロード時刻で現在の記事より新しい最初の記事）
        const publishedArticles = allArticles
          .filter(a => a.status === 'published' && a.id !== articleData.id)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const currentArticleTime = new Date(articleData.created_at).getTime();
        const nextArticleData = publishedArticles.find(a => new Date(a.created_at).getTime() > currentArticleTime);
        setNextArticle(nextArticleData || null);

        setError(null);
      } catch (e) {
        setError('記事が見つかりませんでした');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [articleSlug]);

  const renderContent = (content: string) => {
    let html = content;

    // 見出しにIDを追加（目次クリック用）
    html = html.replace(/^(#{1,2})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      if (level > 2) return match; // H3はスキップ
      
      // 既にIDが設定されている場合はスキップ
      if (text.includes('{#')) return match;
      
      const cleanText = text.trim();
      if (!cleanText) return match; // 空の見出しはスキップ
      
      const id = cleanText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
      if (!id) return match; // IDが生成できない場合はスキップ
      
      return `${hashes} ${cleanText} {#${id}}`;
    });

    // 古い手動目次タグを除去
    html = html.replace(/<div class="table-of-contents">[\s\S]*?<\/div>/g, '');

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

    // 吹き出し装飾
    html = html.replace(/<div class="decoration-speech-bubble" data-title="([^"]*)">(.*?)<\/div>/gs,
      (match, title, content) => {
        const titleHtml = title ? `<div style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: white;">${title}</div>` : '';
        return `<div style="position: relative; background: linear-gradient(135deg, #e91e63 0%, #d81b60 100%); color: white; padding: 2px 12px; border-radius: 8px; margin: 2px 0; box-shadow: 0 1px 3px rgba(233, 30, 99, 0.2); max-width: 300px; display: inline-block; line-height: 1.2; font-size: 14px;">
          ${titleHtml}${content}
          <div style="position: absolute; bottom: -4px; left: 16px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #d81b60;"></div>
        </div>`;
      });

    // 安全のため基本エスケープ→必要なMarkdownだけHTML化（装飾処理後に実行）
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 装飾HTMLタグを復元
    html = html.replace(/&lt;div style="([^"]*)"&gt;/g, '<div style="$1">');
    html = html.replace(/&lt;\/div&gt;/g, '</div>');

    // ulとliタグの復元（目次用）
    html = html.replace(/&lt;ul style="([^"]*)"&gt;/g, '<ul style="$1">');
    html = html.replace(/&lt;\/ul&gt;/g, '</ul>');
    html = html.replace(/&lt;li style="([^"]*)"&gt;/g, '<li style="$1">');
    html = html.replace(/&lt;\/li&gt;/g, '</li>');

    // spanタグの復元（目次アイコン用）
    html = html.replace(/&lt;span style="([^"]*)"&gt;/g, '<span style="$1">');
    html = html.replace(/&lt;\/span&gt;/g, '</span>');

    // aタグの復元（目次のリンクなど）
    html = html.replace(/&lt;a ([^&]*)&gt;/g, (match, attributes) => {
      // クォートも復元
      const restoredAttributes = attributes.replace(/&quot;/g, '"');
      return `<a ${restoredAttributes}>`;
    });
    html = html.replace(/&lt;\/a&gt;/g, '</a>');

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
    // 見出し処理（正確な正規表現で重複を防ぐ）
    // H3 (###) を最初に処理
    html = html.replace(/^###\s+(.+?)(?:\s*\{#([^}]+)\})?$/gm, (match, title, customId) => {
      const cleanTitle = title.trim();
      const id = customId || `h3-${cleanTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
      return `<h3 id="${id}" class="text-xl font-semibold mt-6 mb-2">${cleanTitle}<\/h3>`;
    });
    // H2見出しのID重複を防ぐためのカウンター
    let h2Counter = 0;
    html = html.replace(/^##\s+(.+?)(?:\s*\{#([^}]+)\})?$/gm, (match, title, customId) => {
      const cleanTitle = title.trim();
      let baseId = cleanTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      if (!baseId) baseId = 'heading'; // 空の場合のフォールバック
      const id = customId || `h2-${baseId}-${++h2Counter}`;
      return `<h2 id="${id}" style="font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; color: #d11a68; border-bottom: 2px solid #d11a68; padding-bottom: 0.5rem; line-height: 1.3;">${cleanTitle}<\/h2>`;
    });
    // H1 (単一の#のみ) を最後に処理
    html = html.replace(/^#(?!#)\s+(.+?)(?:\s*\{#([^}]+)\})?$/gm, (match, title, customId) => {
      const cleanTitle = title.trim();
      const id = customId || `h1-${cleanTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
      return `<h1 id="${id}" class="text-3xl font-bold mt-10 mb-4">${cleanTitle}<\/h1>`;
    });
    // 箇条書き（改良されたデザイン）
    html = html.replace(/^(?:-\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^-\s+/, '').trim()).map(li => `<li style="position: relative; padding-left: 20px; margin-bottom: 8px; line-height: 1.6;"><span style="position: absolute; left: 0; top: 0; color: #e91e63; font-weight: bold;">•</span>${li}<\/li>`).join('');
      return `<ul style="margin: 16px 0; padding: 0; list-style: none;">${items}<\/ul>`;
    });
    // 番号付きリスト（改良されたデザイン）
    html = html.replace(/^(?:\d+\.\s.+\n?)+/gm, (block) => {
      const items = block.trim().split(/\n/).map((l, index) => {
        const text = l.replace(/^\d+\.\s+/, '').trim();
        return `<li style="position: relative; padding-left: 28px; margin-bottom: 8px; line-height: 1.6;"><span style="position: absolute; left: 0; top: 0; color: #e91e63; font-weight: bold; background: #fce4ec; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${index + 1}</span>${text}<\/li>`;
      }).join('');
      return `<ol style="margin: 16px 0; padding: 0; list-style: none;">${items}<\/ol>`;
    });
    // 罫線（太い線に変更）
    html = html.replace(/^---$/gm, '<hr style="border: none; height: 3px; background: linear-gradient(to right, #e5e5e5, #999, #e5e5e5); margin: 24px 0; border-radius: 2px;" />');

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
    // シンプルな改行処理: 全ての改行をbrタグに変換
    html = html.replace(/\n/g, '<br />');

    // 自動目次生成（H2のみ対象）
    const headingRegex = /<h2[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h2>/g;
    const headings: { level: number; text: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
      const id = match[1];
      const text = match[2].trim();
      headings.push({ level: 2, text, id }); // H2のみなのでlevelは常に2
    }

    // 見出しが2個以上ある場合のみ目次を自動生成
    if (headings.length >= 2) {
      const tocItems = headings.map((heading) => {
        return `<li style="margin-bottom: 8px;">
          <a href="#${heading.id}" style="color: #374151; text-decoration: none; font-size: 14px;" onmouseover="this.style.color='#2563eb';" onmouseout="this.style.color='#374151';">• ${heading.text}</a>
        </li>`;
      }).join('');

      const autoToc = `<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px auto; max-width: 600px;">
        <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px;">📋 目次</div>
        <ul style="list-style: none; padding: 0; margin: 0;">${tocItems}</ul>
      </div>`;

      // 記事の最初に目次を挿入
      html = autoToc + html;
    }

    return { __html: html };
  };

  const renderArticleCard = (article: Article) => (
    <div key={article.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
      <a href={`/article/${article.slug || article.id}`} className="block hover:opacity-80 transition-opacity">
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

  // 構造化データ（パンくずリスト）
  const breadcrumbStructuredData = article ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "ホーム",
        "item": "https://www.bikatsubu-media.jp/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": article.category,
        "item": `https://www.bikatsubu-media.jp/category/${encodeURIComponent(article.category)}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title
      }
    ]
  } : null;

  // 構造化データ（Article）
  const articleStructuredData = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "author": {
      "@type": "Organization",
      "name": "美活部（公式）"
    },
    "datePublished": article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "image": article.featured_image || "https://www.bikatsubu-media.jp/fabicon/fabicon.png",
    "publisher": {
      "@type": "Organization",
      "name": "美活部（公式）",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.bikatsubu-media.jp/fabicon/fabicon.png"
      }
    }
  } : null;

  return (
    <div className="bg-gray-100 font-sans">
      {/* 構造化データ */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}
      {articleStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      )}

      <Header />

      {/* パンくずリスト */}
      {!loading && !error && article && (
        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-gray-500 hover:text-[#d11a68] transition-colors">
                  ホーム
                </a>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <a href={`/category/${encodeURIComponent(article.category)}`} className="text-gray-500 hover:text-[#d11a68] transition-colors">
                  {article.category}
                </a>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-[#d11a68] font-medium truncate max-w-xs">{article.title}</li>
            </ol>
          </div>
        </nav>
      )}

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
                        公開日：{new Date(article.created_at).toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'numeric', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>

                    {article.featured_image && (
                      <div className="rounded overflow-hidden mb-6">
                        <div className="relative bg-gray-100" style={{ paddingBottom: '52.36%' }}>
                          <img
                            src={optimizeAnyImageUrl(article.featured_image, 800, 419)}
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

                    {/* 次の記事へのリンク */}
                    {nextArticle && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center mb-3">
                            <span className="text-blue-600 text-sm font-medium">次の記事</span>
                            <span className="ml-2 text-blue-500">→</span>
                          </div>
                          <a
                            href={`/article/${nextArticle.slug || nextArticle.id}`}
                            className="block hover:opacity-80 transition-opacity"
                          >
                            <div className="flex gap-4">
                              {nextArticle.featured_image && (
                                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={nextArticle.featured_image}
                                    alt={nextArticle.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-blue-600 mb-2">{nextArticle.category}</div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 leading-tight">
                                  {nextArticle.title}
                                </h3>
                                <div className="text-xs text-gray-500">
                                  {new Date(nextArticle.created_at).toLocaleDateString('ja-JP')}
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </article>
                </div>

                {/* サイドバー */}
                <div className="lg:col-span-1">
                  {/* 肌タイプ診断カード */}
                  <div className="relative mb-6">
                    {/* 光るエフェクト */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-40 group-hover:opacity-60 animate-pulse"></div>

                    <a
                      href="/skin-diagnosis"
                      className="block group relative"
                    >
                      <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                        {/* グラデーション背景 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100"></div>

                        {/* アクセントライン */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"></div>

                        <div className="relative p-5">
                          {/* バッジ */}
                          <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full mb-3 shadow-md">
                            ✨ おすすめ
                          </div>

                          {/* タイトル部分 */}
                          <div className="mb-4">
                            <div className="text-sm font-bold text-pink-600 mb-1">たった15秒で診断！</div>
                            <div className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-2">
                              あなたの肌タイプは？
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              AI診断で肌状態を分析<br />
                              最適なケア方法をご提案
                            </p>
                          </div>

                          {/* 画像 */}
                          <div className="w-full mb-4">
                            <img
                              src="/card/skin-diagnosis.webp"
                              alt="肌タイプ診断"
                              className="w-full h-40 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* CTAボタン */}
                          <div className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl text-center transition-all shadow-md hover:shadow-lg group-hover:scale-[1.02] flex items-center justify-center">
                            <span>今すぐ診断する</span>
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>

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


