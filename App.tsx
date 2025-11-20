import React, { useState, useEffect, lazy, Suspense } from 'react';
// 常に必要なコンポーネント（トップページで使用）
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
import SearchBar from './components/SearchBar';

// 遅延読み込みするコンポーネント（必要な時だけロード）
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ArticleEditor = lazy(() => import('./components/ArticleEditor'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const ArticleDetail = lazy(() => import('./components/ArticleDetail'));
const SkinDiagnosis = lazy(() => import('./components/SkinDiagnosis'));
const MediaPage = lazy(() => import('./components/MediaPage'));
const ArticlesListPage = lazy(() => import('./components/ArticlesListPage'));
const EventsCalendarPage = lazy(() => import('./components/EventsCalendarPage'));
const UserGuide = lazy(() => import('./components/UserGuide'));
const FAQ = lazy(() => import('./components/FAQ'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const CommercialTransactionAct = lazy(() => import('./components/CommercialTransactionAct'));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage'));
const Sitemap = lazy(() => import('./components/Sitemap'));
import { heroSlides as fallbackHeroSlides, newProducts, categories, mostViewedProducts, mostViewedManufacturers } from './constants';
import { pageSectionsAPI, articlesAPI, heroSlidesAPI, Article, HeroSlide as DBHeroSlide } from './src/lib/supabase';
import type { Product, HeroSlide } from './types';
import { useCanonical } from './src/hooks/useCanonical';

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

  // Canonicalタグを設定（トップページのみ）
  useCanonical(currentPath === '/' ? 'https://www.bikatsubu-media.jp/' : '');

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

  const convertArticleToProduct = (article: Article): Product => {
    return {
      id: article.id,
      name: article.title,
      subText: article.category || '',
      imageUrl: article.featured_image || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=250&fit=crop&auto=format',
      date: new Date(article.published_at || article.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      slug: article.slug
    };
  };

  const convertDBHeroSlideToUIHeroSlide = (dbSlide: DBHeroSlide): HeroSlide => {
    return {
      id: dbSlide.id,
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
        .map(s => s.article!);

      const popularMedicalBeauty = sections
        .filter(s => s.section_name === 'popular_medical_beauty' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => s.article!);

      const brandUpdates = sections
        .filter(s => s.section_name === 'brand_updates' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => s.article!);

      const beautyEvents = sections
        .filter(s => s.section_name === 'beauty_events' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => s.article!);

      const managementTips = sections
        .filter(s => s.section_name === 'management_tips' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => s.article!);

      // 調査レポートを取得（article_type='survey'）
      const surveyReportsData = await articlesAPI.getArticlesByType('survey');
      const surveyReports = surveyReportsData.slice(0, 3);

      // 最新記事を取得（mostReadArticlesの代わり）
      const latestArticlesData = await articlesAPI.getLatestArticles(5);
      const mostReadArticles = latestArticlesData;

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

  // Suspenseラッパー用のローディングコンポーネント
  const LazyLoadWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Suspense fallback={<LoadingScreen />}>
      {children}
    </Suspense>
  );

  // Simple routing
  if (currentPath === '/admin') {
    return (
      <LazyLoadWrapper>
        <AdminLogin />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/admin/dashboard') {
    return (
      <LazyLoadWrapper>
        <AdminDashboard />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/admin/articles/new') {
    return (
      <LazyLoadWrapper>
        <ArticleEditor />
      </LazyLoadWrapper>
    );
  }

  if (currentPath.startsWith('/admin/articles/edit/')) {
    const articleId = currentPath.replace('/admin/articles/edit/', '');
    return (
      <LazyLoadWrapper>
        <ArticleEditor articleId={articleId} />
      </LazyLoadWrapper>
    );
  }

  // Category pages routing
  // Article detail routing: /article/<slug>
  if (currentPath.startsWith('/article/')) {
    const slug = currentPath.replace('/article/', '');
    return (
      <LazyLoadWrapper>
        <ArticleDetail articleSlug={slug} />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/spots-dullness') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="シミ・くすみ" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/pores') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="毛穴" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/redness') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="赤み・赤ら顔" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/aging') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="たるみ・しわ" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/acne') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="ニキビ・ニキビ跡" />
      </LazyLoadWrapper>
    );
  }

  // 新しいカテゴリーページのルーティング
  if (currentPath === '/category/skin-development') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="肌育" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/beauty-technology') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="最新の美容機器" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/home-care') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="ホームケア" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/salon-management') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="サロン経営" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/category/global-trends') {
    return (
      <LazyLoadWrapper>
        <CategoryPage category="海外トレンド" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/skin-diagnosis') {
    return (
      <LazyLoadWrapper>
        <SkinDiagnosis />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/media') {
    return (
      <LazyLoadWrapper>
        <MediaPage />
      </LazyLoadWrapper>
    );
  }

  // Articles list pages routing
  if (currentPath === '/articles/hot-cosmetics') {
    return (
      <LazyLoadWrapper>
        <ArticlesListPage sectionType="hot_cosmetics" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/articles/beauty-topics') {
    return (
      <LazyLoadWrapper>
        <ArticlesListPage sectionType="brand_updates" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/articles/professional-column') {
    return (
      <LazyLoadWrapper>
        <ArticlesListPage sectionType="management_tips" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/articles/events') {
    return (
      <LazyLoadWrapper>
        <EventsCalendarPage />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/articles/surveys') {
    return (
      <LazyLoadWrapper>
        <ArticlesListPage sectionType="surveys" />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/articles/latest') {
    return (
      <LazyLoadWrapper>
        <ArticlesListPage sectionType="latest" />
      </LazyLoadWrapper>
    );
  }

  // Footer pages routing
  if (currentPath === '/guide') {
    return (
      <LazyLoadWrapper>
        <UserGuide />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/faq') {
    return (
      <LazyLoadWrapper>
        <FAQ />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/privacy') {
    return (
      <LazyLoadWrapper>
        <PrivacyPolicy />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/terms') {
    return (
      <LazyLoadWrapper>
        <TermsOfService />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/commercial-transaction') {
    return (
      <LazyLoadWrapper>
        <CommercialTransactionAct />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/search') {
    return (
      <LazyLoadWrapper>
        <SearchResultsPage />
      </LazyLoadWrapper>
    );
  }

  if (currentPath === '/sitemap') {
    return (
      <LazyLoadWrapper>
        <Sitemap />
      </LazyLoadWrapper>
    );
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
           {/* モバイル版バナー */}
           <div className="my-8 md:my-12 md:hidden rounded-2xl shadow-xl overflow-hidden">
              <a href="https://bikatsubu-media.jp/article/article-20251119-2022" className="block">
                <img
                  src="https://res.cloudinary.com/dmxlepoau/image/upload/v1763459741/vnwmyzvqikjxvheqwvkn.jpg"
                  alt="ハリ弾力UP - ニキビ跡やシミ・赤みが気にになる方"
                  className="w-full h-auto"
                />
              </a>
            </div>

           {/* PC版バナー */}
           <div className="hidden md:block my-8 md:my-12 mx-auto w-3/4 rounded-2xl shadow-xl overflow-hidden">
              <a href="https://bikatsubu-media.jp/article/article-20251119-2022" className="block">
                <img
                  src="https://res.cloudinary.com/dmxlepoau/image/upload/v1763462298/dbtqxc3lruw4kvmsugkb.jpg"
                  alt="Find Your Perfect Beauty Item"
                  className="w-full h-auto"
                />
              </a>
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
            {/* イベントバナー - モバイル版 */}
            <div className="container mx-auto px-4 my-8 md:my-12 md:hidden">
              <div className="rounded-2xl shadow-xl overflow-hidden">
                <a href="https://bikatsubu-media.jp/articles/events" className="block">
                  <img
                    src="https://res.cloudinary.com/dmxlepoau/image/upload/v1763553057/k7chnfzszaoyqpz8pag4.jpg"
                    alt="美容医療イベント情報"
                    className="w-full h-auto"
                  />
                </a>
              </div>
            </div>

            {/* イベントバナー - PC版 */}
            <div className="container mx-auto px-4 hidden md:block my-8 md:my-12">
              <div className="mx-auto w-3/4 rounded-2xl shadow-xl overflow-hidden">
                <a href="https://bikatsubu-media.jp/articles/events" className="block">
                  <img
                    src="https://res.cloudinary.com/dmxlepoau/image/upload/v1763553057/k7chnfzszaoyqpz8pag4.jpg"
                    alt="美容医療イベント情報"
                    className="w-full h-auto"
                  />
                </a>
              </div>
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