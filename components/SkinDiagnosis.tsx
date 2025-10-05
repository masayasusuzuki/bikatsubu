import React, { useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { analyzeSkinImage } from '../services/geminiService';
import type { SkinAnalysisResult } from '../types/skinAnalysis';

const SkinDiagnosis: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError("画像サイズは20MB以下にしてください");
      return;
    }

    // MIME型チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setError("対応形式: JPG, PNG, WEBP, HEIC, HEIF");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;
      setUploadedImage(base64Image);

      // 診断開始
      setIsAnalyzing(true);
      try {
        const result = await analyzeSkinImage(base64Image);
        setDiagnosisResult(result);
      } catch (error) {
        console.error(error);
        setError("診断に失敗しました。もう一度お試しください。");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // ファイルサイズチェック (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError("画像サイズは20MB以下にしてください");
      return;
    }

    // MIME型チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setError("対応形式: JPG, PNG, WEBP, HEIC, HEIF");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;
      setUploadedImage(base64Image);

      // 診断開始
      setIsAnalyzing(true);
      try {
        const result = await analyzeSkinImage(base64Image);
        setDiagnosisResult(result);
      } catch (error) {
        console.error(error);
        setError("診断に失敗しました。もう一度お試しください。");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
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
          <div className="max-w-4xl mx-auto">

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
              {error}
            </div>
          )}

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
                  JPG、PNG、WEBP形式に対応（最大20MB）
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
            <div className="space-y-6">
              {/* Uploaded Image */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">アップロード完了</h2>
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setDiagnosisResult(null);
                      setError(null);
                    }}
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

              {/* Loading State */}
              {isAnalyzing && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">AI解析中...</h3>
                  <p className="text-slate-600">あなたの肌を詳しく分析しています</p>
                </div>
              )}

              {/* Diagnosis Result */}
              {!isAnalyzing && diagnosisResult && (
                <div className="space-y-6">
                  {/* Skin Type */}
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-xl border border-pink-100 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">診断結果</h2>
                    <div className="text-center">
                      <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full text-2xl font-bold mb-2">
                        {diagnosisResult.skinType}
                      </div>
                    </div>
                  </div>

                  {/* Skin Condition */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">💧</span>
                      肌状態
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">水分状態</p>
                        <p className="font-semibold text-slate-800">{diagnosisResult.condition.moisture}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">肌理</p>
                        <p className="font-semibold text-slate-800">{diagnosisResult.condition.texture}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">透明感</p>
                        <p className="font-semibold text-slate-800">{diagnosisResult.condition.clarity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Concerns */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">⚠️</span>
                      主な肌悩み
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {diagnosisResult.concerns.map((concern, index) => (
                        <span key={index} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">✨</span>
                      おすすめケア方法
                    </h3>
                    <ul className="space-y-3">
                      {diagnosisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-3 mt-1">✓</span>
                          <span className="text-slate-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Avoid */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🚫</span>
                      避けるべきこと
                    </h3>
                    <ul className="space-y-3">
                      {diagnosisResult.avoid.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-3 mt-1">✗</span>
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SkinDiagnosis;