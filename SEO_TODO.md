# 美活部（公式） SEO対策 TODOリスト

## ✅ 完了済み

- [x] タイトルを「美活部（公式）｜美容医療・スキンケア情報メディア」に統一
- [x] メタディスクリプションを更新（専門家監修を強調）
- [x] 構造化データ（JSON-LD）でOrganization情報を追加
- [x] ファビコンを設定（`/public/fabicon/fabicon.png`）
- [x] フッターに更新日を追加（`<time>`タグ使用）
- [x] ドメインを`https://www.bikatsubu-media.jp/`に設定

---

## 🔴 優先度：高（すぐ実施すべき）

### 1. OGP画像の設定
- [ ] OGP用画像を作成（推奨サイズ: 1200x630px）
- [ ] `public/`フォルダに配置
- [ ] `index.html`に以下を追加:
  ```html
  <meta property="og:image" content="https://www.bikatsubu-media.jp/og-image.png">
  <meta property="og:url" content="https://www.bikatsubu-media.jp/">
  <meta name="twitter:image" content="https://www.bikatsubu-media.jp/og-image.png">
  ```
- **効果**: SNSシェア時の視認性向上、流入増加

### 2. カノニカルURLの設定
- [ ] `index.html`の`<head>`に追加:
  ```html
  <link rel="canonical" href="https://www.bikatsubu-media.jp/">
  ```
- [ ] 各ページにも個別のカノニカルURLを設定
- **効果**: 重複コンテンツ問題の回避、SEO評価の集中

### 3. robots.txtの作成
- [ ] `public/robots.txt`を作成
  ```
  User-agent: *
  Allow: /
  Sitemap: https://www.bikatsubu-media.jp/sitemap.xml
  ```
- **効果**: クローラーに適切な指示を出す

### 4. sitemap.xmlの作成
- [ ] 自動生成ツールまたは手動で`public/sitemap.xml`を作成
- [ ] 全ページのURL、最終更新日、優先度を記載
- [ ] Google Search Consoleに登録
- **効果**: インデックス速度向上、全ページの認識

### 5. パンくずリストの構造化データ
- [ ] パンくずリストコンポーネントに構造化データを追加:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  }
  ```
- **効果**: 検索結果にパンくず表示、CTR向上

---

## 🟡 優先度：中（競合との差別化）

### 6. 記事ページ用のArticle構造化データ
- [ ] 各記事ページに以下を追加:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "記事タイトル",
    "author": {
      "@type": "Organization",
      "name": "美活部（公式）"
    },
    "datePublished": "2025-10-16",
    "dateModified": "2025-10-16",
    "image": "記事のサムネイル画像URL"
  }
  ```
- **効果**: リッチリザルト表示の可能性、信頼性向上

### 7. WebSite構造化データ（サイト内検索）
- [ ] `index.html`に追加:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "美活部（公式）",
    "url": "https://www.bikatsubu-media.jp/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.bikatsubu-media.jp/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  ```
- **効果**: Google検索結果に検索ボックス表示

### 8. よくある質問（FAQPage）の構造化データ
- [ ] FAQページまたはQ&Aコンテンツに追加:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...]
  }
  ```
- **効果**: 検索結果で目立つ、クリック率向上

### 9. Instagramアカウント情報の更新
- [ ] `index.html`の構造化データ内のInstagram URLを実際のアカウントに変更
- 現在: `https://www.instagram.com/youraccount`
- **効果**: SNSとの連携強化、ブランド認知

---

## 🟢 優先度：低（長期的施策）

### 10. ページ表示速度の最適化
- [ ] 画像の最適化（WebP形式への変換）
- [ ] 画像の遅延読み込み（lazy loading）実装
- [ ] 不要なJavaScriptの削除
- [ ] CSS/JSのminify
- **効果**: Core Web Vitals改善、SEOランキング向上

### 11. 内部リンク構造の最適化
- [ ] 関連記事リンクの追加
- [ ] カテゴリ間の導線強化
- [ ] サイト内リンクのアンカーテキスト最適化
- **効果**: クローラビリティ向上、ユーザー滞在時間増加

### 12. モバイルフレンドリー対応の確認
- [ ] Google Mobile-Friendly Testで確認
- [ ] タッチターゲットのサイズ確認
- [ ] レスポンシブデザインの最適化
- **効果**: モバイル検索順位向上

### 13. コンテンツの充実
- [ ] 「美活部（公式）」を含むオリジナルコンテンツの増加
- [ ] 専門家監修の記事を明記
- [ ] E-E-A-T（経験、専門性、権威性、信頼性）の強化
- **効果**: 同業他社との差別化、長期的なSEO向上

---

## 📊 測定・分析

### 14. SEOツールでの定期チェック
- [ ] Google Search Consoleの設定・確認
- [ ] Google Analyticsでの流入分析
- [ ] 「美活部」での検索順位モニタリング
- [ ] 競合他社のSEO状況調査

---

## 📝 メモ

### 現在のドメイン
- URL: `https://www.bikatsubu-media.jp/`

### SNSアカウント
- X (Twitter): `@bikatsubu_mirai`
- TikTok: `@bikatsubu_mirai`
- Instagram: 未設定（要確認）

### ファイル配置場所
- ファビコン: `/public/fabicon/fabicon.png`
- OGP画像: `/public/og-image.png`（作成予定）
- robots.txt: `/public/robots.txt`（作成予定）
- sitemap.xml: `/public/sitemap.xml`（作成予定）

---

## 🎯 推奨実装順序

1. **今すぐ実装**
   - OGP画像設定
   - カノニカルURL
   - robots.txt

2. **今週中に実装**
   - sitemap.xml作成とGoogle Search Console登録
   - パンくずリスト構造化データ

3. **今月中に実装**
   - 記事ページのArticle構造化データ
   - WebSite構造化データ

4. **継続的に改善**
   - ページ表示速度最適化
   - コンテンツ充実
   - 内部リンク構造最適化
