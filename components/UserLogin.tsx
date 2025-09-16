import React, { useState } from 'react';

interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  age: string;
  skinType: string;
  hairType: string;
  interests: string[];
}

const UserLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<UserRegistrationData>({
    name: '',
    email: '',
    password: '',
    age: '',
    skinType: 'normal',
    hairType: 'normal',
    interests: []
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const skinTypes = ['普通肌', '乾燥肌', '脂性肌', '混合肌', '敏感肌'];
  const hairTypes = ['普通', 'ダメージ', '乾燥', '脂性', 'カラー・パーマ'];
  const interestOptions = ['スキンケア', 'メイクアップ', 'ヘアケア', 'ボディケア', 'ネイル', 'フレグランス', 'サプリメント', 'エステ・サロン'];

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple login validation (mock)
    if (loginData.email && loginData.password) {
      // In real implementation, validate against database
      window.location.href = '/mypage';
    } else {
      alert('メールアドレスとパスワードを入力してください');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      alert('必須項目を入力してください');
      return;
    }

    // Store user data in localStorage (mock database)
    const userData = {
      ...formData,
      id: Date.now().toString(),
      avatar: `https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face`,
      joinDate: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem('userData', JSON.stringify(userData));

    // Redirect to mypage
    window.location.href = '/mypage';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#d11a68] mb-2">美活部</h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            {isLogin ? 'ログイン' : '新規登録'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            あなたの美容ライフをサポートします
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-[#d11a68] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-[#d11a68] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              新規登録
            </button>
          </div>

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <input
                  type="password"
                  id="loginPassword"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#d11a68] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-semibold"
              >
                ログイン
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  年代
                </label>
                <select
                  id="age"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="10代">10代</option>
                  <option value="20代">20代</option>
                  <option value="30代">30代</option>
                  <option value="40代">40代</option>
                  <option value="50代">50代</option>
                  <option value="60代以上">60代以上</option>
                </select>
              </div>

              <div>
                <label htmlFor="skinType" className="block text-sm font-medium text-gray-700 mb-1">
                  肌質
                </label>
                <select
                  id="skinType"
                  value={formData.skinType}
                  onChange={(e) => setFormData(prev => ({ ...prev, skinType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                >
                  {skinTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hairType" className="block text-sm font-medium text-gray-700 mb-1">
                  髪質
                </label>
                <select
                  id="hairType"
                  value={formData.hairType}
                  onChange={(e) => setFormData(prev => ({ ...prev, hairType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d11a68] focus:border-transparent"
                >
                  {hairTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  関心のある美容分野
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map(interest => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                        className="w-4 h-4 text-[#d11a68] border-gray-300 rounded focus:ring-[#d11a68]"
                      />
                      <span className="ml-2 text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#d11a68] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-semibold"
              >
                アカウント作成
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-600 hover:text-[#d11a68]">
              サイトトップに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;