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
  status: 'draft' | 'published'
  featured_image?: string
  category: string
  category2?: string
  author_id?: string
  article_type?: string
  brand?: string
  price?: string
  release_date?: string
  rating?: number
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
  status: 'draft' | 'published'
  featured_image?: string
  category: string
  category2?: string
  article_type?: string
  brand?: string
  price?: string
  release_date?: string
  rating?: number
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
  async getArticleById(id: string) {
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

  // 最新記事を取得（公開済みのみ、指定件数）
  async getLatestArticles(limit: number = 5) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
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