# Cloudinary設定ガイド

## 🎯 目的
Cloudinary無料プランの容量制限（25GB）を効率的に使用するため、アップロード時に画像を自動的にWebP形式に変換して保存する。

## 📊 現在の問題
- **元画像がそのまま保存される**: JPG/PNG形式の大きな画像がそのまま保存
- **容量の無駄遣い**: 2MBの画像×1000枚 = 2GB消費
- **手動圧縮が必要**: ユーザーが事前に圧縮する手間

## ✅ 解決方法

### 方法1: Upload Presetで自動変換（推奨）

Cloudinaryダッシュボードで`ml_default`プリセットを以下のように設定：

1. **Cloudinaryダッシュボードにログイン**
2. **Settings > Upload > Upload Presets**へ移動
3. **`ml_default`プリセットを編集**（なければ新規作成）
4. **以下の設定を追加**：

#### Incoming Transformation設定
```
Format: webp
Quality: auto:good (約85%品質)
Resize mode: limit
Width: 2000
Height: 2000
```

これにより：
- アップロードされた画像は自動的にWebP形式に変換
- 最大2000x2000pxにリサイズ（アスペクト比保持）
- 品質は自動調整（見た目の劣化を最小限に）

### 方法2: APIパラメータで変換（コード側で対応）

```javascript
// eager transformationを使用（変換済みバージョンを生成）
formData.append('eager', 'w_2000,h_2000,c_limit,q_auto:good,f_webp');
formData.append('eager_async', 'true');
```

**注意**: この方法では元画像も保存されるため、完全な容量削減にはならない

## 📈 効果

### Before（現状）
- 形式: JPG/PNG
- サイズ: 平均2MB/画像
- 1000画像で2GB消費

### After（WebP変換後）
- 形式: WebP
- サイズ: 平均600KB/画像（約70%削減）
- 1000画像で600MB消費
- **節約: 1.4GB（70%の容量削減）**

## 🔧 実装チェックリスト

- [ ] Cloudinaryダッシュボードでupload presetを設定
- [ ] Format: webpに設定
- [ ] Quality: auto:goodに設定
- [ ] Resize: limit 2000x2000に設定
- [ ] テスト画像をアップロードして確認
- [ ] 既存画像の移行計画を策定（必要に応じて）

## ⚠️ 注意事項

1. **ブラウザ互換性**:
   - WebPは主要ブラウザでサポート済み
   - Safari 14以降、IE以外は問題なし
   - OptimizedImageコンポーネントがフォールバック処理

2. **画質設定**:
   - `auto:good` = 約85%品質（推奨）
   - `auto:best` = 約95%品質（高品質が必要な場合）
   - `auto:eco` = 約70%品質（容量重視の場合）

3. **既存画像の処理**:
   - 新規アップロードから適用
   - 既存画像は必要に応じて再アップロード

## 📝 コード側の対応

現在の`ArticleEditor.tsx`では2MBまでの制限を設けています：

```javascript
// ファイルサイズチェック（2MB制限）
if (file.size > 2 * 1024 * 1024) {
  alert('ファイルサイズが大きすぎます。2MB以下のファイルを選択してください。');
  return;
}
```

WebP変換により、実際には：
- 2MB JPG → 約600KB WebPとして保存
- ユーザーは2MBまでアップロード可能
- 実際の保存容量は大幅に削減

## 🚀 次のステップ

1. Cloudinaryダッシュボードで設定を変更
2. テストアップロードで動作確認
3. 必要に応じてコード側の制限を調整（3-5MBまで緩和も可能）