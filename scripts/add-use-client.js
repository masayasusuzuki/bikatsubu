#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// コンポーネントディレクトリ
const componentsDir = path.join(__dirname, '..', 'components');

// useStateなどのReact Hooksを使用しているコンポーネント
const clientComponents = [
  'HeroCarousel.tsx',
  'ProductCarousel.tsx',
  'CategoryGrid.tsx',
  'BrandUpdates.tsx',
  'BeautyEvents.tsx',
  'ManagementTips.tsx',
  'SurveyReports.tsx',
  'Footer.tsx',
  'SearchBar.tsx',
  'LoadingScreen.tsx',
  'ArticleDetail.tsx',
  'ArticlesListPage.tsx',
  'AdminLogin.tsx',
  'AdminDashboard.tsx',
  'ArticleEditor.tsx',
  'CategoryPage.tsx',
  'SkinDiagnosis.tsx',
  'MediaPage.tsx',
  'UserGuide.tsx',
  'FAQ.tsx',
  'PrivacyPolicy.tsx',
  'TermsOfService.tsx',
  'CommercialTransactionAct.tsx',
  'SearchResultsPage.tsx',
  'Sitemap.tsx',
  'RichTextEditor.tsx',
  'ImageSelectorModal.tsx',
  'FeaturedImageModal.tsx',
  'OptimizedImage.tsx'
];

clientComponents.forEach(fileName => {
  const filePath = path.join(componentsDir, fileName);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // すでに'use client'がある場合はスキップ
    if (!content.startsWith("'use client'")) {
      content = "'use client';\n\n" + content;
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added 'use client' to ${fileName}`);
    } else {
      console.log(`⏭️  ${fileName} already has 'use client'`);
    }
  } else {
    console.log(`❌ File not found: ${fileName}`);
  }
});

console.log('\n✨ Done!');