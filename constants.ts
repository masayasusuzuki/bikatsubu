import type { HeroSlide, Product, Category, Article, Manufacturer } from './types';

export const heroSlides: HeroSlide[] = [
  { id: 1, imageUrl: '/hero/samune1.png', alt: '美活部 - あなたのキレイを応援する美容メディア' },
  { id: 2, imageUrl: '/hero/samune2.png', alt: '美活部 - メイクアップ特集' },
  { id: 3, imageUrl: 'https://source.unsplash.com/1200x500/?haircare,shiny,hair', alt: 'お悩み別ヘアケア診断' },
];

export const newProducts: Product[] = [
  { id: 1, name: 'ルミナスグロウ・セラム', subText: 'AuraBeauty', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=200&fit=crop&auto=format', date: '2024-08-15' },
  { id: 2, name: 'ベルベットマットリップ', subText: 'ChicCosmetics', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop&auto=format', date: '2024-08-12' },
  { id: 3, name: 'リペア＆シャイン ヘアマスク', subText: 'SilkyHair', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=200&fit=crop&auto=format', date: '2024-08-10' },
  { id: 4, name: 'クリアスキン・クレンジングバーム', subText: 'PureFace', imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=200&fit=crop&auto=format', date: '2024-08-05' },
  { id: 5, name: 'サンプロテクト・エッセンス SPF50+', subText: 'SunGuard', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop&auto=format', date: '2024-08-01' },
];

export const categories: Category[] = [
  { title: 'スキンケア', subtitle: 'Skincare', imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=250&fit=crop&auto=format', subcategories: ['クレンジング・洗顔', '化粧水・乳液', '美容液・オイル', 'パック・マスク', 'UVケア'] },
  { title: 'コスメ', subtitle: 'Cosmetics', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=250&fit=crop&auto=format', subcategories: ['ベースメイク', 'アイメイク', 'リップ', 'チーク', 'メイクアップツール'] },
  { title: '美容医療', subtitle: 'Medical Beauty', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&auto=format', subcategories: ['美容皮膚科', '美容外科', 'レーザー治療', 'インジェクション', '美容点滴'] },
  { title: '睡眠・生活習慣', subtitle: 'Lifestyle & Sleep', imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=250&fit=crop&auto=format', subcategories: ['睡眠改善', '食事・栄養', '運動・ストレッチ', 'ストレス管理', '生活リズム'] },
  { title: '海外情報', subtitle: 'Global Beauty', imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop&auto=format', subcategories: ['海外コスメ', 'K-Beauty', '最新トレンド', 'セレブビューティー', 'SNS話題'] },
];

export const brandUpdates: Article[] = [
    { id: 1, title: '【新作レビュー】AuraBeautyの新作セラム、1ヶ月使ってみた結果', imageUrl: 'https://images.unsplash.com/photo-1556228724-195d32204d75?w=300&h=200&fit=crop&auto=format', date: '2024.08.20' },
    { id: 2, title: 'プロが解説！崩れない夏ベースメイクの作り方', imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&auto=format', date: '2024.08.18' },
    { id: 3, title: 'SNSで話題！韓国発の最新スキンケアブランド特集', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop&auto=format', date: '2024.08.15' },
    { id: 4, title: 'おうちで簡単ヘッドスパ！美髪を育てる頭皮マッサージ法', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=200&fit=crop&auto=format', date: '2024.08.12' },
    { id: 5, title: 'パーソナルカラー別！秋の新作リップつけ比べ', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=200&fit=crop&auto=format', date: '2024.08.10' },
    { id: 6, title: 'インナービューティー入門：美肌を作る食事の基本', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop&auto=format', date: '2024.08.08' },
];

export const mostViewedProducts: Product[] = [
    { id: 1, name: 'アドバンスド ナイトリペア', subText: 'エスティローダー', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&auto=format', date: ''},
    { id: 2, name: 'ディオール アディクト リップ マキシマイザー', subText: 'ディオール', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=80&h=80&fit=crop&auto=format', date: ''},
    { id: 3, name: 'フェイシャル トリートメント エッセンス', subText: 'SK-II', imageUrl: 'https://images.unsplash.com/photo-1556228724-195d32204d75?w=80&h=80&fit=crop&auto=format', date: ''},
];

export const mostViewedManufacturers: Manufacturer[] = [
    { id: 1, name: '資生堂', description: '日本を代表する化粧品ブランド。高品質な製品で世界的に有名。', logoUrl: 'https://via.placeholder.com/80x80/fde2e2/c62828?text=S' },
    { id: 2, name: 'L\'Oréal', description: '世界最大の化粧品会社。多様なブランドポートフォリオを持つ。', logoUrl: 'https://via.placeholder.com/80x80/e3f2fd/1565c0?text=L' },
    { id: 3, name: 'Estée Lauder', description: '高級スキンケア、メイクアップ製品で知られるグローバルブランド。', logoUrl: 'https://via.placeholder.com/80x80/e8eaf6/303f9f?text=EL' },
];


export const beautyEvents: Article[] = [
  { id: 1, title: '【渋谷】新作コスメお試し放題！Beauty Festa 開催', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=260&fit=crop&auto=format', date: '9/20(金) - 9/22(日)', tag: 'イベント' },
  { id: 2, title: '【オンライン】人気ヘアメイクアップアーティストによるメイク講座', imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=260&fit=crop&auto=format', date: '9/25(水) 20:00~', tag: 'セミナー' },
  { id: 3, title: '【銀座】期間限定！AuraBeautyポップアップストア', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=260&fit=crop&auto=format', date: '10/1(火) ~', tag: '限定ストア' },
  { id: 4, title: '【大阪】パーソナルカラー診断＆骨格診断イベント', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=260&fit=crop&auto=format', date: '10/5(土)', tag: '体験会' },
];

export const managementTips: Article[] = [
    { id: 1, title: '現役エステティシャンが教える！毛穴悩みを解決する洗顔テクニック', imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=200&fit=crop&auto=format', date: '2024.08.19', category: 'プロのテクニック' },
    { id: 2, title: '美容師が伝授！サロン帰りの仕上がりをキープするヘアドライ術', imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=200&fit=crop&auto=format', date: '2024.08.16', category: 'プロのテクニック' },
    { id: 3, title: '皮膚科医に聞く、敏感肌のための正しい日焼け止めの選び方', imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop&auto=format', date: '2024.08.14', category: '専門家の声' },
];

export const mostReadArticles: Article[] = [
    { id: 1, title: '【2024年版】30代におすすめのエイジングケア美容液TOP5', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&auto=format', date: '2024.07.25', category: 'ランキング' },
    { id: 2, title: '初心者でも簡単！きれいな眉毛の描き方完全ガイド', imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&auto=format', date: '2024.07.20', category: 'ハウツー' },
];

export const manufacturerLogos: string[] = Array.from({ length: 24 }, (_, i) => `https://via.placeholder.com/120x60/f0f0f0/888888?text=Brand+${i + 1}`);