import React, { useState, useEffect } from 'react';
import { beautyEventsAPI } from '../src/lib/supabase';
import type { BeautyEvent, CreateBeautyEvent } from '../types';

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<BeautyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [jsonInput, setJsonInput] = useState('');
  const [previewEvents, setPreviewEvents] = useState<CreateBeautyEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<BeautyEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await beautyEventsAPI.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('イベントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const eventsArray = Array.isArray(parsed) ? parsed : [parsed];

      // バリデーション
      const validatedEvents: CreateBeautyEvent[] = eventsArray.map((event, index) => {
        if (!event.title || !event.event_date || !event.category || !event.location) {
          throw new Error(`イベント${index + 1}: title, event_date, category, locationは必須です`);
        }

        // 日付フォーマットチェック
        if (!/^\d{4}-\d{2}-\d{2}$/.test(event.event_date)) {
          throw new Error(`イベント${index + 1}: event_dateはYYYY-MM-DD形式で入力してください`);
        }

        return {
          title: event.title,
          event_date: event.event_date,
          end_date: event.end_date || event.endDate || null,
          category: event.category,
          brand: event.brand || '',
          location: event.location,
          description: event.description || '',
          external_link: event.external_link || event.externalLink || '',
          image_url: event.image_url || event.image || ''
        };
      });

      setPreviewEvents(validatedEvents);
      setError(null);
      setSuccessMessage(null);
    } catch (err: any) {
      setError(`パースエラー: ${err.message}`);
      setPreviewEvents([]);
    }
  };

  const handleBulkCreate = async () => {
    try {
      setLoading(true);
      await beautyEventsAPI.createEvents(previewEvents);
      setSuccessMessage(`${previewEvents.length}件のイベントを登録しました`);
      setJsonInput('');
      setPreviewEvents([]);
      await loadEvents();
    } catch (err: any) {
      setError(`登録エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このイベントを削除しますか？')) return;

    try {
      await beautyEventsAPI.deleteEvent(id);
      setSuccessMessage('イベントを削除しました');
      await loadEvents();
    } catch (err: any) {
      setError(`削除エラー: ${err.message}`);
    }
  };

  const handleEdit = (event: BeautyEvent) => {
    setEditingEvent(event);
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;

    try {
      const { id, created_at, updated_at, ...updateData } = editingEvent;
      await beautyEventsAPI.updateEvent(id, updateData);
      setSuccessMessage('イベントを更新しました');
      setEditingEvent(null);
      await loadEvents();
    } catch (err: any) {
      setError(`更新エラー: ${err.message}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">📅 イベント管理</h2>

      {/* エラー・成功メッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* 一括登録セクション */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📋 イベント一括登録</h3>

        {/* ChatGPT用プロンプト */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              前提
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                ChatGPT（Deep Researchなど）で美容イベント情報を大量に調べてもらった後、<br/>
                その情報を以下のプロンプトでJSON形式に変換します
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 mb-2">JSON変換プロンプトをコピー</h4>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
{`以下のイベント情報を、JSON配列形式に変換してください。
すべてのイベントを時系列順で含めてください。

【必須フィールド】
- title: イベント名
- event_date: 開始日（YYYY-MM-DD形式）
- category: カテゴリー（「展示会」「新商品発売」「セミナー」「学会」「その他」のいずれか）
- location: 開催場所

【任意フィールド】
- end_date: 終了日（YYYY-MM-DD形式、複数日開催の場合のみ記載）
- brand: ブランド名（特定ブランドのイベントの場合のみ記載）
- description: イベント説明（100文字程度で簡潔に）
- external_link: 公式サイトURL（必ず記載。不明な場合は空文字）
- image_url: イベント画像URL（不明な場合は空文字）

【出力形式】
[
  {
    "title": "COSME Week [東京] 2026",
    "event_date": "2026-01-14",
    "end_date": "2026-01-16",
    "category": "展示会",
    "brand": "",
    "location": "東京ビッグサイト",
    "description": "日本最大級の化粧品総合展示会。化粧品開発展やヘアケアEXPOなど7専門展同時開催",
    "external_link": "https://www.cosme-week.jp/",
    "image_url": ""
  },
  {
    "title": "IMCAS World Congress 2026",
    "event_date": "2026-01-29",
    "end_date": "2026-01-31",
    "category": "学会",
    "brand": "",
    "location": "パリ（フランス）",
    "description": "世界最大級の美容医療学会。皮膚科・形成外科・注入・レーザー治療の最新情報",
    "external_link": "https://www.imcas.com/",
    "image_url": ""
  }
]

※JSON配列のみを出力してください（説明文は不要）

## リサーチ情報
（ここにChatGPTで調べた情報やcalendar.mdの内容を貼り付け）`}
                </pre>
              </div>
              <button
                onClick={() => {
                  const text = `以下のイベント情報を、JSON配列形式に変換してください。
すべてのイベントを時系列順で含めてください。

【必須フィールド】
- title: イベント名
- event_date: 開始日（YYYY-MM-DD形式）
- category: カテゴリー（「展示会」「新商品発売」「セミナー」「学会」「その他」のいずれか）
- location: 開催場所

【任意フィールド】
- end_date: 終了日（YYYY-MM-DD形式、複数日開催の場合のみ記載）
- brand: ブランド名（特定ブランドのイベントの場合のみ記載）
- description: イベント説明（100文字程度で簡潔に）
- external_link: 公式サイトURL（必ず記載。不明な場合は空文字）
- image_url: イベント画像URL（不明な場合は空文字）

【出力形式】
[
  {
    "title": "COSME Week [東京] 2026",
    "event_date": "2026-01-14",
    "end_date": "2026-01-16",
    "category": "展示会",
    "brand": "",
    "location": "東京ビッグサイト",
    "description": "日本最大級の化粧品総合展示会。化粧品開発展やヘアケアEXPOなど7専門展同時開催",
    "external_link": "https://www.cosme-week.jp/",
    "image_url": ""
  },
  {
    "title": "IMCAS World Congress 2026",
    "event_date": "2026-01-29",
    "end_date": "2026-01-31",
    "category": "学会",
    "brand": "",
    "location": "パリ（フランス）",
    "description": "世界最大級の美容医療学会。皮膚科・形成外科・注入・レーザー治療の最新情報",
    "external_link": "https://www.imcas.com/",
    "image_url": ""
  }
]

※JSON配列のみを出力してください（説明文は不要）

## リサーチ情報
（ここにChatGPTで調べた情報やcalendar.mdの内容を貼り付け）`;
                  navigator.clipboard.writeText(text);
                  alert('クリップボードにコピーしました！');
                }}
                className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
              >
                📋 プロンプトをコピー
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                ChatGPTから返ってきた<strong>JSON配列</strong>を下のテキストエリアに貼り付けて、<strong>プレビュー</strong>をクリック
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          ChatGPTで調査したJSON配列をここに貼り付けてください
        </p>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[\n  {\n    "title": "イベント名",\n    "event_date": "2025-12-01",\n    "category": "展示会",\n    "location": "東京",\n    "description": "説明",\n    "external_link": "https://...",\n    "image_url": "https://..."\n  }\n]`}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePreview}
            disabled={!jsonInput.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            プレビュー
          </button>
          <button
            onClick={() => {
              setJsonInput('');
              setPreviewEvents([]);
              setError(null);
            }}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            クリア
          </button>
        </div>

        {/* プレビュー */}
        {previewEvents.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-800">✅ 登録予定: {previewEvents.length}件</h4>
              <button
                onClick={handleBulkCreate}
                disabled={loading}
                className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 disabled:bg-gray-300 transition-colors"
              >
                {loading ? '登録中...' : 'すべて登録'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewEvents.map((event, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm space-y-2">
                    <p className="font-bold text-gray-800 truncate">{event.title}</p>
                    <p className="text-gray-600">📅 {event.event_date}{event.end_date && ` - ${event.end_date}`}</p>
                    <p className="text-gray-600">📍 {event.location}</p>
                    <p className="text-gray-600">🏷️ {event.category}</p>
                    {event.external_link && (
                      <p className="text-blue-600 text-xs truncate">🔗 {event.external_link}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">イベント編集</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">タイトル *</label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">開始日 *</label>
                  <input
                    type="date"
                    value={editingEvent.event_date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">終了日</label>
                  <input
                    type="date"
                    value={editingEvent.end_date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, end_date: e.target.value || undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">カテゴリー *</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="展示会">展示会</option>
                    <option value="新商品発売">新商品発売</option>
                    <option value="セミナー">セミナー</option>
                    <option value="ワークショップ">ワークショップ</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">ブランド</label>
                  <input
                    type="text"
                    value={editingEvent.brand || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">場所 *</label>
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">説明</label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">外部リンク</label>
                <input
                  type="url"
                  value={editingEvent.external_link || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, external_link: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">画像URL</label>
                <input
                  type="url"
                  value={editingEvent.image_url || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                更新
              </button>
              <button
                onClick={() => setEditingEvent(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 登録済みイベント一覧 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📊 登録済みイベント一覧 ({events.length}件)
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            登録されているイベントがありません
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold px-2 py-1 bg-pink-100 text-pink-800 rounded">
                        {event.category}
                      </span>
                      {event.brand && (
                        <span className="text-sm font-semibold px-2 py-1 bg-rose-100 text-rose-800 rounded">
                          {event.brand}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>🗓️ {formatDate(event.event_date)}{event.end_date && ` - ${formatDate(event.end_date)}`}</p>
                      <p>📍 {event.location}</p>
                      {event.external_link && (
                        <p className="truncate">
                          🔗 <a href={event.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {event.external_link}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
