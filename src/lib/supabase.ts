import { createClient } from '@supabase/supabase-js'

// Vite の環境変数（.env）を優先し、未設定時はローカル開発用デフォルトにフォールバック
const fallbackUrl = 'http://localhost:54321'
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const url = (import.meta as any).env?.VITE_SUPABASE_URL || fallbackUrl
const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || fallbackAnonKey

export const supabase = createClient(url, key)

// 記事の型定義
export interface Article {
  id: string
  title: string
  content: string
  meta_description?: string
  keywords?: string
  slug: string
  status: 'draft' | 'published' | 'scheduled'
  featured_image?: string
  featured_image_alt?: string
  category: string
  category2?: string
  author_id?: string
  article_type?: string
  brand?: string
  price?: string
  release_date?: string
  rating?: number
  published_at?: string
  scheduled_publish_at?: string
  created_at: string
  updated_at: string
}

// 記事作成用の型定義
export interface CreateArticle {
  title: string
  content: string
  meta_description?: string
  keywords?: string
  slug: string
  status: 'draft' | 'published' | 'scheduled'
  featured_image?: string
  featured_image_alt?: string
  category: string
  category2?: string
  article_type?: string
  brand?: string
  price?: string
  release_date?: string
  rating?: number
  scheduled_publish_at?: string
}

// Cloudinary画像情報の型定義
export interface CloudinaryImageFromDB {
  image_url: string;
  title: string;
  created_at: string;
}

// 記事データベース操作関数
export const articlesAPI = {
  // 公開済み記事を取得
  async getPublishedArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Article[]
  },

  // 記事をIDで取得
  async getArticleById(id: string): Promise<Article> {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Article
  },

  // カテゴリ別記事を取得
  async getArticlesByCategory(category: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .or(`category.eq.${category},category2.eq.${category}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Article[]
  },

  // 記事タイプ別記事を取得
  async getArticlesByType(articleType: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .eq('article_type', articleType)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Article[]
  },

  // スラッグで記事を取得
  async getArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) throw error
    return data as Article
  },

  // 記事を作成
  async createArticle(article: CreateArticle) {
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single()

    if (error) throw error
    return data as Article
  },

  // 管理者用: 全ての記事を取得
  async getAllArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Article[]
  },

  // 管理者用: ページネーション付きで記事を取得
  async getArticlesPaginated(limit: number = 20, offset: number = 0) {
    const { data, error, count } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { articles: data as Article[], total: count || 0 }
  },

  // 最新記事を取得（公開済みのみ、指定件数）
  async getLatestArticles(limit: number = 5) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Article[]
  },

  // 記事を更新
  async updateArticle(id: string, updates: Partial<CreateArticle>) {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Article
  },

  // 記事を削除
  async deleteArticle(id: string) {
    // まず、page_sectionsで使用されている場合は参照を削除
    const { error: sectionError } = await supabase
      .from('page_sections')
      .update({ article_id: null })
      .eq('article_id', id)

    if (sectionError) {
      console.warn('ページセクションからの参照削除に失敗:', sectionError)
      // 参照削除に失敗してもメイン削除は続行
    }

    // 記事を削除
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Cloudinary画像URLを記事から取得
  async getCloudinaryImages(): Promise<CloudinaryImageFromDB[]> {
    const { data, error } = await supabase
      .from('articles')
      .select('featured_image, title, created_at, content')
      .or('featured_image.ilike.%res.cloudinary.com%,content.ilike.%res.cloudinary.com%')
      .order('created_at', { ascending: false })

    if (error) throw error

    // URLを抽出して重複除去
    const imageUrls = new Set<string>()
    const results: CloudinaryImageFromDB[] = []

    data?.forEach(article => {
      // featured_imageから取得
      if (article.featured_image && article.featured_image.includes('res.cloudinary.com')) {
        if (!imageUrls.has(article.featured_image)) {
          imageUrls.add(article.featured_image)
          results.push({
            image_url: article.featured_image,
            title: article.title,
            created_at: article.created_at
          })
        }
      }

      // contentから正規表現で抽出（大小文字を区別せず、httpも含む）
      if (article.content) {
        const urlMatches = article.content.match(/https?:\/\/res\.cloudinary\.com\/[^"\s)]+/gi)
        urlMatches?.forEach(url => {
          // URLを正規化（小文字に統一、httpをhttpsに変換）
          const normalizedUrl = url.toLowerCase().replace(/^http:/, 'https:')
          if (!imageUrls.has(normalizedUrl)) {
            imageUrls.add(normalizedUrl)
            results.push({
              image_url: normalizedUrl,
              title: article.title,
              created_at: article.created_at
            })
          }
        })
      }
    })

    return results
  },

  // 記事を検索（タイトル、カテゴリー、キーワードで検索）
  async searchArticles(query: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,category.ilike.%${query}%,category2.ilike.%${query}%,keywords.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Article[]
  },

  // 肌診断結果に基づいておすすめ記事を取得
  async getRecommendedArticles(skinType: string, concerns: string[], limit: number = 6) {
    // 肌タイプと悩みから検索キーワードを生成
    const keywords = [skinType, ...concerns, 'スキンケア', 'ケア']

    // キーワードマッピング（より幅広い記事をヒットさせる）
    const keywordMap: { [key: string]: string[] } = {
      '乾燥肌': ['乾燥', '保湿', 'うるおい', 'しっとり', 'セラミド', 'ヒアルロン酸'],
      '脂性肌': ['脂性', '皮脂', 'テカリ', 'オイリー', 'さっぱり', '毛穴'],
      '混合肌': ['混合', 'バランス', 'Tゾーン', 'Uゾーン', '部分ケア'],
      '普通肌': ['普通肌', 'バランス', '健康', '維持', 'キープ'],
      '敏感肌': ['敏感', '刺激', '低刺激', 'やさしい', 'マイルド', 'バリア機能'],
      '毛穴': ['毛穴', '角栓', '黒ずみ', '引き締め', 'ポア'],
      'くすみ': ['くすみ', '透明感', '明るさ', 'ブライトニング', 'ビタミンC'],
      'シワ': ['シワ', 'しわ', 'エイジング', 'アンチエイジング', 'ハリ', 'レチノール'],
      'ニキビ': ['ニキビ', '吹き出物', 'アクネ', '炎症', 'ビタミンC'],
      'たるみ': ['たるみ', 'ハリ', '弾力', 'リフトアップ', 'エイジング'],
      'シミ': ['シミ', '色素沈着', '美白', 'ブライトニング', 'ビタミンC'],
      '赤み': ['赤み', '炎症', '鎮静', 'カーミング', 'センシティブ']
    }

    // 拡張キーワードリストを作成
    const expandedKeywords = new Set<string>()
    keywords.forEach(keyword => {
      expandedKeywords.add(keyword)
      // キーワードマッピングから関連キーワードを追加
      Object.entries(keywordMap).forEach(([key, values]) => {
        if (keyword.includes(key) || key.includes(keyword)) {
          values.forEach(v => expandedKeywords.add(v))
        }
      })
    })

    const searchTerms = Array.from(expandedKeywords)

    // 複数キーワードでOR検索
    const orConditions = searchTerms.map(term =>
      `title.ilike.%${term}%,category.ilike.%${term}%,category2.ilike.%${term}%,keywords.ilike.%${term}%,content.ilike.%${term}%`
    ).join(',')

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .or(orConditions)
      .order('created_at', { ascending: false })
      .limit(limit * 2) // イベント記事除外後に十分な数を確保

    if (error) throw error

    // article_typeが'event'の記事を除外してフィルタリング
    const filteredArticles = (data as Article[])
      .filter(article => article.article_type !== 'event')
      .slice(0, limit) // 最終的に必要な件数に絞る

    return filteredArticles
  }
}

// Page sections types and API
export interface PageSection {
  id: string
  section_name: string
  position: number
  article_id: string | null
  created_at: string
  updated_at: string
  article?: Article
}

export const pageSectionsAPI = {
  // すべてのページセクションを取得
  async getAllSections(): Promise<PageSection[]> {
    const { data, error } = await supabase
      .from('page_sections')
      .select(`
        *,
        article:articles(*)
      `)
      .order('section_name')
      .order('position')

    if (error) throw error
    return data as PageSection[]
  },

  // 特定のセクションのデータを取得
  async getSectionByName(sectionName: string): Promise<PageSection[]> {
    const { data, error } = await supabase
      .from('page_sections')
      .select(`
        *,
        article:articles(*)
      `)
      .eq('section_name', sectionName)
      .order('position')

    if (error) throw error
    return data as PageSection[]
  },

  // ページセクションを更新
  async updateSection(id: string, articleId: string | null) {
    const { error } = await supabase
      .from('page_sections')
      .update({ article_id: articleId })
      .eq('id', id)

    if (error) throw error
  },

  // 複数のページセクションを一括更新
  async updateMultipleSections(updates: { id: string; article_id: string | null }[]) {
    const promises = updates.map(update =>
      supabase
        .from('page_sections')
        .update({ article_id: update.article_id })
        .eq('id', update.id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(result => result.error).map(result => result.error)

    if (errors.length > 0) throw errors[0]
  },

  // セクションに新しいカードを追加
  async addCardToSection(sectionName: string) {
    // 現在のセクションの最大位置を取得
    const { data: maxPositionData, error: maxError } = await supabase
      .from('page_sections')
      .select('position')
      .eq('section_name', sectionName)
      .order('position', { ascending: false })
      .limit(1)

    if (maxError) throw maxError

    const nextPosition = maxPositionData.length > 0 ? maxPositionData[0].position + 1 : 1

    // 新しいカードを追加
    const { data, error } = await supabase
      .from('page_sections')
      .insert({
        section_name: sectionName,
        position: nextPosition,
        article_id: null
      })
      .select()
      .single()

    if (error) throw error
    return data as PageSection
  },

  // セクションからカードを削除（最後のカードを削除）
  async removeCardFromSection(sectionName: string) {
    // 現在のセクションの最大位置のカードを取得
    const { data: maxPositionData, error: maxError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('section_name', sectionName)
      .order('position', { ascending: false })
      .limit(1)

    if (maxError) throw maxError

    if (maxPositionData.length === 0) {
      throw new Error('削除するカードがありません')
    }

    // 最後のカードを削除
    const { error } = await supabase
      .from('page_sections')
      .delete()
      .eq('id', maxPositionData[0].id)

    if (error) throw error
    return maxPositionData[0] as PageSection
  },

  // 特定のカードを削除
  async removeSpecificCard(cardId: string) {
    const { error } = await supabase
      .from('page_sections')
      .delete()
      .eq('id', cardId)

    if (error) throw error
  },

  // セクションを初期化（存在しない場合のみ作成）
  async initializeSection(sectionName: string, positions: number[]) {
    // セクションが既に存在するかチェック
    const { data: existingData, error: existingError } = await supabase
      .from('page_sections')
      .select('id')
      .eq('section_name', sectionName)
      .limit(1)

    if (existingError) throw existingError

    // 既に存在する場合は何もしない
    if (existingData && existingData.length > 0) {
      return
    }

    // 存在しない場合は初期レコードを作成
    const insertData = positions.map(position => ({
      section_name: sectionName,
      position: position,
      article_id: null
    }))

    const { error } = await supabase
      .from('page_sections')
      .insert(insertData)

    if (error) throw error
  }
}

// Hero slides types and API
export interface HeroSlide {
  id: string
  image_url: string
  alt_text: string
  order_position: number
  article_id?: string
  external_link?: string
  created_at: string
  updated_at: string
  article?: Article
}

export interface CreateHeroSlide {
  image_url: string
  alt_text: string
  order_position: number
  article_id?: string | null
  external_link?: string | null
}

export const heroSlidesAPI = {
  // 全てのヒーロースライドを取得（記事情報も含む）
  async getAllSlides(): Promise<HeroSlide[]> {
    const { data, error } = await supabase
      .from('hero_slides')
      .select(`
        *,
        article:articles(*)
      `)
      .order('order_position')

    if (error) throw error
    return data as HeroSlide[]
  },

  // ヒーロースライドを作成
  async createSlide(slide: CreateHeroSlide): Promise<HeroSlide> {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([slide])
      .select()
      .single()

    if (error) throw error
    return data as HeroSlide
  },

  // ヒーロースライドを更新
  async updateSlide(id: string, updates: Partial<CreateHeroSlide>): Promise<HeroSlide> {
    const { data, error } = await supabase
      .from('hero_slides')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as HeroSlide
  },

  // ヒーロースライドを削除
  async deleteSlide(id: string): Promise<void> {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // スライドの順序を一括更新
  async updateSlidesOrder(updates: { id: string; order_position: number }[]): Promise<void> {
    const promises = updates.map(update =>
      supabase
        .from('hero_slides')
        .update({ order_position: update.order_position })
        .eq('id', update.id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(result => result.error).map(result => result.error)

    if (errors.length > 0) throw errors[0]
  }
}

// 画像フォルダの型定義
export interface ImageFolder {
  id: string
  name: string
  created_at: string
  image_count?: number
}

// 画像メタデータの型定義
export interface ImageMetadata {
  id: string
  image_url: string
  folder_id: string | null
  title: string | null
  created_at: string
  updated_at: string
  folder?: ImageFolder
}

// 画像フォルダAPI
export const imageFoldersAPI = {
  // 全フォルダを取得（画像数付き）
  async getAllFolders(): Promise<ImageFolder[]> {
    const { data, error } = await supabase
      .from('image_folders')
      .select('*, image_metadata(count)')
      .order('created_at')

    if (error) throw error

    // 画像数を追加
    return (data || []).map((folder: any) => ({
      id: folder.id,
      name: folder.name,
      created_at: folder.created_at,
      image_count: folder.image_metadata?.[0]?.count || 0
    }))
  },

  // フォルダを作成
  async createFolder(name: string): Promise<ImageFolder> {
    const { data, error } = await supabase
      .from('image_folders')
      .insert([{ name }])
      .select()
      .single()

    if (error) throw error
    return data as ImageFolder
  },

  // フォルダを削除
  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('image_folders')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // フォルダ名を変更
  async renameFolder(id: string, name: string): Promise<ImageFolder> {
    const { data, error } = await supabase
      .from('image_folders')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ImageFolder
  }
}

// 画像メタデータAPI
export const imageMetadataAPI = {
  // 全画像メタデータを取得（フォルダ情報付き）
  async getAllMetadata(): Promise<ImageMetadata[]> {
    const { data, error } = await supabase
      .from('image_metadata')
      .select('*, folder:image_folders(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as ImageMetadata[]
  },

  // フォルダIDで画像を取得
  async getMetadataByFolder(folderId: string | null): Promise<ImageMetadata[]> {
    let query = supabase
      .from('image_metadata')
      .select('*, folder:image_folders(*)')
      .order('created_at', { ascending: false })

    if (folderId === null) {
      query = query.is('folder_id', null)
    } else {
      query = query.eq('folder_id', folderId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as ImageMetadata[]
  },

  // 画像をフォルダに移動
  async moveImageToFolder(imageUrl: string, folderId: string | null): Promise<ImageMetadata> {
    const { data, error } = await supabase
      .from('image_metadata')
      .upsert({
        image_url: imageUrl,
        folder_id: folderId
      }, {
        onConflict: 'image_url'
      })
      .select('*, folder:image_folders(*)')
      .single()

    if (error) throw error
    return data as ImageMetadata
  },

  // 複数画像を一括移動
  async moveMultipleImages(imageUrls: string[], folderId: string | null): Promise<void> {
    const records = imageUrls.map(url => ({
      image_url: url,
      folder_id: folderId
    }))

    const { error } = await supabase
      .from('image_metadata')
      .upsert(records, {
        onConflict: 'image_url'
      })

    if (error) throw error
  },

  // 画像メタデータを削除
  async deleteMetadata(imageUrl: string): Promise<void> {
    const { error } = await supabase
      .from('image_metadata')
      .delete()
      .eq('image_url', imageUrl)

    if (error) throw error
  },

  // 画像メタデータを削除（エイリアス）
  async deleteImageMetadata(imageUrl: string): Promise<void> {
    return this.deleteMetadata(imageUrl)
  },

  // 複数画像を一括削除
  async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    const { error } = await supabase
      .from('image_metadata')
      .delete()
      .in('image_url', imageUrls)

    if (error) throw error
  }
}

// Beauty Events API
export const beautyEventsAPI = {
  // すべてのイベントを取得（日付順）
  async getAllEvents(): Promise<BeautyEvent[]> {
    const { data, error } = await supabase
      .from('beauty_events')
      .select('*')
      .order('event_date', { ascending: true })

    if (error) throw error
    return data as BeautyEvent[]
  },

  // 単一イベント取得
  async getEventById(id: string): Promise<BeautyEvent | null> {
    const { data, error } = await supabase
      .from('beauty_events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as BeautyEvent
  },

  // イベント作成
  async createEvent(event: CreateBeautyEvent): Promise<BeautyEvent> {
    // 画像URLが空の場合、デフォルト画像を設定
    const eventWithImage = {
      ...event,
      image_url: event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop&auto=format'
    }

    const { data, error } = await supabase
      .from('beauty_events')
      .insert([eventWithImage])
      .select()
      .single()

    if (error) throw error
    return data as BeautyEvent
  },

  // イベント一括作成
  async createEvents(events: CreateBeautyEvent[]): Promise<BeautyEvent[]> {
    // 画像URLが空の場合、デフォルト画像を設定
    const eventsWithImages = events.map(event => ({
      ...event,
      image_url: event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop&auto=format'
    }))

    const { data, error } = await supabase
      .from('beauty_events')
      .insert(eventsWithImages)
      .select()

    if (error) throw error
    return data as BeautyEvent[]
  },

  // イベント更新
  async updateEvent(id: string, event: Partial<CreateBeautyEvent>): Promise<BeautyEvent> {
    const { data, error } = await supabase
      .from('beauty_events')
      .update(event)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as BeautyEvent
  },

  // イベント削除
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('beauty_events')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // 期間指定でイベント取得
  async getEventsByDateRange(startDate: string, endDate: string): Promise<BeautyEvent[]> {
    const { data, error } = await supabase
      .from('beauty_events')
      .select('*')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true })

    if (error) throw error
    return data as BeautyEvent[]
  },

  // カテゴリー別イベント取得
  async getEventsByCategory(category: string): Promise<BeautyEvent[]> {
    const { data, error } = await supabase
      .from('beauty_events')
      .select('*')
      .eq('category', category)
      .order('event_date', { ascending: true })

    if (error) throw error
    return data as BeautyEvent[]
  }
}

// BeautyEvent型をエクスポート
import type { BeautyEvent, CreateBeautyEvent } from '../../types'

// Banner型定義
export interface Banner {
  id: string
  name: string
  image_url: string
  link_url: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreateBanner {
  name: string
  image_url: string
  link_url: string
  is_active?: boolean
  display_order?: number
}

// Banners API
export const bannersAPI = {
  // 全バナーを取得
  async getAllBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as Banner[]
  },

  // 有効なバナーのみ取得
  async getActiveBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as Banner[]
  },

  // バナーをIDで取得
  async getBannerById(id: string): Promise<Banner> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Banner
  },

  // バナーを作成
  async createBanner(banner: CreateBanner): Promise<Banner> {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner])
      .select()
      .single()

    if (error) throw error
    return data as Banner
  },

  // バナーを更新
  async updateBanner(id: string, updates: Partial<CreateBanner>): Promise<Banner> {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Banner
  },

  // バナーを削除
  async deleteBanner(id: string): Promise<void> {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // バナーの表示順を一括更新
  async updateBannersOrder(updates: { id: string; display_order: number }[]): Promise<void> {
    const promises = updates.map(update =>
      supabase
        .from('banners')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(result => result.error).map(result => result.error)

    if (errors.length > 0) throw errors[0]
  }
}