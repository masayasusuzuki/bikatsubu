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
import UserMyPage from './components/UserMyPage';
import UserLogin from './components/UserLogin';
import CategoryPage from './components/CategoryPage';
import ArticleDetail from './components/ArticleDetail';
import SkinDiagnosis from './components/SkinDiagnosis';
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

  useEffect(() => {
    // Only load data for the main page
    if (currentPath === '/') {
      loadPageDataWithMinTime();
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

  if (currentPath === '/login') {
    return <UserLogin />;
  }

  if (currentPath === '/mypage') {
    return <UserMyPage />;
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
      <Footer />
    </div>
  );
};

export default App;