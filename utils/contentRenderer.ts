// 記事コンテンツをHTMLにレンダリングする共通関数
export const renderArticleContent = (content: string): { __html: string } => {
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

  // 左右レイアウト記法 [image-text]![alt](url)|説明文[/image-text]
  html = html.replace(/\[image-text\]!\[([^\]]*)\]\(([^)]+)\)\|([^[]+)\[\/image-text\]/g, (match, alt, url, description) => {
    return `<div style="display: flex; gap: 20px; margin: 24px 0; align-items: flex-start; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 250px;">
        <img src="${url}" alt="${alt}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>
      <div style="flex: 1; min-width: 250px; padding-left: 10px;">
        <p style="margin: 0; line-height: 1.6; color: #374151; font-size: 14px;">${description.trim()}</p>
      </div>
    </div>`;
  });
  
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
    return `<h3 id="${id}" style="font-size: 1.25rem; font-weight: 600; margin: 0; line-height: 1.3;">${cleanTitle}<\/h3>`;
  });
  // H2見出しのID重複を防ぐためのカウンター
  let h2Counter = 0;
  html = html.replace(/^##\s+(.+?)(?:\s*\{#([^}]+)\})?$/gm, (match, title, customId) => {
    const cleanTitle = title.trim();
    let baseId = cleanTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    if (!baseId) baseId = 'heading'; // 空の場合のフォールバック
    const id = customId || `h2-${baseId}-${++h2Counter}`;
    return `<h2 id="${id}" style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #d11a68; border-bottom: 2px solid #d11a68; padding-bottom: 0.5rem; line-height: 1.3;">${cleanTitle}<\/h2>`;
  });
  // H1 (単一の#のみ) を最後に処理
  html = html.replace(/^#(?!#)\s+(.+?)(?:\s*\{#([^}]+)\})?$/gm, (match, title, customId) => {
    const cleanTitle = title.trim();
    const id = customId || `h1-${cleanTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
    return `<h1 id="${id}" style="font-size: 1.875rem; font-weight: 700; margin: 0; line-height: 1.3;">${cleanTitle}<\/h1>`;
  });
  
  // 箇条書き（改良されたデザイン）
  html = html.replace(/^(?:-\s.+\n?)+/gm, (block) => {
    const items = block.trim().split(/\n/).map(l => l.replace(/^-\s+/, '').trim()).map(li => `<li style="position: relative; padding-left: 20px; margin-bottom: 8px; line-height: 1.6;"><span style="position: absolute; left: 0; top: 0; color: #e91e63; font-weight: bold;">•</span>${li}<\/li>`).join('');
    return `<ul style="margin: 0; padding: 0; list-style: none;">${items}<\/ul>`;
  });
  // 番号付きリスト（改良されたデザイン）
  html = html.replace(/^(?:\d+\.\s.+\n?)+/gm, (block) => {
    const items = block.trim().split(/\n/).map((l, index) => {
      const text = l.replace(/^\d+\.\s+/, '').trim();
      return `<li style="position: relative; padding-left: 28px; margin-bottom: 8px; line-height: 1.6;"><span style="position: absolute; left: 0; top: 0; color: #e91e63; font-weight: bold; background: #fce4ec; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${index + 1}</span>${text}<\/li>`;
    }).join('');
    return `<ol style="margin: 0; padding: 0; list-style: none;">${items}<\/ol>`;
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

