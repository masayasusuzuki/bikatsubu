# 美活部 デザインシステム

## 📐 概要

美活部のブランドアイデンティティを統一し、一貫したユーザー体験を提供するためのデザインシステムです。

## 🎨 カラーパレット

### ブランドカラー

| 名前 | CSS変数 | Tailwindクラス | HEX値 | 用途 |
|------|---------|---------------|-------|------|
| Primary | `--color-brand-primary` | `text-brand-primary` / `bg-brand-primary` | #d11a68 | メインのブランドカラー、CTA、重要なアクション |
| Primary Dark | `--color-brand-primary-dark` | `text-brand-primary-dark` / `bg-brand-primary-dark` | #b8175a | ホバー状態、強調 |
| Primary Light | `--color-brand-primary-light` | `text-brand-primary-light` / `bg-brand-primary-light` | #e85b8f | 背景、淡い装飾 |
| Secondary | `--color-brand-secondary` | `text-brand-secondary` / `bg-brand-secondary` | #f472b6 | セカンダリアクション、サブ要素 |
| Accent | `--color-brand-accent` | `text-brand-accent` / `bg-brand-accent` | #fbbf24 | 特別な強調、お気に入り |

### セマンティックカラー

#### Beauty Rose（美容系コンテンツ）
- `bg-beauty-rose-50` ~ `bg-beauty-rose-900`
- 美容記事、スキンケア関連コンテンツに使用

#### Beauty Pink（トレンド・新商品）
- `bg-beauty-pink-50` ~ `bg-beauty-pink-900`
- 新商品紹介、トレンド情報に使用

#### Beauty Purple（プレミアム・特集）
- `bg-beauty-purple-50` ~ `bg-beauty-purple-900`
- 特集記事、プレミアムコンテンツに使用

#### Beauty Indigo（調査・レポート）
- `bg-beauty-indigo-50` ~ `bg-beauty-indigo-900`
- 調査レポート、データ分析コンテンツに使用

### グラデーション

```css
/* Tailwindクラス */
bg-gradient-beauty    /* ブランドグラデーション */
bg-gradient-sunset    /* サンセットグラデーション */
bg-gradient-purple    /* パープルグラデーション */

/* CSS変数 */
var(--gradient-beauty)
var(--gradient-sunset)
var(--gradient-purple)
```

## 🎯 使用ガイドライン

### 1. プライマリカラーの使用

**推奨される使用箇所：**
- CTAボタン
- 重要なリンク
- アクティブ状態
- フォーカス状態

```jsx
// Good ✅
<button className="bg-brand-primary text-white hover:bg-brand-primary-dark">
  購入する
</button>

// Avoid ❌
<button className="bg-[#d11a68] text-white hover:bg-[#b8175a]">
  購入する
</button>
```

### 2. カラーの一貫性

同じ用途には必ず同じカラーを使用：
- **エラー**: `text-red-600`
- **成功**: `text-green-600`
- **警告**: `text-yellow-600`
- **情報**: `text-blue-600`

### 3. コントラスト比

WCAG AA基準を満たすように設計：
- 通常テキスト: 4.5:1以上
- 大きいテキスト: 3:1以上

## 🔤 タイポグラフィ

### フォントファミリー

```css
font-sans     /* 本文: Inter, Noto Sans JP */
font-display  /* 見出し: Montserrat, Noto Sans JP */
```

### フォントサイズ

| クラス | サイズ | 用途 |
|--------|--------|------|
| `text-xs` | 12px | 補助テキスト、タグ |
| `text-sm` | 14px | サブテキスト、説明文 |
| `text-base` | 16px | 本文 |
| `text-lg` | 18px | 小見出し |
| `text-xl` | 20px | セクション見出し |
| `text-2xl` | 24px | ページ見出し |
| `text-3xl` | 30px | 主要見出し |
| `text-4xl` | 36px | ヒーロー見出し |

## 📦 コンポーネント

### ボタン

#### プライマリボタン
```jsx
<button className="bg-brand-primary text-white px-6 py-3 rounded-md hover:bg-brand-primary-dark transition-colors">
  プライマリボタン
</button>
```

#### セカンダリボタン
```jsx
<button className="bg-white text-brand-primary border border-brand-primary px-6 py-3 rounded-md hover:bg-beauty-rose-50 transition-colors">
  セカンダリボタン
</button>
```

### カード

```jsx
<div className="bg-white rounded-2xl shadow-beauty hover:shadow-beauty-lg transition-shadow p-6">
  <h3 className="text-lg font-bold text-gray-800">カードタイトル</h3>
  <p className="text-sm text-gray-600 mt-2">カードの説明文</p>
</div>
```

## 🎭 シャドウ

| クラス | CSS変数 | 用途 |
|--------|---------|------|
| `shadow-beauty` | `var(--shadow-beauty)` | 通常のカード |
| `shadow-beauty-lg` | `var(--shadow-beauty-lg)` | ホバー時、強調カード |
| `shadow-beauty-xl` | `var(--shadow-beauty-xl)` | モーダル、ポップアップ |

## ✨ アニメーション

### Tailwind組み込みアニメーション

```jsx
animate-fade-in      // フェードイン
animate-slide-up     // 下から上へスライド
animate-slide-down   // 上から下へスライド
animate-bounce-light // 軽いバウンス
```

### トランジション

```jsx
transition-colors    // カラー変更
transition-shadow    // シャドウ変更
transition-transform // 変形
transition-all       // すべて
duration-300        // 300ms
duration-500        // 500ms
```

## 🌙 ダークモード（将来実装）

CSS変数を使用しているため、ダークモードへの対応が容易：

```css
[data-theme="dark"] {
  --color-brand-primary: #e85b8f;
  --color-brand-primary-dark: #d11a68;
  --color-brand-primary-light: #f9a8d4;
}
```

## 📝 移行ガイド

### 旧カラーコードから新クラスへの移行

| 旧コード | 新クラス |
|----------|----------|
| `text-[#d11a68]` | `text-brand-primary` |
| `bg-[#d11a68]` | `bg-brand-primary` |
| `text-[#b8175a]` | `text-brand-primary-dark` |
| `bg-[#b8175a]` | `bg-brand-primary-dark` |
| `text-rose-500` | `text-beauty-rose-500` |
| `bg-pink-100` | `bg-beauty-pink-100` |

## 🚀 今後の拡張

- [ ] コンポーネントライブラリの構築
- [ ] Storybookでのカタログ化
- [ ] ダークモードの実装
- [ ] アクセシビリティガイドラインの追加
- [ ] アイコンシステムの統合