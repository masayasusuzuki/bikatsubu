## 5. Google Analytics 4の設定

### Step 1: Google Analyticsアカウント作成

1. https://analytics.google.com/ にアクセス
2. Googleアカウントでログイン
3. **管理** → **アカウントを作成** をクリック

### Step 2: アカウント設定

```
アカウント名: 美活部（任意）
アカウントのデータ共有設定:
  ✅ Googleのプロダクトやサービス
  ✅ ベンチマーク
  ✅ テクニカルサポート
  ⬜ アカウントスペシャリスト（任意）

```

### Step 3: プロパティ設定

```
プロパティ名: 美活部 本番環境
レポートのタイムゾーン: 日本
通貨: 日本円（JPY）

```

### Step 4: ビジネス情報

```
業種: 美容とフィットネス
ビジネス規模: 小規模（従業員数1-10名など）
ビジネスの目標: （該当するものを選択）
  ✅ ユーザー行動の調査
  ✅ コンバージョンの測定

```

### Step 5: データストリーム作成

1. **ウェブ** を選択
2. 設定:

```
ウェブサイトのURL: <https://bikatsbu.com> （取得したドメイン）
ストリーム名: 美活部ウェブサイト
拡張計測機能: ✅ すべて有効化
  - スクロール数
  - 離脱クリック
  - サイト内検索
  - 動画エンゲージメント
  - ファイルのダウンロード

```

### Step 6: 測定IDの取得

- データストリーム作成後、**測定ID**（G-XXXXXXXXXX）が表示される
- この測定IDをコピーして保存

### 測定IDの例:

```
G-ABC123XYZ9

```

---

## 6. GAタグの埋め込み

### Step 1: index.htmlを編集

プロジェクトの `index.html` ファイルを開き、GA4タグのコメントを外す:

### 変更前（コメントアウト状態）:

```html
<!-- Google Analytics 4 (本番環境移行後に有効化) -->
<!--
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID', {
    'send_page_view': true,
    'page_title': document.title,
    'page_location': window.location.href
  });
</script>
-->

```

### 変更後（有効化 + 測定ID設定）:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123XYZ9', {
    'send_page_view': true,
    'page_title': document.title,
    'page_location': window.location.href
  });
</script>

```

**重要**: `G-ABC123XYZ9` の部分を、Step 5-6で取得した実際の測定IDに置き換える

### Step 2: 変更をコミット

```bash
git add index.html
git commit -m "本番環境: GA4タグを有効化"
git push origin main

```

---

## 7. デプロイと計測開始

### Step 1: Vercelで自動デプロイ

- GitHubにpushすると、Vercelが自動的にデプロイを開始
- Vercelダッシュボードで進行状況を確認

### Step 2: デプロイ完了を確認

1. Vercelダッシュボードで **"Ready"** または **"Deployment Complete"** と表示される
2. 本番URLにアクセス: `https://bikatsbu.com`

### Step 3: GA4が動作しているか確認

### リアルタイムレポートで確認:

1. Google Analytics管理画面を開く
2. 左メニューから **レポート** → **リアルタイム** を選択
3. 自分でサイトにアクセス
4. 1分以内にリアルタイムレポートに表示されればOK

### 確認項目:

- ✅ アクティブユーザー数が表示される
- ✅ ページビューがカウントされる
- ✅ ページタイトルが正しく表示される
- ✅ 流入元が正しく表示される

### 注意事項:

**現在のAdmin画面で表示されている数値について:**
- 総記事数: 156件
- 月間PV: 58,920
- 平均滞在時間: 3:24
- 直帰率: 42.3%

これらの数値はGA4連携後に実際のデータに置き換わります。現在はダミーデータが表示されています。

### Step 4: テストイベント送信（オプション）

サイトで以下の操作を行い、イベントが記録されるか確認:

- 記事ページを開く
- カテゴリをクリック
- ヒーローセクションのスライドをクリック
- ページをスクロール