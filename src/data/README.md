# イベントデータ管理

## イベントの追加方法

`eventsData.ts` の `beautyEvents` 配列に新しいイベントを追加してください。

### 例:

```typescript
{
  id: 'event-007',
  title: 'イベント名',
  date: '2025-12-25',  // 必須: YYYY-MM-DD形式
  endDate: '2025-12-27',  // 任意: 複数日のイベントの場合
  category: '展示会',  // 展示会、新商品発売、セミナー、ワークショップなど
  brand: 'ブランド名',  // 任意: 特定ブランドのイベントの場合
  location: '開催場所',
  description: 'イベントの説明',
  link: 'https://example.com',  // 任意: 詳細ページのURL
  image: 'https://example.com/image.jpg'  // 任意: イベント画像URL
}
```

### カテゴリー一覧
- 展示会
- 新商品発売
- セミナー
- ワークショップ
- その他

追加後は自動的にカレンダーとタイムラインに反映されます。
