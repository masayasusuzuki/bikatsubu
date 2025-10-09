import React, { useState, useEffect } from 'react';
import PageContentManager from './PageContentManager';
import { articlesAPI, Article } from '../src/lib/supabase';
import { ga4Service, AnalyticsData } from '../services/ga4Service';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'articles') {
      loadArticles();
    }
    // Load analytics data when component mounts or when overview tab is active
    if (activeTab === 'overview') {
      loadAnalyticsData();
    }
  }, [activeTab]);

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articlesAPI.getAllArticles();
      setArticles(data);
    } catch (error) {
      console.error('記事の読み込みに失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await ga4Service.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('アナリティクスデータの読み込みに失敗:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleEditArticle = (articleId: string) => {
    window.location.href = `/admin/articles/edit/${articleId}`;
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('この記事を削除しますか？この操作は取り消せません。')) return;

    try {
      await articlesAPI.deleteArticle(articleId);
      await loadArticles(); // Reload articles
      alert('記事を削除しました');
    } catch (error) {
      console.error('記事の削除に失敗:', error);
      alert('記事の削除に失敗しました');
    }
  };

  const handleToggleStatus = async (articleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      await articlesAPI.updateArticle(articleId, { status: newStatus as 'draft' | 'published' });
      await loadArticles(); // Reload articles
    } catch (error) {
      console.error('記事のステータス更新に失敗:', error);
      alert('記事のステータス更新に失敗しました');
    }
  };

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      window.location.href = '/';
    }
  };

  const generatePDFReport = () => {
    // Create a canvas element to generate PDF-like content
    const canvas = document.createElement('canvas');
    canvas.width = 794; // A4 width at 96 DPI
    canvas.height = 1123; // A4 height at 96 DPI
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Report data
    const reportData = {
      period: '2024年8月',
      totalArticles: 156,
      monthlyPV: 58920,
      avgSessionDuration: '3:24',
      bounceRate: '42.3%',
      topCategories: [
        { name: 'スキンケア', percentage: 34, views: 20073 },
        { name: 'メイクアップ', percentage: 28, views: 16498 },
        { name: 'ヘアケア', percentage: 22, views: 12962 },
        { name: 'ボディケア', percentage: 16, views: 9427 }
      ],
      topArticles: [
        { title: '【2024年版】30代におすすめのエイジングケア美容液TOP5', views: 2543, engagement: '8.2%' },
        { title: '初心者でも簡単！きれいな眉毛の描き方完全ガイド', views: 2201, engagement: '7.8%' },
        { title: 'プロが解説！崩れない夏ベースメイクの作り方', views: 1987, engagement: '9.1%' }
      ]
    };

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('美活部 月次レポート', 40, 35);
    ctx.font = '16px Arial';
    ctx.fillText(reportData.period, 40, 60);

    // Current date
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    const dateText = `生成日時: ${new Date().toLocaleString('ja-JP')}`;
    const dateWidth = ctx.measureText(dateText).width;
    ctx.fillText(dateText, canvas.width - dateWidth - 40, 60);

    let yPos = 120;

    // Stats section
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('サイト統計', 40, yPos);

    yPos += 40;
    const stats = [
      { label: '総記事数', value: `${reportData.totalArticles}記事`, color: '#3b82f6' },
      { label: '月間PV', value: `${reportData.monthlyPV.toLocaleString()}PV`, color: '#10b981' },
      { label: '平均滞在時間', value: reportData.avgSessionDuration, color: '#8b5cf6' },
      { label: '直帰率', value: reportData.bounceRate, color: '#f59e0b' }
    ];

    stats.forEach((stat, index) => {
      const xPos = 40 + (index % 2) * 350;
      const currentYPos = yPos + Math.floor(index / 2) * 80;

      // Stat box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(xPos, currentYPos, 320, 60);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(xPos, currentYPos, 320, 60);

      // Color accent
      ctx.fillStyle = stat.color;
      ctx.fillRect(xPos, currentYPos, 4, 60);

      // Text
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.fillText(stat.label, xPos + 20, currentYPos + 25);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(stat.value, xPos + 20, currentYPos + 45);
    });

    yPos += 200;

    // Categories section
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('カテゴリ別アクセス', 40, yPos);

    yPos += 40;
    reportData.topCategories.forEach((category, index) => {
      const barWidth = (category.percentage / 100) * 300;

      // Category name and percentage
      ctx.fillStyle = '#374151';
      ctx.font = '14px Arial';
      ctx.fillText(`${category.name} (${category.percentage}%)`, 40, yPos + 15);

      // Views count
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.fillText(`${category.views.toLocaleString()}PV`, 200, yPos + 15);

      // Progress bar background
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(300, yPos + 5, 300, 15);

      // Progress bar
      const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
      ctx.fillStyle = colors[index];
      ctx.fillRect(300, yPos + 5, barWidth, 15);

      yPos += 35;
    });

    yPos += 40;

    // Top articles section
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('人気記事TOP3', 40, yPos);

    yPos += 40;
    reportData.topArticles.forEach((article, index) => {
      // Article box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, yPos, canvas.width - 80, 70);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, yPos, canvas.width - 80, 70);

      // Rank circle
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(70, yPos + 35, 15, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), 70, yPos + 40);
      ctx.textAlign = 'left';

      // Article title (truncated if too long)
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px Arial';
      let title = article.title;
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      ctx.fillText(title, 100, yPos + 25);

      // Stats
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.fillText(`PV: ${article.views.toLocaleString()} | エンゲージメント: ${article.engagement}`, 100, yPos + 45);

      yPos += 85;
    });


    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `美活部_月次レポート_${new Date().toISOString().slice(0, 7)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('レポートを生成しました。画像ファイルとしてダウンロードされます。');
      }
    }, 'image/png');
  };

  // Generate stats from analytics data
  const stats = analyticsData ? [
    {
      title: '総記事数',
      value: analyticsData.totalArticles.toString(),
      change: '+12%', // This could be calculated from previous data
      trend: 'up' as const,
      description: 'Total Articles',
      icon: 'document-text'
    },
    {
      title: '月間PV',
      value: analyticsData.monthlyPageViews.toLocaleString(),
      change: analyticsData.previousMonthPageViews 
        ? ga4Service.calculateChange(analyticsData.monthlyPageViews, analyticsData.previousMonthPageViews).change
        : '+0%',
      trend: analyticsData.previousMonthPageViews 
        ? ga4Service.calculateChange(analyticsData.monthlyPageViews, analyticsData.previousMonthPageViews).trend
        : 'up' as const,
      description: 'Monthly Page Views',
      icon: 'chart-bar'
    },
    {
      title: '平均滞在時間',
      value: analyticsData.avgSessionDuration,
      change: '+5.3%', // Could be calculated from previous data
      trend: 'up' as const,
      description: 'Avg. Session Duration',
      icon: 'clock'
    },
    {
      title: '直帰率',
      value: analyticsData.bounceRate,
      change: '-8.1%', // Could be calculated from previous data
      trend: 'up' as const,
      description: 'Bounce Rate',
      icon: 'chart-line'
    },
  ] : [
    // Fallback data while loading
    {
      title: '総記事数',
      value: '---',
      change: '---',
      trend: 'up' as const,
      description: 'Total Articles',
      icon: 'document-text'
    },
    {
      title: '月間PV',
      value: '---',
      change: '---',
      trend: 'up' as const,
      description: 'Monthly Page Views',
      icon: 'chart-bar'
    },
    {
      title: '平均滞在時間',
      value: '---',
      change: '---',
      trend: 'up' as const,
      description: 'Avg. Session Duration',
      icon: 'clock'
    },
    {
      title: '直帰率',
      value: '---',
      change: '---',
      trend: 'up' as const,
      description: 'Bounce Rate',
      icon: 'chart-line'
    },
  ];

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">美</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">美活部 管理システム</h1>
                  <p className="text-sm text-slate-500">Content Management System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">管理者</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                <span className="text-sm font-semibold text-slate-700">A</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 text-sm font-medium transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">{stat.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">{stat.description}</p>
                    {analyticsLoading ? (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                        <span className="text-lg text-slate-500">読み込み中...</span>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                    )}
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}>
                        {analyticsLoading ? '---' : stat.change}
                      </span>
                      <span className="text-sm text-slate-500 ml-2">前月比</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 flex items-center justify-center">
                    <div className="w-6 h-6 bg-slate-600"></div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-4">
                <p className="text-xs text-slate-400">
                  {analyticsLoading 
                    ? '※ GA4データを読み込み中...' 
                    : analyticsData 
                      ? '※ GA4連携済み - リアルタイムデータ表示中'
                      : '※ 本番環境移行後にGA4連携で実データ表示'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-200 shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-8 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-slate-800 text-slate-800 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                ダッシュボード
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-8 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'articles'
                    ? 'border-slate-800 text-slate-800 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                記事管理
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`py-4 px-8 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pages'
                    ? 'border-slate-800 text-slate-800 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                ページ管理
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-6 pb-3 border-b border-gray-200">システム概要</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-200 p-6">
                      <h3 className="text-base font-semibold text-slate-700 mb-4 pb-2 border-b border-gray-100">月間データ</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600">記事投稿数</span>
                          <span className="font-semibold text-slate-800">24記事</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600">平均エンゲージメント率</span>
                          <span className="font-semibold text-emerald-600">+15.8%</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600">新規訪問率</span>
                          <span className="font-semibold text-slate-800">68.4%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6">
                      <h3 className="text-base font-semibold text-slate-700 mb-4 pb-2 border-b border-gray-100">カテゴリ別アクセス</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600">スキンケア</span>
                          <span className="font-semibold text-slate-800">34%</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600">メイクアップ</span>
                          <span className="font-semibold text-slate-800">28%</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-slate-600">ヘアケア</span>
                          <span className="font-semibold text-slate-800">22%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-6 pb-3 border-b border-gray-200">管理操作</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => window.location.href = '/admin/articles/new'}
                      className="bg-white border border-gray-300 text-slate-700 p-4 hover:bg-slate-50 transition-colors font-medium text-sm">
                      新規記事作成
                    </button>
                    <button
                      onClick={generatePDFReport}
                      className="bg-white border border-gray-300 text-slate-700 p-4 hover:bg-slate-50 transition-colors font-medium text-sm">
                      レポート生成
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'articles' && (
              <div>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-slate-800">記事管理</h2>
                  <div className="flex space-x-3">
                    <input
                      type="search"
                      placeholder="記事を検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                    <button
                      onClick={() => window.location.href = '/admin/articles/new'}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 text-sm font-medium transition-colors">
                      新規作成
                    </button>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          タイトル
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          カテゴリ1
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          カテゴリ2
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          タイプ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          作成日
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                              <span className="ml-2 text-slate-600">読み込み中...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredArticles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                            {searchQuery ? '検索結果が見つかりませんでした' : '記事がありません'}
                          </td>
                        </tr>
                      ) : (
                        filteredArticles.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900 max-w-xs">
                                <div className="truncate">{article.title}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                {article.category || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {article.category2 || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                article.article_type === 'cosmetic'
                                  ? 'bg-pink-100 text-pink-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {article.article_type === 'cosmetic' ? 'コスメ' : '記事'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <label className="inline-flex items-center">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={article.status === 'published'}
                                    onChange={() => handleToggleStatus(article.id, article.status)}
                                  />
                                  <div className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                                    article.status === 'published' 
                                      ? 'bg-emerald-500' 
                                      : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                      article.status === 'published' 
                                        ? 'translate-x-6' 
                                        : 'translate-x-0.5'
                                    } mt-0.5`}></div>
                                  </div>
                                </div>
                                <span className={`ml-2 text-xs font-medium ${
                                  article.status === 'published'
                                    ? 'text-emerald-800'
                                    : 'text-gray-600'
                                }`}>
                                  {article.status === 'published' ? '公開中' : '下書き'}
                                </span>
                              </label>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(article.created_at).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditArticle(article.id)}
                                  className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  削除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'pages' && (
              <PageContentManager />
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;