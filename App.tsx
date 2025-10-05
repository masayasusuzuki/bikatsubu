import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductCarousel from './components/ProductCarousel';
import CategoryGrid from './components/CategoryGrid';
import BrandUpdates from './components/BrandUpdates';
import BeautyEvents from './components/BeautyEvents';
import ManagementTips from './components/ManagementTips';
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
    mostReadArticles: [] as Article[]
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(fallbackHeroSlides);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSkinDiagnosisCard, setShowSkinDiagnosisCard] = useState(true);

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
      tag: dbArticle.keywords?.split(',')[0] || undefined
    };
  };

  const convertArticleToProduct = (article: Article): Product => {
    return {
      id: article.id,
      name: article.title,
      subText: article.category || '',
      imageUrl: article.imageUrl,
      date: article.date
    };
  };

  const convertDBHeroSlideToUIHeroSlide = (dbSlide: DBHeroSlide): HeroSlide => {
    return {
      id: parseInt(dbSlide.id.split('-')[0], 16) % 1000, // Convert UUID to number for backward compatibility
      imageUrl: dbSlide.image_url,
      alt: dbSlide.alt_text,
      articleId: dbSlide.article_id || undefined
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

      // 最新記事を取得（mostReadArticlesの代わり）
      const latestArticlesData = await articlesAPI.getLatestArticles(5);
      const mostReadArticles = latestArticlesData.map(convertDBArticleToUIArticle);

      setPageData({
        hotCosmetics,
        popularMedicalBeauty,
        brandUpdates,
        beautyEvents,
        managementTips,
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
  // Article detail routing: /article/<id>
  if (currentPath.startsWith('/article/')) {
    const id = currentPath.replace('/article/', '');
    return <ArticleDetail articleId={id} />;
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

  // トップページの初回ローディング画面
  if (currentPath === '/' && initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      <main>
        <HeroCarousel slides={heroSlides} />
        <div className="container mx-auto px-4 py-8">
           <ProductCarousel products={pageData.hotCosmetics.map(convertArticleToProduct)} mostRead={pageData.mostReadArticles} />
           <div className="my-12 p-8 bg-[#d11a68] text-white text-center rounded-lg">
              <h2 className="text-3xl font-bold">Find Your Perfect Beauty Item</h2>
              <p className="mt-2 mb-6">あなたのための美容製品、テクニック、サロンがきっと見つかる</p>
              <button className="bg-white text-[#d11a68] font-bold py-3 px-8 text-lg hover:bg-gray-200 transition-colors rounded-md">
                アイテムを探す
              </button>
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
            <div className="bg-white py-12">
                <div className="container mx-auto px-4">
                    <BrandUpdates articles={pageData.brandUpdates} products={mostViewedProducts} manufacturers={mostViewedManufacturers} popularMedicalBeauty={pageData.popularMedicalBeauty}/>
                </div>
            </div>
            <div className="bg-[#d11a68] text-white py-12 my-12">
               <BeautyEvents events={pageData.beautyEvents} />
            </div>
            <div className="bg-gray-200 py-12">
                 <div className="container mx-auto px-4">
                    <ManagementTips tips={pageData.managementTips} />
                </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed Skin Diagnosis Button */}
      {showSkinDiagnosisCard && (
        <div className="fixed bottom-8 right-8 z-40">
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
              className="block"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"></div>

              {/* Main button */}
              <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden w-72">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-left flex-1">
                      <div className="text-sm font-bold text-pink-600 mb-1">30秒でわかる！</div>
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
                      src="/card/skin-diagnosis.png"
                      alt="肌タイプ診断"
                      className="w-full h-40 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default App;