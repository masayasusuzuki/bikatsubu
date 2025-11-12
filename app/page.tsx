import { Suspense } from 'react'
import Header from '../components/Header'
import HeroCarousel from '../components/HeroCarousel'
import ProductCarousel from '../components/ProductCarousel'
import CategoryGrid from '../components/CategoryGrid'
import BrandUpdates from '../components/BrandUpdates'
import BeautyEvents from '../components/BeautyEvents'
import ManagementTips from '../components/ManagementTips'
import SurveyReports from '../components/SurveyReports'
import Footer from '../components/Footer'
import LoadingScreen from '../components/LoadingScreen'
import SearchBar from '../components/SearchBar'
import { pageSectionsAPI, articlesAPI, heroSlidesAPI } from '../src/lib/supabase'
import { heroSlides as fallbackHeroSlides, newProducts, categories, mostViewedProducts, mostViewedManufacturers } from '../constants'

// SSGのためのデータ取得
export const revalidate = 3600 // 1時間ごとに再生成

async function getPageData() {
  try {
    const [
      hotCosmetics,
      popularMedicalBeauty,
      brandUpdates,
      beautyEvents,
      managementTips,
      surveyReports,
      mostReadArticles,
      heroSlidesData
    ] = await Promise.all([
      pageSectionsAPI.getHotCosmetics(),
      pageSectionsAPI.getPopularMedicalBeauty(),
      articlesAPI.getArticlesByArticleType('article', 6),
      articlesAPI.getArticlesByArticleType('event', 3),
      articlesAPI.getArticlesByCategory('肌育', 6),
      articlesAPI.getArticlesByArticleType('survey', 3),
      articlesAPI.getMostReadArticles(10),
      heroSlidesAPI.getActiveSlides()
    ])

    // HeroSlide型の変換
    const heroSlides = heroSlidesData?.map(slide => ({
      id: slide.id.toString(),
      title: slide.title,
      description: slide.description || '',
      imageUrl: slide.image_url,
      linkUrl: slide.link_url || '#',
      linkText: slide.link_text || '詳細を見る',
      gradient: slide.gradient || 'from-pink-500 to-rose-500'
    })) || fallbackHeroSlides

    return {
      hotCosmetics: hotCosmetics || [],
      popularMedicalBeauty: popularMedicalBeauty || [],
      brandUpdates: brandUpdates || [],
      beautyEvents: beautyEvents || [],
      managementTips: managementTips || [],
      surveyReports: surveyReports || [],
      mostReadArticles: mostReadArticles || [],
      heroSlides
    }
  } catch (error) {
    console.error('Failed to fetch page data:', error)
    return {
      hotCosmetics: [],
      popularMedicalBeauty: [],
      brandUpdates: [],
      beautyEvents: [],
      managementTips: [],
      surveyReports: [],
      mostReadArticles: [],
      heroSlides: fallbackHeroSlides
    }
  }
}

export default async function Home() {
  const pageData = await getPageData()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Suspense fallback={<LoadingScreen />}>
          <HeroCarousel slides={pageData.heroSlides} />
          <SearchBar />
          <CategoryGrid categories={categories} />
          <ProductCarousel
            title="注目のコスメ"
            products={newProducts}
            articles={pageData.hotCosmetics}
          />
          <BrandUpdates
            articles={pageData.brandUpdates}
            products={mostViewedProducts}
            manufacturers={mostViewedManufacturers}
            popularMedicalBeauty={pageData.popularMedicalBeauty}
          />
          <BeautyEvents articles={pageData.beautyEvents} />
          <ManagementTips articles={pageData.managementTips} />
          <SurveyReports articles={pageData.surveyReports} />
        </Suspense>
      </main>
      <Footer mostReadArticles={pageData.mostReadArticles} />
    </>
  )
}