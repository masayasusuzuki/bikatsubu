import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { analyzeSkinImage, validateFaceImage } from '../services/geminiService';
import type { SkinAnalysisResult } from '../types/skinAnalysis';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { articlesAPI, type Article } from '../src/lib/supabase';
import { usePageTracking } from '../hooks/usePageTracking';

const SkinDiagnosis: React.FC = () => {
  // Google Analytics ページビュー追跡
  usePageTracking();

  // ページタイトルを設定
  useEffect(() => {
    document.title = '肌タイプ診断 | 美活部（公式）';
  }, []);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(true);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // 肌タイプに応じた画像パスを取得
  const getSkinTypeImage = (skinType: string): string => {
    const imageMap: { [key: string]: string } = {
      '乾燥肌': '/card/skin-dry.png',
      '脂性肌': '/card/skin-oily.png',
      '混合肌': '/card/skin-combination.png',
      '普通肌': '/card/skin-normal.png',
    };

    // 部分一致で検索
    for (const [key, value] of Object.entries(imageMap)) {
      if (skinType.includes(key)) {
        return value;
      }
    }

    // デフォルト画像
    return '/card/skin-diagnosis.png';
  };

  // フェイクプログレスバーの開始
  const startFakeProgress = () => {
    setProgress(0);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // フェイクプログレスのロジック
    // 0-50%: 速く進む（100msごとに2%ずつ）
    // 50-80%: 普通（200msごとに1%ずつ）
    // 80-95%: ゆっくり（500msごとに0.5%ずつ）
    // 95-99%: 超ゆっくり（1000msごとに0.2%ずつ）

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) {
          return prev + 2; // 速く進む
        } else if (prev < 80) {
          return prev + 1; // 普通
        } else if (prev < 95) {
          return prev + 0.5; // ゆっくり
        } else if (prev < 99) {
          return prev + 0.2; // 超ゆっくり
        }
        return prev; // 99%で停止
      });
    }, 200);
  };

  // プログレスバーを完了させる
  const completeProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(100);

    // 100%になったら少し待ってからリセット
    setTimeout(() => {
      setProgress(0);
    }, 500);
  };

  // 診断結果が出たらOGP画像を動的に更新
  useEffect(() => {
    if (diagnosisResult) {
      const imagePath = getSkinTypeImage(diagnosisResult.skinType);
      const fullImageUrl = `https://bikatsubu-media.jp${imagePath}`;

      // OGP画像を更新
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', fullImageUrl);
      }

      // Twitter画像を更新
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', fullImageUrl);
      }

      // OGタイトルとディスクリプションも更新
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `肌タイプ診断結果：${diagnosisResult.skinType} | 美活部`);
      }

      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `肌タイプ診断結果：${diagnosisResult.skinType} | 美活部`);
      }
    }
  }, [diagnosisResult]);

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
      startFakeProgress(); // フェイクプログレスバー開始

      try {
        // 顔画像のバリデーション
        const validation = await validateFaceImage(base64Image);
        if (!validation.isValid) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setError(validation.errorMessage || "この画像は肌診断に適していません。");
          setUploadedImage(null);
          setIsAnalyzing(false);
          setProgress(0);
          return;
        }

        // 肌診断実行
        const result = await analyzeSkinImage(base64Image);
        completeProgress(); // プログレスバーを100%に
        setDiagnosisResult(result);

        // おすすめ記事を取得
        setIsLoadingArticles(true);
        try {
          const articles = await articlesAPI.getRecommendedArticles(result.skinType, result.concerns);
          setRecommendedArticles(articles);
        } catch (articleError) {
          console.error('Failed to fetch recommended articles:', articleError);
          // 記事取得失敗は診断結果表示を妨げない
        } finally {
          setIsLoadingArticles(false);
        }
      } catch (error) {
        clearInterval(countdownInterval);
        console.error(error);
        setError("診断に失敗しました。しばらく経ってから再度お試しください。");
        setUploadedImage(null);
        setCountdown(null);
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
      startFakeProgress(); // フェイクプログレスバー開始

      try {
        // 顔画像のバリデーション
        const validation = await validateFaceImage(base64Image);
        if (!validation.isValid) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setError(validation.errorMessage || "この画像は肌診断に適していません。");
          setUploadedImage(null);
          setIsAnalyzing(false);
          setProgress(0);
          return;
        }

        // 肌診断実行
        const result = await analyzeSkinImage(base64Image);
        completeProgress(); // プログレスバーを100%に
        setDiagnosisResult(result);

        // おすすめ記事を取得
        setIsLoadingArticles(true);
        try {
          const articles = await articlesAPI.getRecommendedArticles(result.skinType, result.concerns);
          setRecommendedArticles(articles);
        } catch (articleError) {
          console.error('Failed to fetch recommended articles:', articleError);
          // 記事取得失敗は診断結果表示を妨げない
        } finally {
          setIsLoadingArticles(false);
        }
      } catch (error) {
        clearInterval(countdownInterval);
        console.error(error);
        setError("診断に失敗しました。しばらく経ってから再度お試しください。");
        setUploadedImage(null);
        setCountdown(null);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <Header />

      {/* 撮影ガイドモーダル */}
      {showGuideModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-white/20 animate-scale-in mx-2">
            <div className="p-4 sm:p-6">
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-xs font-medium mb-3 sm:mb-4 mx-auto block w-fit">
                📸 撮影ガイド
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3 sm:mb-4 text-center">
                写真の撮り方
              </h2>
              <div className="mb-3 sm:mb-4 flex justify-center">
                <div className="relative max-w-xs sm:max-w-sm">
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                  <img
                    src="/diagnosis/写真撮影方法.jpg"
                    alt="写真撮影方法のガイド"
                    className="relative w-full rounded-xl border-2 border-white shadow-xl"
                  />
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-pink-50 rounded-2xl p-3 sm:p-4 mb-4">
                <p className="text-slate-700 text-center text-xs sm:text-sm leading-relaxed">
                  💡 明るい場所で正面からまっすぐ撮影すると<br className="hidden sm:block" />
                  <span className="sm:hidden">より正確な診断結果が得られます</span>
                  <span className="hidden sm:inline">より正確な診断結果が得られます</span>
                </p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 sm:px-10 py-2.5 sm:py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                >
                  診断を始める →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-pink-50"></div>
        <div className="relative container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight">
              <span className="block sm:inline">あなたの肌タイプを</span>
              <span className="block sm:inline">
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">15秒で</span>
                診断
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto px-2">
              ※ この診断は参考情報としてご利用ください。専門的な医療アドバイスに代わるものではありません。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Image Upload Section */}
          {!uploadedImage ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6 text-center">肌画像をアップロード</h2>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 md:p-12 text-center hover:border-pink-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white text-xl sm:text-2xl">📷</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">
                  <span className="block sm:hidden">画像を選択またはドラッグ&ドロップ</span>
                  <span className="hidden sm:block">画像をドラッグ&ドロップまたはクリックして選択</span>
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
                  JPG、PNG、WEBP形式に対応（最大20MB）
                </p>
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 font-semibold rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base">
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
            <div className="space-y-4 sm:space-y-6">
              {/* Uploaded Image */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">アップロード完了</h2>
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setDiagnosisResult(null);
                      setError(null);
                      setRecommendedArticles([]);
                      setIsLoadingArticles(false);
                    }}
                    className="text-slate-500 hover:text-slate-700 text-xs sm:text-sm font-medium"
                  >
                    別の画像を選択
                  </button>
                </div>

                <div className="flex justify-center">
                  <img
                    src={uploadedImage}
                    alt="Uploaded skin"
                    className="max-w-full max-h-64 sm:max-h-80 md:max-h-96 object-contain border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Loading State */}
              {isAnalyzing && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-20 w-20 sm:h-24 sm:w-24 border-b-4 border-pink-500 mx-auto"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">AI解析中...</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-6">あなたの肌を詳しく分析しています</p>

                  {/* プログレスバー */}
                  <div className="max-w-md mx-auto mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-pink-600 mt-3">
                      {Math.round(progress)}%
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              {/* Diagnosis Result */}
              {!isAnalyzing && diagnosisResult && (
                <div className="space-y-4 sm:space-y-6">
                  {/* ヘッダー */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 md:p-10 text-center">
                    <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-50 text-rose-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                      ✨ AI肌診断レポート
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
                      診断完了
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base md:text-lg">
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
                      {/* PC版 */}
                      <div className="hidden sm:block">
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={[
                            { subject: '水分', score: diagnosisResult.condition.moistureScore || 3, fullMark: 5 },
                            { subject: '透明感', score: diagnosisResult.condition.clarityScore || 3, fullMark: 5 },
                            { subject: '弾力', score: diagnosisResult.condition.elasticityScore || 3, fullMark: 5 },
                            { subject: '毛穴', score: diagnosisResult.condition.poreScore || 3, fullMark: 5 },
                            { subject: 'キメ', score: diagnosisResult.condition.textureScore || 3, fullMark: 5 },
                          ]}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                            />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Radar name="肌状態" dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* スマホ版 - 見切れ防止 */}
                      <div className="block sm:hidden">
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={[
                            { subject: '水分', score: diagnosisResult.condition.moistureScore || 3, fullMark: 5 },
                            { subject: '透明', score: diagnosisResult.condition.clarityScore || 3, fullMark: 5 },
                            { subject: '弾力', score: diagnosisResult.condition.elasticityScore || 3, fullMark: 5 },
                            { subject: '毛穴', score: diagnosisResult.condition.poreScore || 3, fullMark: 5 },
                            { subject: 'キメ', score: diagnosisResult.condition.textureScore || 3, fullMark: 5 },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius="65%">
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                            />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar name="肌状態" dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
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
                            <p className="text-sm font-semibold text-slate-600">肌理(キメ)</p>
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
                        {/* 肌タイプ画像 */}
                        <div className="mb-6">
                          <img
                            src={getSkinTypeImage(diagnosisResult.skinType)}
                            alt={diagnosisResult.skinType}
                            className="max-w-md w-full mx-auto rounded-xl shadow-lg"
                          />
                        </div>
                        <div className="inline-block bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 text-rose-800 px-10 py-5 rounded-xl mb-4">
                          <p className="text-2xl font-bold">{diagnosisResult.skinType}</p>
                        </div>
                        <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
                          {getSkinTypeDescription(diagnosisResult.skinType)}
                        </p>
                      </div>
                    </div>

                    {/* あなたへのアドバイス（統合セクション） */}
                    <div>
                      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-slate-800">あなたへのアドバイス</h3>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Your Skincare Guide</span>
                      </div>

                      {/* 肌悩み */}
                      <div className="mb-6">
                        <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center">
                          <span className="w-6 h-6 bg-amber-500 text-white rounded-md flex items-center justify-center mr-2 text-sm">💡</span>
                          気になるポイント
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {diagnosisResult.concerns.map((concern, index) => (
                            <div key={index} className="bg-amber-50 border border-amber-200 text-slate-700 px-4 py-2 rounded-lg text-sm flex items-center">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                              {concern}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* おすすめケア */}
                      <div className="mb-6">
                        <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-md flex items-center justify-center mr-2 text-sm">✓</span>
                          おすすめのケア
                        </h4>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-5 border border-emerald-200">
                          <ul className="space-y-2.5">
                            {diagnosisResult.recommendations.map((rec, index) => (
                              <li key={index} className="text-slate-700 leading-relaxed flex items-start text-sm">
                                <span className="flex-shrink-0 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center font-semibold mr-2.5 mt-0.5" style={{ fontSize: '11px' }}>
                                  {index + 1}
                                </span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* 避けた方が良いこと */}
                      <div>
                        <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center">
                          <span className="w-6 h-6 bg-rose-500 text-white rounded-md flex items-center justify-center mr-2 text-sm">!</span>
                          避けた方が良いこと
                        </h4>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-5 border border-rose-200">
                          <ul className="space-y-2.5">
                            {diagnosisResult.avoid.map((item, index) => (
                              <li key={index} className="text-slate-700 leading-relaxed flex items-start text-sm">
                                <span className="flex-shrink-0 text-rose-500 font-bold mr-2.5 mt-0.5">×</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* おすすめ記事 */}
                  {(isLoadingArticles || recommendedArticles.length > 0) && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                        <h3 className="text-2xl font-bold text-slate-800">この記事がおすすめ</h3>
                        <span className="text-sm text-slate-500 uppercase tracking-wide">Recommended Article</span>
                      </div>
                      <p className="text-slate-600 mb-6 text-center">
                        あなたの肌タイプ「{diagnosisResult.skinType}」に最適な記事をご紹介
                      </p>

                      {isLoadingArticles ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-rose-500 mx-auto mb-4"></div>
                          <p className="text-slate-600">おすすめ記事を検索中...</p>
                        </div>
                      ) : recommendedArticles.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📚</span>
                          </div>
                          <p className="text-slate-600 mb-4">現在、あなたの肌タイプに関連する記事を準備中です</p>
                          <button
                            onClick={() => window.open('/articles/beauty-topics', '_blank')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                          >
                            <span>すべての記事を見る</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* 最初の1件のみ表示 */}
                          <div className="max-w-2xl mx-auto">
                            {(() => {
                              const article = recommendedArticles[0];
                              return (
                                <div
                                  className="group bg-gradient-to-br from-white to-rose-50 border-2 border-rose-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                  onClick={() => window.open(`/article/${article.id}`, '_blank')}
                                >
                                  {article.featured_image && (
                                    <div className="aspect-video overflow-hidden">
                                      <img
                                        src={article.featured_image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                  <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                      {article.category && (
                                        <span className="inline-block bg-rose-100 text-rose-700 text-sm px-3 py-1 rounded-full font-medium">
                                          {article.category}
                                        </span>
                                      )}
                                      {article.category2 && (
                                        <span className="inline-block bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium">
                                          {article.category2}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-rose-600 transition-colors">
                                      {article.title}
                                    </h4>
                                    <p className="text-slate-600 text-base mb-5 leading-relaxed">
                                      {article.excerpt || article.content?.substring(0, 150) + '...'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-slate-500">{new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
                                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold group-hover:from-rose-600 group-hover:to-pink-700 transition-all">
                                        記事を読む
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <div className="text-center mt-8">
                            <button
                              onClick={() => window.open('/articles/beauty-topics', '_blank')}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              <span>他の記事も見る</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

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
