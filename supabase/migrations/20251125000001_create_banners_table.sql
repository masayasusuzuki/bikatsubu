-- バナー管理テーブルの作成
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSポリシー
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "banners_select_policy" ON banners
  FOR SELECT USING (true);

-- 認証ユーザーのみ挿入・更新・削除可能
CREATE POLICY "banners_insert_policy" ON banners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "banners_update_policy" ON banners
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "banners_delete_policy" ON banners
  FOR DELETE USING (auth.role() = 'authenticated');

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER banners_updated_at_trigger
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_banners_updated_at();

-- コメント
COMMENT ON TABLE banners IS 'バナー広告管理テーブル';
COMMENT ON COLUMN banners.name IS 'バナー名（管理用）';
COMMENT ON COLUMN banners.image_url IS '画像URL';
COMMENT ON COLUMN banners.link_url IS 'リンク先URL';
COMMENT ON COLUMN banners.is_active IS '有効/無効フラグ';
COMMENT ON COLUMN banners.display_order IS '表示順';
