import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductCarousel from './components/ProductCarousel';
import CategoryGrid from './components/CategoryGrid';
import BrandUpdates from './components/BrandUpdates';
import BeautyEvents from './components/BeautyEvents';
import ManagementTips from './components/ManagementTips';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ArticleEditor from './components/ArticleEditor';
import UserMyPage from './components/UserMyPage';
import UserLogin from './components/UserLogin';
import CategoryPage from './components/CategoryPage';
import ArticleDetail from './components/ArticleDetail';
import SkinDiagnosis from './components/SkinDiagnosis';
import { heroSlides, newProducts, categories, mostViewedProducts, mostViewedManufacturers } from './constants';
import { pageSectionsAPI, Article as DBArticle } from './src/lib/supabase';
import type { Article, Product } from './types';

const App: React.FC = () => {
  const currentPath = window.location.pathname;
  const [pageData, setPageData] = useState({
    hotCosmetics: [] as Article[],
    brandUpdates: [] as Article[],
    beautyEvents: [] as Article[],
    managementTips: [] as Article[],
    mostReadArticles: [] as Article[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only load data for the main page
    if (currentPath === '/') {
      loadPageData();
    }
  }, [currentPath]);

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

  const loadPageData = async () => {
    try {
      setLoading(true);
      const sections = await pageSectionsAPI.getAllSections();

      const hotCosmetics = sections
        .filter(s => s.section_name === 'hot_cosmetics' && s.article)
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

      const mostReadArticles = sections
        .filter(s => s.section_name === 'most_read' && s.article)
        .sort((a, b) => a.position - b.position)
        .map(s => convertDBArticleToUIArticle(s.article!));

      setPageData({
        hotCosmetics,
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

  if (currentPath === '/skin-diagnosis') {
    return <SkinDiagnosis />;
  }

  return (
    <div className="bg-gray-100 font-sans">
      <Header />
      <main>
        <HeroCarousel slides={heroSlides} />
        <div className="container mx-auto px-4 py-8">
           <ProductCarousel products={pageData.hotCosmetics.length > 0 ? pageData.hotCosmetics.map(convertArticleToProduct) : newProducts} />
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
                    <BrandUpdates articles={pageData.brandUpdates} products={mostViewedProducts} manufacturers={mostViewedManufacturers}/>
                </div>
            </div>
            <div className="bg-[#d11a68] text-white py-12 my-12">
               <BeautyEvents events={pageData.beautyEvents} />
            </div>
            <div className="bg-gray-200 py-12">
                 <div className="container mx-auto px-4">
                    <ManagementTips tips={pageData.managementTips} mostRead={pageData.mostReadArticles} />
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