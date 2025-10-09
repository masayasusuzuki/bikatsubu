import React, { useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { analyzeSkinImage } from '../services/geminiService';
import type { SkinAnalysisResult } from '../types/skinAnalysis';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SkinDiagnosis: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 肌タイプの説明を取得
  const getSkinTypeDescription = (skinType: string): string => {
    const descriptions: { [key: string]: string } = {
      '乾燥肌': '皮脂分泌が少なく、水分保持力が低い肌質です。カサつきやつっぱり感を感じやすく、小じわが目立ちやすい傾向があります。',
      '脂性肌': '皮脂分泌が活発で、テカリやベタつきが気になる肌質です。毛穴が開きやすく、ニキビができやすい傾向があります。',
      '混合肌': 'Tゾーン（額・鼻）は脂性で、Uゾーン（頬・顎）は乾燥するなど、部位によって肌質が異なるタイプです。日本人に最も多い肌質と言われています。',
      '普通肌': '水分と皮脂のバランスが整った理想的な肌質です。肌トラブルが少なく、きめが整っている状態です。',
      '敏感肌': '外部刺激に対して反応しやすく、赤みやかゆみが出やすい肌質です。バリア機能が低下している可能性があります。',
    };

    // 部分一致で検索
    for (const [key, value] of Object.entries(descriptions)) {
      if (skinType.includes(key)) {
        return value;
      }
    }

    return '肌の状態を詳しく分析した結果です。適切なケアで肌質改善を目指しましょう。';
  };

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
            <div className="space-y-6">
              {/* 撮影方法ガイド */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">撮影方法ガイド</h2>
                <div className="flex justify-center mb-4">
                  <img
                    src="/diagnosis/写真撮影方法.jpg"
                    alt="写真撮影方法のガイド"
                    className="max-w-full rounded-lg border border-gray-200"
                  />
                </div>
                <p className="text-slate-600 text-center">
                  正確な診断のため、明るい場所で正面から撮影してください
                </p>
              </div>

              {/* アップロードエリア */}
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
                  {/* ヘッダー */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-medium mb-6">
                      ✨ AI肌診断レポート
                    </div>
                    <h2 className="text-4xl font-bold text-slate-800 mb-4">
                      診断完了
                    </h2>
                    <p className="text-slate-600 text-lg">
                      あなたの肌タイプと最適なケア方法をご提案します
                    </p>
                  </div>

                  {/* Skin Condition */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <h3 className="text-2xl font-bold text-slate-800">肌状態分析</h3>
                      <span className="text-sm text-slate-500 uppercase tracking-wide">Skin Condition Analysis</span>
                    </div>

                    {/* レーダーチャート */}
                    <div className="mb-8">
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={[
                          { subject: '水分', score: diagnosisResult.condition.moistureScore || 3, fullMark: 5 },
                          { subject: '透明感', score: diagnosisResult.condition.clarityScore || 3, fullMark: 5 },
                          { subject: '弾力', score: diagnosisResult.condition.elasticityScore || 3, fullMark: 5 },
                          { subject: '毛穴', score: diagnosisResult.condition.poreScore || 3, fullMark: 5 },
                          { subject: '肌理', score: diagnosisResult.condition.textureScore || 3, fullMark: 5 },
                        ]}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 14, fontWeight: 600 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <Radar name="肌状態" dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 詳細スコア */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">詳細評価</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-600">水分状態</p>
                            <span className="text-rose-600 font-bold text-lg">{diagnosisResult.condition.moistureScore || 3}/5</span>
                          </div>
                          <p className="text-slate-700">{diagnosisResult.condition.moisture}</p>
                        </div>
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-600">肌理</p>
                            <span className="text-rose-600 font-bold text-lg">{diagnosisResult.condition.textureScore || 3}/5</span>
                          </div>
                          <p className="text-slate-700">{diagnosisResult.condition.texture}</p>
                        </div>
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-600">透明感</p>
                            <span className="text-rose-600 font-bold text-lg">{diagnosisResult.condition.clarityScore || 3}/5</span>
                          </div>
                          <p className="text-slate-700">{diagnosisResult.condition.clarity}</p>
                        </div>
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-600">弾力</p>
                            <span className="text-rose-600 font-bold text-lg">{diagnosisResult.condition.elasticityScore || 3}/5</span>
                          </div>
                          <p className="text-slate-700">肌のハリ・弾力性</p>
                        </div>
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-600">毛穴</p>
                            <span className="text-rose-600 font-bold text-lg">{diagnosisResult.condition.poreScore || 3}/5</span>
                          </div>
                          <p className="text-slate-700">毛穴の目立ちにくさ</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 診断結果・ケア方法 統合カード */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    {/* 肌タイプ */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-slate-800">肌タイプ</h3>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Skin Type</span>
                      </div>
                      <div className="text-center py-4">
                        <div className="inline-block bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 text-rose-800 px-10 py-5 rounded-xl mb-4">
                          <p className="text-2xl font-bold">{diagnosisResult.skinType}</p>
                        </div>
                        <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
                          {getSkinTypeDescription(diagnosisResult.skinType)}
                        </p>
                      </div>
                    </div>

                    {/* 主な肌悩み */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-slate-800">主な肌悩み</h3>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Skin Concerns</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {diagnosisResult.concerns.map((concern, index) => (
                          <div key={index} className="bg-amber-50 border border-amber-200 text-slate-800 px-5 py-3 rounded-lg font-medium flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                            {concern}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 推奨ケア方法 */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-slate-800">推奨ケア方法</h3>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Recommended Care</span>
                      </div>
                      <div className="space-y-3">
                        {diagnosisResult.recommendations.map((rec, index) => (
                          <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start">
                            <div className="flex-shrink-0 w-7 h-7 bg-emerald-500 text-white rounded-md flex items-center justify-center font-bold mr-3 mt-0.5 text-sm">
                              {index + 1}
                            </div>
                            <p className="text-slate-700 leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 注意事項 */}
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-slate-800">注意事項</h3>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Things to Avoid</span>
                      </div>
                      <div className="space-y-3">
                        {diagnosisResult.avoid.map((item, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                            <div className="flex-shrink-0 w-7 h-7 bg-red-500 text-white rounded-md flex items-center justify-center font-bold mr-3 mt-0.5 text-sm">
                              !
                            </div>
                            <p className="text-slate-700 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SNSシェア */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                      <h3 className="text-2xl font-bold text-slate-800">診断結果をシェア</h3>
                      <span className="text-sm text-slate-500 uppercase tracking-wide">Share Results</span>
                    </div>
                    <p className="text-slate-600 mb-6 text-center">
                      あなたの肌診断結果をSNSでシェアしましょう
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => {
                          const text = `美活部で肌タイプ診断をしました！\n診断結果: ${diagnosisResult.skinType}\n\n#美活部 #肌診断 #スキンケア`;
                          const url = window.location.href;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                        }}
                        className="flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>X(Twitter)でシェア</span>
                      </button>
                      <button
                        onClick={() => {
                          const text = `美活部で肌タイプ診断をしました！診断結果: ${diagnosisResult.skinType}`;
                          const url = window.location.href;
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#0C63D4] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebookでシェア</span>
                      </button>
                      <button
                        onClick={() => {
                          const text = `美活部で肌タイプ診断をしました！診断結果: ${diagnosisResult.skinType}`;
                          const url = window.location.href;
                          window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text + '\n' + url)}`, '_blank');
                        }}
                        className="flex items-center justify-center gap-3 bg-[#06C755] hover:bg-[#05B54C] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.086l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                        </svg>
                        <span>LINEでシェア</span>
                      </button>
                    </div>
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
