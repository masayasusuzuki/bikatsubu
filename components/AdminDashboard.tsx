import React, { useState, useEffect } from 'react';
import PageContentManager from './PageContentManager';
import { articlesAPI, Article, supabase } from '../src/lib/supabase';
import { loginHistoryService, LoginHistoryEntry } from '../services/loginHistoryService';
import { useSessionTimeout } from '../src/hooks/useSessionTimeout';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // ログイン履歴関連の状態
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);

  // セッションタイムアウト
  useSessionTimeout();

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'articles') {
      loadArticles();
    } else if (isAuthenticated && activeTab === 'login-history') {
      loadLoginHistory();
    }
  }, [activeTab, isAuthenticated]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || '');

        // profilesテーブルからユーザー名を取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (profile?.username) {
          setUserName(profile.username);
        } else {
          // usernameがない場合はemailの@より前を使用
          setUserName(session.user.email?.split('@')[0] || '');
        }
      } else {
        // Redirect to login
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('認証確認エラー:', error);
      window.location.href = '/admin';
    } finally {
      setAuthLoading(false);
    }
  };

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

  // ログイン履歴を読み込む関数
  const loadLoginHistory = async () => {
    try {
      setLoginHistoryLoading(true);
      const data = await loginHistoryService.getLoginHistory(50, 0);
      setLoginHistory(data);
    } catch (error) {
      console.error('ログイン履歴の読み込みに失敗:', error);
    } finally {
      setLoginHistoryLoading(false);
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

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await supabase.auth.signOut();
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

  // Simple stats focused on content management
  const stats = [
    {
      title: '総記事数',
      value: articles.length.toString(),
      description: 'Total Articles',
      icon: 'document-text'
    },
    {
      title: '公開記事',
      value: articles.filter(article => article.status === 'published').length.toString(),
      description: 'Published Articles',
      icon: 'eye'
    },
    {
      title: '下書き',
      value: articles.filter(article => article.status === 'draft').length.toString(),
      description: 'Draft Articles',
      icon: 'edit'
    },
    {
      title: 'アナリティクス',
      value: 'GA4',
      description: 'Google Analytics',
      icon: 'chart-bar',
      isLink: true
    },
  ];

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68] mx-auto mb-4"></div>
          <p className="text-gray-600">認証確認中...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this component shouldn't render (redirect happens in checkAuth)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-base sm:text-lg">美</span>
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-slate-800">美活部 管理システム</h1>
                  <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Content Management System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">{userName || 'ユーザー'}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-700">
                  {userName ? userName.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-700 hover:bg-slate-800 text-white px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xs sm:text-sm font-medium text-slate-600 uppercase tracking-wide">{stat.title}</h3>
                    <p className="text-xs text-slate-400 mb-2 sm:mb-3">{stat.description}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-600"></div>
                  </div>
                </div>
              </div>
              {stat.isLink && (
                <div className="px-4 sm:px-6 pb-4">
                  <a
                    href="https://analytics.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[#d11a68] text-white px-3 py-2 rounded hover:bg-opacity-80 transition-colors inline-block"
                  >
                    Google Analyticsを開く
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-200 shadow-sm mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-3 px-4 sm:py-4 sm:px-8 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'articles'
                    ? 'border-slate-800 text-slate-800 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                記事管理
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`py-3 px-4 sm:py-4 sm:px-8 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'content'
                    ? 'border-slate-800 text-slate-800 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                コンテンツ管理
              </button>
              <button
                onClick={() => setActiveTab('login-history')}
                className={`py-3 px-4 sm:py-4 sm:px-8 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'login-history'
                    ? 'border-slate-800 text-slate-800 bg-slate-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                ログイン履歴
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-8">

            {activeTab === 'articles' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 pb-3 border-b border-gray-200 gap-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">記事管理</h2>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="search"
                      placeholder="記事を検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-slate-500 focus:border-slate-500 w-full sm:w-auto"
                    />
                    <button
                      onClick={() => window.location.href = '/admin/articles/new'}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap">
                      新規作成
                    </button>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          タイトル
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          カテゴリ1
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          カテゴリ2
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          タイプ
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          ステータス
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          作成日
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                              <span className="ml-2 text-sm sm:text-base text-slate-600">読み込み中...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredArticles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-slate-500">
                            {searchQuery ? '検索結果が見つかりませんでした' : '記事がありません'}
                          </td>
                        </tr>
                      ) : (
                        filteredArticles.map((article) => (
                          <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="text-xs sm:text-sm font-medium text-slate-900 max-w-[150px] sm:max-w-xs">
                                <div className="truncate">{article.title}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full whitespace-nowrap">
                                {article.category || '-'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                                {article.category2 || '-'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                article.article_type === 'cosmetic'
                                  ? 'bg-pink-100 text-pink-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {article.article_type === 'cosmetic' ? 'コスメ' : '記事'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <label className="inline-flex items-center">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={article.status === 'published'}
                                    onChange={() => handleToggleStatus(article.id, article.status)}
                                  />
                                  <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors cursor-pointer ${
                                    article.status === 'published'
                                      ? 'bg-emerald-500'
                                      : 'bg-gray-300'
                                  }`}>
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                      article.status === 'published'
                                        ? 'translate-x-5 sm:translate-x-6'
                                        : 'translate-x-0.5'
                                    } mt-0.5`}></div>
                                  </div>
                                </div>
                                <span className={`ml-2 text-xs font-medium whitespace-nowrap ${
                                  article.status === 'published'
                                    ? 'text-emerald-800'
                                    : 'text-gray-600'
                                }`}>
                                  {article.status === 'published' ? '公開中' : '下書き'}
                                </span>
                              </label>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                              {new Date(article.created_at).toLocaleDateString('ja-JP')}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="flex gap-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleEditArticle(article.id)}
                                  className="text-slate-600 hover:text-slate-800 text-xs sm:text-sm font-medium"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(article.id)}
                                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
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

            {activeTab === 'content' && (
              <PageContentManager />
            )}

            {activeTab === 'login-history' && (
              <div>
                <div className="mb-4 sm:mb-6 pb-3 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">ログイン履歴</h2>
                </div>

                {/* ログイン履歴テーブル */}
                <div className="bg-white border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          ユーザー
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          ログイン日時
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginHistoryLoading ? (
                        <tr>
                          <td colSpan={2} className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                              <span className="ml-2 text-sm sm:text-base text-slate-600">読み込み中...</span>
                            </div>
                          </td>
                        </tr>
                      ) : loginHistory.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-slate-500">
                            ログイン履歴がありません
                          </td>
                        </tr>
                      ) : (
                        loginHistory.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="text-xs sm:text-sm font-medium text-slate-900">
                                {entry.user_name}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                              {loginHistoryService.formatLoginTime(entry.login_time)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;