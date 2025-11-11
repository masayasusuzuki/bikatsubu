
// データベース関連の型はsupabase.tsから再エクスポート
export type {
  Article,
  CreateArticle,
  PageSection,
  HeroSlide as DBHeroSlide,  // データベース型はDBHeroSlideとして再エクスポート
  CreateHeroSlide,
  ImageFolder,
  ImageMetadata,
  CloudinaryImageFromDB
} from './src/lib/supabase';

// UIコンポーネント用の型定義
// HeroCarousel等のUIコンポーネント用
export interface HeroSlide {
  id: string;  // stringに統一
  imageUrl: string;
  alt: string;
  articleId?: string;
  articleSlug?: string;
}
export interface Product {
  id: string;
  name: string;
  subText: string;
  imageUrl: string;
  date: string;
  slug?: string;
}

export interface Category {
  title: string;
  subtitle: string;
  imageUrl: string;
  subcategories: string[];
}

export interface Manufacturer {
    id: number;
    name: string;
    description: string;
    logoUrl: string;
}
