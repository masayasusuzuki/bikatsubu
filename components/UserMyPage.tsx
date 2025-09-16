import React, { useState } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age: string;
  skinType: string;
  hairType: string;
  interests: string[];
  joinDate: string;
}

interface FavoriteArticle {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  savedDate: string;
  readTime: string;
}

interface ReadingHistory {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  readDate: string;
  readTime: string;
}

interface ArticleRating {
  articleId: string;
  rating: 'like' | 'love';
  ratedDate: string;
}

const UserMyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('favorites');

  // Get user data from localStorage or use default mock data
  const getStoredUserData = (): UserProfile => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const userData = JSON.parse(storedData);
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        age: userData.age || '20代',
        skinType: userData.skinType || '普通肌',
        hairType: userData.hairType || '普通',
        interests: userData.interests || ['スキンケア'],
        joinDate: userData.joinDate
      };
    }

    // Default mock data if no stored data
    return {
      id: '1',
      name: '田中美咲',
      email: 'misaki.tanaka@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=150&h=150&fit=crop&auto=format',
      age: '20代後半',
      skinType: '混合肌',
      hairType: 'ストレート・細毛',
      interests: ['スキンケア', 'メイクアップ', 'ヘアケア'],
      joinDate: '2024-01-15'
    };
  };

  const userProfile = getStoredUserData();

  const favoriteArticles: FavoriteArticle[] = [
    {
      id: '1',
      title: '【2024年版】30代におすすめのエイジングケア美容液TOP5',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=200&fit=crop&auto=format',
      category: 'スキンケア',
      savedDate: '2024-09-10',
      readTime: '5分'
    },
    {
      id: '2',
      title: 'プロが解説！崩れない夏ベースメイクの作り方',
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&auto=format',
      category: 'メイクアップ',
      savedDate: '2024-09-08',
      readTime: '3分'
    },
    {
      id: '3',
      title: '美容師が伝授！サロン帰りの仕上がりをキープするヘアドライ術',
      imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=200&fit=crop&auto=format',
      category: 'ヘアケア',
      savedDate: '2024-09-05',
      readTime: '4分'
    },
    {
      id: '4',
      title: '乾燥肌さん必見！冬のスキンケア完全ガイド',
      imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300&h=200&fit=crop&auto=format',
      category: 'スキンケア',
      savedDate: '2024-09-01',
      readTime: '6分'
    }
  ];

  const readingHistory: ReadingHistory[] = [
    {
      id: '1',
      title: 'プチプラ化粧水の正しい選び方とおすすめ5選',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&auto=format',
      category: 'スキンケア',
      readDate: '2024-09-15',
      readTime: '4分'
    },
    {
      id: '2',
      title: 'アイメイクを長時間キープする方法',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop&auto=format',
      category: 'メイクアップ',
      readDate: '2024-09-14',
      readTime: '3分'
    },
    {
      id: '3',
      title: '美容師が解説！髪質別シャンプーの選び方',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop&auto=format',
      category: 'ヘアケア',
      readDate: '2024-09-13',
      readTime: '5分'
    },
    {
      id: '4',
      title: '【完全保存版】ファンデーション選びの基本',
      imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&h=200&fit=crop&auto=format',
      category: 'メイクアップ',
      readDate: '2024-09-12',
      readTime: '7分'
    },
    {
      id: '5',
      title: '敏感肌でも使える！おすすめクレンジング特集',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop&auto=format',
      category: 'スキンケア',
      readDate: '2024-09-11',
      readTime: '4分'
    }
  ];

  const articleRatings: ArticleRating[] = [
    { articleId: '1', rating: 'love', ratedDate: '2024-09-15' },
    { articleId: '2', rating: 'like', ratedDate: '2024-09-14' },
    { articleId: '3', rating: 'love', ratedDate: '2024-09-13' }
  ];


  const getRatingIcon = (rating: 'like' | 'love') => {
    return rating === 'love' ? '❤️' : '👍';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                ← サイトトップに戻る
              </button>
              <h1 className="text-xl font-bold text-slate-800">マイページ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">ようこそ、{userProfile.name}さん</span>
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 text-sm font-medium transition-colors">
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 mb-6">
              <div className="text-center">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h2 className="text-lg font-semibold text-slate-800">{userProfile.name}</h2>
                <p className="text-sm text-slate-500">{userProfile.email}</p>
                <p className="text-xs text-slate-400 mt-2">
                  登録日: {new Date(userProfile.joinDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div className="mt-6 space-y-3">
                <div>
                  <span className="text-xs font-medium text-slate-600">年齢</span>
                  <p className="text-sm text-slate-800">{userProfile.age}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-600">肌質</span>
                  <p className="text-sm text-slate-800">{userProfile.skinType}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-600">髪質</span>
                  <p className="text-sm text-slate-800">{userProfile.hairType}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-600">興味のあるカテゴリ</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userProfile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 bg-slate-600 hover:bg-slate-700 text-white py-2 text-sm font-medium transition-colors">
                プロフィール編集
              </button>
            </div>

            {/* Navigation */}
            <nav className="bg-white border border-gray-200">
              <div className="space-y-1">
                {[
                  { id: 'favorites', label: 'お気に入り記事', icon: '❤️' },
                  { id: 'history', label: '閲覧履歴', icon: '📖' },
                  { id: 'ratings', label: '評価した記事', icon: '⭐' },
                  { id: 'profile', label: 'プロフィール', icon: '👤' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-600'
                        : 'text-slate-600 hover:bg-gray-50 hover:text-slate-800'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">お気に入り記事</h2>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-600">保存記事</p>
                          <p className="text-2xl font-bold text-slate-900">{favoriteArticles.length}記事</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-pink-600 text-xl">❤️</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-600">閲覧履歴</p>
                          <p className="text-2xl font-bold text-slate-900">{readingHistory.length}記事</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-xl">📖</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-600">評価数</p>
                          <p className="text-2xl font-bold text-slate-900">{articleRatings.length}件</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 text-xl">⭐</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">最近の閲覧記事</h3>
                    <div className="space-y-4">
                      {readingHistory.slice(0, 3).map((article) => (
                        <div key={article.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-16 h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800 line-clamp-2">{article.title}</p>
                            <div className="flex items-center mt-2 text-xs text-slate-500">
                              <span className="px-2 py-1 bg-gray-100 rounded mr-2">{article.category}</span>
                              <span>{formatDate(article.readDate)} ・ {article.readTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'beauty-records' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">美容記録</h2>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 text-sm font-medium transition-colors">
                    新しい記録を追加
                  </button>
                </div>

                <div className="space-y-4">
                  {beautyRecords.map((record) => (
                    <div key={record.id} className="bg-white border border-gray-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">{record.date}</h3>
                          <span className={`inline-block px-3 py-1 text-sm rounded mt-2 ${getConditionColor(record.skinCondition)}`}>
                            肌の調子: {getConditionText(record.skinCondition)}
                          </span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                          <span className="text-lg">⋯</span>
                        </button>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">使用した製品</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.products.map((product, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">メモ</h4>
                        <p className="text-sm text-slate-600">{record.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cosmetics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">コスメ管理</h2>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 text-sm font-medium transition-colors">
                    新しいアイテムを追加
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cosmeticItems.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                          <p className="text-xs text-slate-500">{item.brand}</p>
                          <p className="text-xs text-slate-500">{item.category}</p>
                          <div className="mt-2">
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            期限: {new Date(item.expiryDate).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">お気に入り記事</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteArticles.map((article) => (
                    <div key={article.id} className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                            {article.category}
                          </span>
                          <button className="text-red-500 hover:text-red-700">
                            <span className="text-lg">❤️</span>
                          </button>
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          保存日: {new Date(article.savedDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">プロフィール設定</h2>

                <div className="bg-white border border-gray-200 p-6">
                  <div className="flex items-center space-x-6 mb-6">
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{userProfile.name}</h3>
                      <p className="text-sm text-slate-600">{userProfile.email}</p>
                      <p className="text-xs text-slate-500">登録日: {formatDate(userProfile.joinDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">年代</label>
                      <p className="text-sm text-slate-600 p-2 bg-gray-50 rounded">{userProfile.age}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">肌質</label>
                      <p className="text-sm text-slate-600 p-2 bg-gray-50 rounded">{userProfile.skinType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">髪質</label>
                      <p className="text-sm text-slate-600 p-2 bg-gray-50 rounded">{userProfile.hairType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">関心分野</label>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.interests.map((interest, index) => (
                          <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 text-sm font-medium transition-colors">
                      プロフィールを編集
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMyPage;