import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductCarousel from './components/ProductCarousel';
import CategoryGrid from './components/CategoryGrid';
import BrandUpdates from './components/BrandUpdates';
import BeautyEvents from './components/BeautyEvents';
import ManagementTips from './components/ManagementTips';
import SurveyReports from './components/SurveyReports';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ArticleEditor from './components/ArticleEditor';
import CategoryPage from './components/CategoryPage';
import ArticleDetail from './components/ArticleDetail';
import SkinDiagnosis from './components/SkinDiagnosis';
import MediaPage from './components/MediaPage';
import ArticlesListPage from './components/ArticlesListPage';
import UserGuide from './components/UserGuide';
import FAQ from './components/FAQ';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CommercialTransactionAct from './components/CommercialTransactionAct';
import SearchBar from './components/SearchBar';
import SearchResultsPage from './components/SearchResultsPage';
import Sitemap from './components/Sitemap';
import { heroSlides as fallbackHeroSlides, newProducts, categories, mostViewedProducts, mostViewedManufacturers } from './constants';
import { pageSectionsAPI, articlesAPI, heroSlidesAPI, Article as DBArticle, HeroSlide as DBHeroSlide } from './src/lib/supabase';
import type { Article, Product, HeroSlide } from './types';

const App: React.FC = () => {
  const currentPath = window.location.pathname;
  const [pageData, setPageData] = useState({
    hotCosmetics: [] as Article[],
    popularMedicalBeauty: [] as Article[],
    brandUpdates: [] as Article[],
    beautyEvents: [] as Article[],
    managementTips: [] as Article[],
    surveyReports: [] as Article[],
    mostReadArticles: [] as Article[]
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(fallbackHeroSlides);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSkinDiagnosisCard, setShowSkinDiagnosisCard] = useState(true);
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // SEOメタタグを設定
  useEffect(() => {
    // ページごとにSEO設定を変更
    if (currentPath === '/') {
      document.title = '美活部 | 美容メディア - スキンケア・コスメ・美容医療の情報サイト';

      const metaDescription = document.querySelector('meta[name="description"]');
      const description = '美容医療、スキンケア、コスメの最新情報をお届けする美容メディア。プロの美容家による実践的な美容テクニックやおすすめ商品、海外トレンドまで幅広く紹介します。';
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      const keywords = '美容,スキンケア,コスメ,美容医療,美白,毛穴,エイジングケア,美活部';
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywords;
        document.head.appendChild(meta);
      }
    }
  }, [currentPath]);

  useEffect(() => {
    // Always load hero slides, but only load page data for the main page
    if (currentPath === '/') {
      loadPageDataWithMinTime();
    } else {
      // Load only hero slides for other pages
      loadHeroSlidesOnly();
      setInitialLoading(false);
    }
  }, [currentPath]);

  const loadPageDataWithMinTime = async () => {
    const startTime = Date.now();

    await loadPageData();

    // 最低1秒のローディング時間を保証
    const elapsedTime = Date.now() - startTime;
    const minLoadingTime = 1000; // 1秒
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

    setTimeout(() => {
      setInitialLoading(false);
    }, remainingTime);
  };

  const convertDBArticleToUIArticle = (dbArticle: DBArticle): Article => {
    return {
      id: dbArticle.id, // Keep UUID as string
      title: dbArticle.title,
      imageUrl: dbArticle.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format',
      date: new Date(dbArticle.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      category: dbArticle.category,
      tag: dbArticle.keywords?.split(',')[0] || undefined,
      slug: dbArticle.slug
    };
  };

  const convertArticleToProduct = (article: Article): Product => {
    return {
      id: article.id,
      name: article.title,
      subText: article.category || '',
      imageUrl: article.imageUrl,
      date: article.date,
      slug: article.slug
    };
  };

  const convertDBHeroSlideToUIHeroSlide = (dbSlide: DBHeroSlide): HeroSlide => {
    return {
      id: parseInt(dbSlide.id.split('-')[0], 16) % 1000, // Convert UUID to number for backward compatibility
      imageUrl: dbSlide.image_url,
      alt: dbSlide.alt_text,
      articleId: dbSlide.article_id || undefined,
      articleSlug: dbSlide.article?.slug || undefined
    };
  };

  const loadHeroSlidesOnly = async () => {
    try {
      const slides = await heroSlidesAPI.getAllSlides();
      const uiSlides = slides.map(convertDBHeroSlideToUIHeroSlide);
      setHeroSlides(uiSlides);
    } catch (heroError) {
      console.warn('Failed to load hero slides from database, using fallback:', heroError);
      // Keep using fallbackHeroSlides from initial state
    }
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      const sections = await pageSectionsAPI.getAllSections();

      // Try to load hero slides from database, fallback to constants if fails
      try {
        const slides = await heroSlidesAPI.getAllSlides();
        const uiSlides = slides.map(convertDBHeroSlideToUIHeroSlide);
        setHeroSlides(uiSlides);
      } catch (heroError) {
        console.warn('Failed to load hero slides from database, using fallback:', heroError);
        // Keep using fallbackHeroSlides from initial state
      }

      const hotCosmetics = sections
        .filter(s => s.section_name === 'hot_cosmetics' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => convertDBArticleToUIArticle(s.article!));

      const popularMedicalBeauty = sections
        .filter(s => s.section_name === 'popular_medical_beauty' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => convertDBArticleToUIArticle(s.article!));

      const brandUpdates = sections
        .filter(s => s.section_name === 'brand_updates' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => convertDBArticleToUIArticle(s.article!));

      const beautyEvents = sections
        .filter(s => s.section_name === 'beauty_events' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => convertDBArticleToUIArticle(s.article!));

      const managementTips = sections
        .filter(s => s.section_name === 'management_tips' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => convertDBArticleToUIArticle(s.article!));

      // 調査レポートを取得（article_type='survey'）
      const surveyReportsData = await articlesAPI.getArticlesByType('survey');
      const surveyReports = surveyReportsData.slice(0, 3).map(convertDBArticleToUIArticle);

      // 最新記事を取得（mostReadArticlesの代わり）
      const latestArticlesData = await articlesAPI.getLatestArticles(5);
      const mostReadArticles = latestArticlesData.map(convertDBArticleToUIArticle);

      setPageData({
        hotCosmetics,
        popularMedicalBeauty,
        brandUpdates,
        beautyEvents,
        managementTips,
        surveyReports,
        mostReadArticles
      });
    } catch (error) {
      console.error('Failed to load page data:', error);
      // Fallback to empty arrays
      setPageData({
        hotCosmetics: [],
        popularMedicalBeauty: [],
        brandUpdates: [],
        beautyEvents: [],
        managementTips: [],
        surveyReports: [],
        mostReadArticles: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Simple routing
  if (currentPath === '/admin') {
    return <AdminLogin />;
  }

  if (currentPath === '/admin/dashboard') {
    return <AdminDashboard />;
  }

  if (currentPath === '/admin/articles/new') {
    return <ArticleEditor />;
  }

  if (currentPath.startsWith('/admin/articles/edit/')) {
    const articleId = currentPath.replace('/admin/articles/edit/', '');
    return <ArticleEditor articleId={articleId} />;
  }

  // Category pages routing
  // Article detail routing: /article/<slug>
  if (currentPath.startsWith('/article/')) {
    const slug = currentPath.replace('/article/', '');
    return <ArticleDetail articleSlug={slug} />;
  }

  if (currentPath === '/category/spots-dullness') {
    return <CategoryPage category="シミ・くすみ" />;
  }

  if (currentPath === '/category/pores') {
    return <CategoryPage category="毛穴" />;
  }

  if (currentPath === '/category/redness') {
    return <CategoryPage category="赤み・赤ら顔" />;
  }

  if (currentPath === '/category/aging') {
    return <CategoryPage category="たるみ・しわ" />;
  }

  if (currentPath === '/category/acne') {
    return <CategoryPage category="ニキビ・ニキビ跡" />;
  }

  // 新しいカテゴリーページのルーティング
  if (currentPath === '/category/skin-development') {
    return <CategoryPage category="肌育" />;
  }

  if (currentPath === '/category/beauty-technology') {
    return <CategoryPage category="最新の美容機器" />;
  }

  if (currentPath === '/category/home-care') {
    return <CategoryPage category="ホームケア" />;
  }

  if (currentPath === '/category/salon-management') {
    return <CategoryPage category="サロン経営" />;
  }

  if (currentPath === '/category/global-trends') {
    return <CategoryPage category="海外トレンド" />;
  }

  if (currentPath === '/skin-diagnosis') {
    return <SkinDiagnosis />;
  }

  if (currentPath === '/media') {
    return <MediaPage />;
  }

  // Articles list pages routing
  if (currentPath === '/articles/hot-cosmetics') {
    return <ArticlesListPage sectionType="hot_cosmetics" />;
  }

  if (currentPath === '/articles/beauty-topics') {
    return <ArticlesListPage sectionType="brand_updates" />;
  }

  if (currentPath === '/articles/professional-column') {
    return <ArticlesListPage sectionType="management_tips" />;
  }

  if (currentPath === '/articles/events') {
    return <ArticlesListPage sectionType="beauty_events" />;
  }

  if (currentPath === '/articles/surveys') {
    return <ArticlesListPage sectionType="surveys" />;
  }

  // Footer pages routing
  if (currentPath === '/guide') {
    return <UserGuide />;
  }

  if (currentPath === '/faq') {
    return <FAQ />;
  }

  if (currentPath === '/privacy') {
    return <PrivacyPolicy />;
  }

  if (currentPath === '/terms') {
    return <TermsOfService />;
  }

  if (currentPath === '/commercial-transaction') {
    return <CommercialTransactionAct />;
  }

  if (currentPath === '/search') {
    return <SearchResultsPage />;
  }

  if (currentPath === '/sitemap') {
    return <Sitemap />;
  }

  // トップページの初回ローディング画面
  if (currentPath === '/' && initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      <main>
        <HeroCarousel slides={heroSlides} />
        <SearchBar />
        <div className="container mx-auto px-4 py-8">
           <ProductCarousel products={pageData.hotCosmetics.map(convertArticleToProduct)} mostRead={pageData.mostReadArticles} />
           <div className="my-8 md:my-12 p-8 md:p-12 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 text-white text-center rounded-2xl shadow-xl relative overflow-hidden">
              {/* 装飾的な背景要素 */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">Find Your Perfect Beauty Item</h2>
                <p className="mt-2 md:mt-3 mb-6 md:mb-8 text-sm md:text-lg text-white/90 font-light">あなたのための美容製品、テクニック、サロンがきっと見つかる</p>
                <button className="bg-white text-rose-500 font-bold py-3 md:py-4 px-8 md:px-12 text-base md:text-lg hover:bg-rose-50 hover:scale-105 transition-all duration-300 rounded-full shadow-lg hover:shadow-2xl">
                  アイテムを探す
                </button>
              </div>
            </div>
           <CategoryGrid categories={categories} />
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d11a68]"></div>
            <span className="ml-2">読み込み中...</span>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-b from-rose-50 to-white py-16">
                <div className="container mx-auto px-4">
                    <BrandUpdates articles={pageData.brandUpdates} products={mostViewedProducts} manufacturers={mostViewedManufacturers} popularMedicalBeauty={pageData.popularMedicalBeauty}/>
                </div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white py-16 my-12">
               <BeautyEvents events={pageData.beautyEvents} />
            </div>
            <div className="bg-gradient-to-b from-slate-50 to-gray-50 py-16">
                 <div className="container mx-auto px-4">
                    <ManagementTips tips={pageData.managementTips} />
                </div>
            </div>
            <div className="bg-gradient-to-b from-indigo-50 to-purple-50 py-16">
                 <div className="container mx-auto px-4">
                    <SurveyReports reports={pageData.surveyReports} />
                </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed Skin Diagnosis Button */}
      {showSkinDiagnosisCard && (
        <div className="fixed bottom-8 right-8 z-40 md:block">
          <div className="group relative">
            {/* Close button */}
            <button
              onClick={() => setShowSkinDiagnosisCard(false)}
              className="absolute -top-2 -right-2 z-50 bg-white hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <a
              href="/skin-diagnosis"
              className="hidden md:block"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"></div>

              {/* Main button - PC only */}
              <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden w-72">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-left flex-1">
                      <div className="text-sm font-bold text-pink-600 mb-1">15秒でわかる！</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">肌タイプ診断</div>
                    </div>
                    <div className="flex-shrink-0 text-slate-400 group-hover:text-pink-500 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-full">
                    <img
                      src="/card/skin-diagnosis.webp"
                      alt="肌タイプ診断"
                      className="w-full h-40 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </a>

            {/* Mobile version - 2-step interaction */}
            <div className="md:hidden">
              {!isCardExpanded ? (
                // Step 1: Compact card
                <button
                  onClick={() => setIsCardExpanded(true)}
                  className="block w-full"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-30 animate-pulse"></div>
                  <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-50"></div>
                    <div className="relative px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-xs font-bold text-pink-600 mb-0.5">15秒でわかる！</div>
                          <div className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">肌タイプ診断</div>
                        </div>
                        <div className="flex-shrink-0 text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                // Step 2: Expanded card with image
                <div className="animate-slide-up">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-40"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-50"></div>
                    <div className="relative p-5">
                      {/* Header with collapse button */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-left">
                          <div className="text-xs font-bold text-pink-600 mb-0.5">15秒でわかる！</div>
                          <div className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">肌タイプ診断</div>
                        </div>
                        <button
                          onClick={() => setIsCardExpanded(false)}
                          className="flex-shrink-0 text-slate-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* 4 skin types image */}
                      <div className="w-full mb-4">
                        <img
                          src="/card/skin-diagnosis.webp"
                          alt="肌タイプ診断"
                          className="w-full h-32 object-cover rounded-xl shadow-md"
                        />
                      </div>

                      {/* CTA Button */}
                      <a
                        href="/skin-diagnosis"
                        className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-all shadow-md"
                      >
                        診断を始める →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default App;