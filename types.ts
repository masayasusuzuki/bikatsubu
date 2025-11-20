
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
  externalLink?: string;
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

export interface BeautyEvent {
  id: string;
  title: string;
  event_date: string;
  end_date?: string;
  category: string;
  brand?: string;
  location: string;
  description: string;
  external_link?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBeautyEvent {
  title: string;
  event_date: string;
  end_date?: string;
  category: string;
  brand?: string;
  location: string;
  description: string;
  external_link?: string;
  image_url?: string;
}
