# 美活部（公式） SEO対策 TODOリスト

**最終更新**: 2025年10月16日

---

## ✅ 完了済み（2025年10月16日実装）

### 基本SEO設定
- [x] タイトルを「美活部（公式）｜美容医療・スキンケア情報メディア」に統一 ([index.html:9](index.html#L9))
- [x] メタディスクリプションを更新（専門家監修を強調） ([index.html:10](index.html#L10))
- [x] OGP/Twitter Cardのタイトル・ディスクリプション統一 ([index.html:14-23](index.html#L14-L23))
- [x] ドメインを`https://www.bikatsubu-media.jp/`に設定

### 構造化データ
- [x] Organization構造化データを追加 ([index.html:35-49](index.html#L35-L49))
  - SNSアカウント情報（X, TikTok）を記載
  - ⚠️ **注意**: Instagramアカウント情報が未設定（`youraccount`のまま）
- [x] パンくずリスト構造化データを追加
  - カテゴリーページ ([CategoryPage.tsx:270-312](components/CategoryPage.tsx#L270-L312))
  - 記事詳細ページ ([ArticleDetail.tsx:320-404](components/ArticleDetail.tsx#L320-L404))
- [x] Article構造化データを追加（記事詳細ページ） ([ArticleDetail.tsx:345-365](components/ArticleDetail.tsx#L345-L365))
  - 著者、公開日、更新日、画像を含む

### ファイル・リソース
- [x] ファビコンを設定 ([index.html:5](index.html#L5))
  - 配置場所: `/public/fabicon/fabicon.png`
- [x] カノニカルURLの設定 ([index.html:7](index.html#L7))
- [x] robots.txtを作成 ([public/robots.txt](public/robots.txt))
  - 全クローラーに許可
  - `/admin`をクロール禁止に設定
- [x] sitemap.xmlを作成 ([public/sitemap.xml](public/sitemap.xml))
  - 全21ページを記載（カテゴリー、記事一覧、フッターページなど）
  - 最終更新日: 2025-10-16
  - ⚠️ **注意**: 記事詳細ページ（`/article/*`）は動的追加が必要

### UI改善
- [x] フッターに更新日を追加 ([Footer.tsx:73](components/Footer.tsx#L73))
  - `<time>`タグ使用（2025年10月16日）
- [x] パンくずリスト（視覚的UI）を追加
  - カテゴリーページ: ホーム → カテゴリー
  - 記事詳細ページ: ホーム → カテゴリー → 記事タイトル

### その他
- [x] プライバシーポリシーの日付更新 ([PrivacyPolicy.tsx:15-16](components/PrivacyPolicy.tsx#L15-L16))
  - 制定日: 2025年10月1日
  - 最終更新日: 2025年10月16日
- [x] フッターのリンク更新 ([Footer.tsx:20-22](components/Footer.tsx#L20-L22))
  - 株式会社LOGICA: `https://logicajapan.co.jp/`（外部リンク）
  - お問い合わせ: `https://logicajapan.co.jp/contact/`（外部リンク）

---

## 🔴 優先度：高（すぐ実施すべき）

### 1. OGP画像の設定 ⚠️ **未実装**
- [ ] OGP用画像を作成（推奨サイズ: 1200x630px）
- [ ] `public/`フォルダに配置（例: `og-image.png`）
- [ ] `index.html`に以下を追加:
  ```html
  <meta property="og:image" content="https://www.bikatsubu-media.jp/og-image.png">
  <meta property="og:url" content="https://www.bikatsubu-media.jp/">
  <meta name="twitter:image" content="https://www.bikatsubu-media.jp/og-image.png">
  ```
- **効果**: SNSシェア時の視認性向上、流入増加
- **重要度**: ★★★★★（SNSマーケティングに必須）

### 2. Google Search Consoleへの登録 ⚠️ **未実施**
- [ ] Google Search Consoleにサイトを登録
- [ ] sitemap.xmlを送信（`https://www.bikatsubu-media.jp/sitemap.xml`）
- [ ] インデックス状況を確認
- **効果**: Googleへの認識促進、検索結果への早期反映
- **重要度**: ★★★★★（SEOの基本）

### 3. Instagramアカウント情報の更新 ⚠️ **未完了**
- [ ] [index.html:45](index.html#L45)の`https://www.instagram.com/youraccount`を実際のアカウントに変更
- 現在: `youraccount`（ダミー値）
- **効果**: SNSとの連携強化、ブランド認知
- **重要度**: ★★★☆☆

### 4. sitemap.xmlの動的更新対応 ⚠️ **未実施**
- [ ] 新規記事追加時にsitemap.xmlを自動更新する仕組みの構築
- 現在: 静的ファイル（手動更新が必要）
- [ ] 記事詳細ページ（`/article/*`）のURL追加
- **効果**: 新規コンテンツの早期インデックス
- **重要度**: ★★★★☆（記事が増えるたびに重要度UP）

---

## 🟡 優先度：中（競合との差別化）

### 5. WebSite構造化データ（サイト内検索）⚠️ **未実装**
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
- **効果**: Google検索結果に検索ボックス表示の可能性
- **重要度**: ★★★☆☆

### 6. よくある質問（FAQPage）の構造化データ ⚠️ **未実装**
- [ ] FAQページ（`/faq`）に構造化データを追加:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "質問内容",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "回答内容"
        }
      }
    ]
  }
  ```
- **効果**: 検索結果でFAQが展開表示される可能性、クリック率向上
- **重要度**: ★★★☆☆

### 7. カテゴリーページ・記事一覧ページのカノニカルURL設定 ⚠️ **未実施**
- [ ] 各カテゴリーページにカノニカルURLを追加
- [ ] 各記事一覧ページにカノニカルURLを追加
- 現在: トップページ（`index.html`）のみ設定済み
- **効果**: 重複コンテンツ回避
- **重要度**: ★★★☆☆

---

## 🟢 優先度：低（長期的施策）

### 8. ページ表示速度の最適化
- [ ] 画像の最適化（WebP形式への変換）
- [ ] 画像の遅延読み込み（lazy loading）実装
- [ ] 不要なJavaScriptの削除
- [ ] CSS/JSのminify
- [ ] Google PageSpeed Insightsでスコア測定
- **効果**: Core Web Vitals改善、SEOランキング向上、UX改善
- **重要度**: ★★★☆☆

### 9. 内部リンク構造の最適化
- [ ] 関連記事リンクの追加
- [ ] カテゴリ間の導線強化
- [ ] サイト内リンクのアンカーテキスト最適化
- **効果**: クローラビリティ向上、ユーザー滞在時間増加
- **重要度**: ★★☆☆☆

### 10. モバイルフレンドリー対応の確認
- [ ] Google Mobile-Friendly Testで確認
- [ ] タッチターゲットのサイズ確認
- [ ] レスポンシブデザインの最適化
- **効果**: モバイル検索順位向上
- **重要度**: ★★★☆☆

### 11. コンテンツの充実
- [ ] 「美活部（公式）」を含むオリジナルコンテンツの増加
- [ ] 専門家監修の記事を明記
- [ ] E-E-A-T（経験、専門性、権威性、信頼性）の強化
- [ ] 定期的な記事更新
- **効果**: 同業他社との差別化、長期的なSEO向上
- **重要度**: ★★★★★（最も重要な長期施策）

---

## 📊 測定・分析

### 12. SEOツールでの定期チェック
- [ ] Google Search Consoleの設定・確認（週1回）
- [ ] Google Analyticsでの流入分析（週1回）
- [ ] 「美活部」での検索順位モニタリング（週1回）
- [ ] 競合他社のSEO状況調査（月1回）
- [ ] Google Rich Results Testで構造化データを検証
- **効果**: SEO効果の可視化、改善点の発見
- **重要度**: ★★★★☆

---

## ⚠️ 重要な注意事項

### 🚨 緊急対応が必要な項目
1. **Instagramアカウント情報の更新** ([index.html:45](index.html#L45))
   - 現在: `https://www.instagram.com/youraccount`
   - ダミー値のままだと構造化データが無効になる可能性

2. **OGP画像の作成・設定**
   - SNSシェア時に画像が表示されず、CTRが低下

3. **Google Search Consoleへの登録**
   - 登録しないとGoogleにサイト情報が伝わらない

### 📌 定期メンテナンスが必要な項目
1. **sitemap.xmlの更新**
   - 新規記事追加時に手動更新が必要
   - 自動化を検討すべき

2. **フッターの更新日**
   - 大きな変更があった際に手動更新が必要 ([Footer.tsx:73](components/Footer.tsx#L73))

---

## 📝 技術情報メモ

### 現在のドメイン
- URL: `https://www.bikatsubu-media.jp/`

### SNSアカウント
- X (Twitter): `@bikatsubu_mirai` ✅
- TikTok: `@bikatsubu_mirai` ✅
- Instagram: **未設定**（`youraccount`のまま）⚠️

### ファイル配置場所
- ファビコン: `/public/fabicon/fabicon.png` ✅
- OGP画像: `/public/og-image.png` ❌（未作成）
- robots.txt: `/public/robots.txt` ✅
- sitemap.xml: `/public/sitemap.xml` ✅（動的記事URLは未対応）

### 構造化データ実装状況
- Organization: ✅ トップページ
- BreadcrumbList: ✅ カテゴリーページ、記事詳細ページ
- Article: ✅ 記事詳細ページ
- WebSite: ❌ 未実装
- FAQPage: ❌ 未実装

### カノニカルURL設定状況
- トップページ: ✅
- カテゴリーページ: ❌
- 記事詳細ページ: ❌
- その他のページ: ❌

---

## 🎯 推奨実装順序（優先度順）

### フェーズ1: 今すぐ実装（今週中）
1. **OGP画像を作成・設定**（最優先）
2. **Google Search Consoleに登録**（最優先）
3. **Instagramアカウント情報を更新**
4. **sitemap.xmlに記事URLを手動追加**（暫定対応）

### フェーズ2: 今月中に実装
5. WebSite構造化データを追加
6. FAQPage構造化データを追加
7. カテゴリーページ・記事一覧ページのカノニカルURL設定
8. sitemap.xml自動更新の仕組み構築

### フェーズ3: 継続的に改善
9. ページ表示速度最適化
10. 内部リンク構造最適化
11. コンテンツの定期更新と充実
12. SEOツールでの定期測定・分析

---

## 📚 参考リソース

- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org Documentation](https://schema.org/)
- [Google構造化データガイドライン](https://developers.google.com/search/docs/appearance/structured-data)

---

**次のアクションアイテム**: OGP画像作成 → Google Search Console登録 → Instagram情報更新
