import React, { useState, useEffect } from 'react';
import { pageSectionsAPI, articlesAPI, PageSection, Article } from '../src/lib/supabase';

const PageContentManager: React.FC = () => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sectionNames = {
    'hot_cosmetics': { name: '1. Hot New Cosmetics', description: '話題のコスメ（5記事）' },
    'brand_updates': { name: '2. Beauty Topics', description: '最新美容ニュース（6記事）' },
    'beauty_events': { name: '3. Featured Events', description: '注目の美容イベント（4記事）' },
    'management_tips': { name: "4. Professional's Column", description: 'プロの美容テクニック（3記事）' },
    'most_read': { name: '5. Most Read Articles', description: '人気記事ランキング（2記事）' }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsData, articlesData] = await Promise.all([
        pageSectionsAPI.getAllSections(),
        articlesAPI.getAllArticles()
      ]);

      // デバッグ情報
      console.log('セクションデータ:', sectionsData);
      console.log('セクション名一覧:', [...new Set(sectionsData.map(s => s.section_name))]);
      console.log('hot_cosmeticsセクション:', sectionsData.filter(s => s.section_name === 'hot_cosmetics'));

      setSections(sectionsData);
      setArticles(articlesData);
    } catch (error) {
      console.error('データの読み込みに失敗:', error);
      setMessage('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateSectionArticle = async (sectionId: string, articleId: string | null) => {
    try {
      setSaving(true);
      await pageSectionsAPI.updateSection(sectionId, articleId);

      // ローカルステートを更新
      setSections(prev => prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              article_id: articleId,
              article: articleId ? articles.find(a => a.id === articleId) : undefined
            }
          : section
      ));

      setMessage('更新しました');
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('更新に失敗:', error);
      setMessage('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const addCard = async (sectionName: string) => {
    try {
      setSaving(true);
      const newCard = await pageSectionsAPI.addCardToSection(sectionName);

      // ローカルステートを更新
      setSections(prev => [...prev, newCard]);

      setMessage('カードを追加しました');
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('カード追加に失敗:', error);
      setMessage('カード追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const removeCard = async (sectionName: string) => {
    try {
      setSaving(true);
      const removedCard = await pageSectionsAPI.removeCardFromSection(sectionName);

      // ローカルステートから削除
      setSections(prev => prev.filter(section => section.id !== removedCard.id));

      setMessage('カードを削除しました');
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('カード削除に失敗:', error);
      setMessage('カード削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const removeSpecificCard = async (cardId: string, sectionName: string) => {
    if (!confirm('このカードを削除しますか？')) return;

    try {
      setSaving(true);
      await pageSectionsAPI.removeSpecificCard(cardId);

      // ローカルステートから削除
      setSections(prev => prev.filter(section => section.id !== cardId));

      setMessage('カードを削除しました');
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('カード削除に失敗:', error);
      setMessage('カード削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const groupedSections = sections.reduce((acc, section) => {
    if (!acc[section.section_name]) {
      acc[section.section_name] = [];
    }
    acc[section.section_name].push(section);
    return acc;
  }, {} as Record<string, PageSection[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68]"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  // セクションの表示順序を定義
  const sectionOrder = ['hot_cosmetics', 'brand_updates', 'beauty_events', 'management_tips', 'most_read'];

  const filteredSections = selectedSection === 'all'
    ? Object.fromEntries(
        sectionOrder
          .filter(key => groupedSections[key])
          .map(key => [key, groupedSections[key]])
      )
    : { [selectedSection]: groupedSections[selectedSection] };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ページコンテンツ管理</h2>
          <p className="text-gray-600">各セクションに表示する記事を選択してください</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded text-sm font-medium ${
            message.includes('失敗')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              記事検索
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="記事タイトルまたはカテゴリで検索..."
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-[#d11a68] focus:border-[#d11a68] rounded"
            />
          </div>
          <div className="sm:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              セクションフィルター
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-[#d11a68] focus:border-[#d11a68] rounded"
            >
              <option value="all">すべてのセクション</option>
              {sectionOrder.map(key => {
                const info = sectionNames[key as keyof typeof sectionNames];
                return info ? (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ) : null;
              })}
            </select>
          </div>
        </div>
      </div>

      {Object.entries(filteredSections).map(([sectionName, sectionList]) => {
        const sectionInfo = sectionNames[sectionName as keyof typeof sectionNames];
        if (!sectionInfo) return null;

        return (
          <div key={sectionName} className="bg-white border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{sectionInfo.name}</h3>
                  <p className="text-gray-600 text-sm">{sectionInfo.description} - 現在{sectionList.length}件</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addCard(sectionName)}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm rounded disabled:opacity-50 transition-colors"
                  >
                    + カード追加
                  </button>
                  <button
                    onClick={() => removeCard(sectionName)}
                    disabled={saving || sectionList.length <= 1}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded disabled:opacity-50 transition-colors"
                  >
                    - カード削除
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      位置
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      記事選択
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイトル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイプ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公開日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sectionList.map((section) => (
                    <tr key={section.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {section.position}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={section.article_id || ''}
                          onChange={(e) => updateSectionArticle(section.id, e.target.value || null)}
                          disabled={saving}
                          className="w-full max-w-xs px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-[#d11a68] focus:border-[#d11a68] rounded"
                        >
                          <option value="">記事を選択...</option>
                          {filteredArticles.map((article) => (
                            <option key={article.id} value={article.id}>
                              {article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {section.article ? (
                            <div className="truncate font-medium">{section.article.title}</div>
                          ) : (
                            <span className="text-gray-400 italic">記事未選択</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.article ? (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {section.article.category}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.article ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            section.article.article_type === 'cosmetic'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {section.article.article_type === 'cosmetic' ? 'コスメ' : '記事'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {section.article ? (
                          new Date(section.article.created_at).toLocaleDateString('ja-JP')
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {section.article ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            section.article.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {section.article.status === 'published' ? '公開中' : '下書き'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            未設定
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeSpecificCard(section.id, sectionName)}
                          disabled={saving || sectionList.length <= 1}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded disabled:opacity-50 transition-colors"
                          title="このカードを削除"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PageContentManager;