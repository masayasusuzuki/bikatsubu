
export interface HeroSlide {
  id: number;
  imageUrl: string;
  alt: string;
  articleId?: string; // 記事IDを追加
}

export interface Product {
  id: string;
  name: string;
  subText: string;
  imageUrl: string;
  date: string;
}

export interface Category {
  title: string;
  subtitle: string;
  imageUrl: string;
  subcategories: string[];
}

export interface Article {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  category?: string;
  tag?: string;
}

export interface Manufacturer {
    id: number;
    name: string;
    description: string;
    logoUrl: string;
}
