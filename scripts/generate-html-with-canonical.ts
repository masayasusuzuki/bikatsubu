import fs from 'fs';
import path from 'path';

// 生成するページのリスト
const pages = [
  { path: '/', url: 'https://www.bikatsubu-media.jp/' },
  { path: '/category/spots-dullness', url: 'https://www.bikatsubu-media.jp/category/spots-dullness' },
  { path: '/category/pores', url: 'https://www.bikatsubu-media.jp/category/pores' },
  { path: '/category/redness', url: 'https://www.bikatsubu-media.jp/category/redness' },
  { path: '/category/aging', url: 'https://www.bikatsubu-media.jp/category/aging' },
  { path: '/category/acne', url: 'https://www.bikatsubu-media.jp/category/acne' },
  { path: '/category/skin-development', url: 'https://www.bikatsubu-media.jp/category/skin-development' },
  { path: '/category/beauty-technology', url: 'https://www.bikatsubu-media.jp/category/beauty-technology' },
  { path: '/category/home-care', url: 'https://www.bikatsubu-media.jp/category/home-care' },
  { path: '/category/salon-management', url: 'https://www.bikatsubu-media.jp/category/salon-management' },
  { path: '/category/global-trends', url: 'https://www.bikatsubu-media.jp/category/global-trends' },
  { path: '/skin-diagnosis', url: 'https://www.bikatsubu-media.jp/skin-diagnosis' },
  { path: '/media', url: 'https://www.bikatsubu-media.jp/media' },
  { path: '/articles/hot-cosmetics', url: 'https://www.bikatsubu-media.jp/articles/hot-cosmetics' },
  { path: '/articles/brand-updates', url: 'https://www.bikatsubu-media.jp/articles/brand-updates' },
  { path: '/articles/management-tips', url: 'https://www.bikatsubu-media.jp/articles/management-tips' },
  { path: '/articles/beauty-events', url: 'https://www.bikatsubu-media.jp/articles/beauty-events' },
];

// ベースのindex.htmlを読み込み
const baseHtmlPath = path.join(process.cwd(), 'dist', 'index.html');
const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

// 各ページのHTMLを生成
for (const page of pages) {
  // Canonical タグを挿入
  const canonicalTag = `    <link rel="canonical" href="${page.url}" />`;
  const htmlWithCanonical = baseHtml.replace('</head>', `${canonicalTag}\n</head>`);

  // ファイルパスを作成
  const outputDir = path.join(process.cwd(), 'dist', page.path);
  const outputFile = path.join(outputDir, 'index.html');

  // ディレクトリを作成（存在しない場合）
  fs.mkdirSync(outputDir, { recursive: true });

  // HTMLを書き込み
  fs.writeFileSync(outputFile, htmlWithCanonical, 'utf-8');

  console.log(`✓ Generated: ${page.path}`);
}

console.log(`\n✓ Total pages generated: ${pages.length}`);
