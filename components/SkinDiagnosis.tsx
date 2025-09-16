import React, { useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';

const SkinDiagnosis: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const isLoggedIn = () => {
    return localStorage.getItem('userData') !== null;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isLoggedIn()) {
        setShowLoginPopup(true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      setShowLoginPopup(true);
      return;
    }

    const files = e.dataTransfer.files;
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-pink-50"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium mb-6">
              ✨ 科学的アプローチによる肌質診断
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              あなたの肌タイプを
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">正確に</span>
              診断
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              画像アップロードで専門的な見解から肌質タイプ診断と改善サポートを提案できます。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
          {/* Image Upload Section */}
          {!uploadedImage ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">肌画像をアップロード</h2>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-pink-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📷</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  画像をドラッグ&ドロップまたはクリックして選択
                </h3>
                <p className="text-slate-600 mb-6">
                  JPG、PNG形式に対応（最大10MB）
                </p>
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 font-semibold rounded-lg transition-all transform hover:scale-105">
                  画像を選択
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">アップロード完了</h2>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                >
                  別の画像を選択
                </button>
              </div>

              <div className="flex justify-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded skin"
                  className="max-w-full max-h-96 object-contain border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-6 text-white text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2">
                会員限定機能
              </h3>
              <p className="text-pink-100">
                プロフェッショナルな肌タイプ診断をご利用いただくためには、会員登録が必要です。
              </p>
            </div>
            <div className="p-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-slate-600">
                  <span className="text-green-500 mr-3">✓</span>
                  科学的な診断結果
                </div>
                <div className="flex items-center text-slate-600">
                  <span className="text-green-500 mr-3">✓</span>
                  パーソナライズされたケア方法
                </div>
                <div className="flex items-center text-slate-600">
                  <span className="text-green-500 mr-3">✓</span>
                  おすすめ記事の推薦
                </div>
              </div>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold text-center transition-all transform hover:scale-105"
                >
                  会員登録・ログイン
                </a>
                <button
                  onClick={() => setShowLoginPopup(false)}
                  className="block w-full text-slate-500 hover:text-slate-700 py-2 font-medium"
                >
                  あとで登録する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SkinDiagnosis;