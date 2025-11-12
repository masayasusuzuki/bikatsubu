# Next.js移行計画書

## 📅 移行スケジュール

### フェーズ1: 基盤構築（Day 1-2）
- [x] next-migrationブランチ作成
- [ ] Next.js 15 App Router セットアップ
- [ ] Tailwind CSS設定移行
- [ ] 環境変数設定
- [ ] Supabase接続設定

### フェーズ2: ページ移行（Day 3-7）
- [ ] トップページ（SSG）
- [ ] 記事詳細ページ（SSR/ISR）
- [ ] カテゴリページ（SSG）
- [ ] 記事一覧ページ（SSG + Client-side）
- [ ] 肌診断ページ（Client-side）

### フェーズ3: 管理画面移行（Day 8-10）
- [ ] 管理者ログイン
- [ ] ダッシュボード
- [ ] 記事エディタ（RichTextEditor統合）

### フェーズ4: 最適化（Day 11-14）
- [ ] 画像最適化（next/image）
- [ ] SEOメタデータ（generateMetadata）
- [ ] OGP画像生成
- [ ] サイトマップ生成
- [ ] robots.txt

## 🏗️ ディレクトリ構造

```
infixmediasite/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # トップページ
│   ├── articles/
│   │   ├── page.tsx         # 記事一覧
│   │   └── [slug]/
│   │       └── page.tsx     # 記事詳細
│   ├── category/
│   │   └── [category]/
│   │       └── page.tsx     # カテゴリ別
│   ├── admin/
│   │   ├── layout.tsx       # 管理画面レイアウト
│   │   ├── page.tsx         # ログイン
│   │   ├── dashboard/
│   │   └── editor/
│   └── api/
│       ├── articles/
│       └── auth/
├── components/              # 既存コンポーネント（再利用）
├── lib/                     # ユーティリティ
│   ├── supabase.ts         # 既存のSupabase設定
│   └── metadata.ts         # SEOメタデータ生成
├── public/                  # 静的ファイル
└── styles/                  # CSS
```

## 🔄 移行方法

### 1. コンポーネントの再利用
既存のReactコンポーネントはそのまま使用可能：
- `components/`フォルダはそのまま保持
- 必要に応じて`"use client"`ディレクティブを追加

### 2. データフェッチング変更

**現在（SPA）:**
```typescript
useEffect(() => {
  fetchArticles().then(setArticles);
}, []);
```

**Next.js（SSR/SSG）:**
```typescript
// app/articles/[slug]/page.tsx
export async function generateStaticParams() {
  const articles = await articlesAPI.getAllArticles();
  return articles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const article = await articlesAPI.getArticleBySlug(params.slug);
  return {
    title: article.title,
    description: article.meta_description,
    openGraph: {
      images: [article.featured_image]
    }
  };
}
```

### 3. ルーティング変更

**現在:**
- `App.tsx`でif文による手動ルーティング

**Next.js:**
- ファイルベースルーティング
- 動的ルート: `[slug]`, `[category]`

## 🎯 成功指標

1. **Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

2. **SEO改善**
   - Lighthouse SEOスコア: 100
   - 全ページ適切なメタデータ
   - 構造化データ実装

3. **開発体験**
   - ホットリロード維持
   - TypeScript型安全性
   - エラーハンドリング改善

## ⚠️ 注意事項

1. **ブランチ戦略**
   - 作業は`next-migration`ブランチで実施
   - mainブランチは触らない
   - デプロイは手動で実施

2. **環境変数**
   - `NEXT_PUBLIC_`プレフィックス必須（クライアント側）
   - サーバー側環境変数は`.env.local`

3. **互換性確保**
   - Supabase接続は既存のものを流用
   - Cloudinary設定も同様

## 📝 コミット規則

```bash
git commit -m "feat(next): [機能名] - 詳細"
git commit -m "fix(next): [バグ修正] - 詳細"
git commit -m "refactor(next): [リファクタリング] - 詳細"
```

## 🚀 開始コマンド

```bash
# Next.jsプロジェクト作成
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"

# 既存の依存関係を追加
npm install @supabase/supabase-js @tiptap/react @tiptap/starter-kit recharts
```