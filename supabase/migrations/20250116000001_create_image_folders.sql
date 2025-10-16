-- 画像フォルダテーブルを作成
CREATE TABLE IF NOT EXISTS image_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 画像メタデータテーブルを作成
CREATE TABLE IF NOT EXISTS image_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL UNIQUE,
  folder_id UUID REFERENCES image_folders(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_image_metadata_folder_id ON image_metadata(folder_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_image_url ON image_metadata(image_url);

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_image_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_image_metadata_updated_at
    BEFORE UPDATE ON image_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_image_metadata_updated_at();

-- デフォルトフォルダを作成
INSERT INTO image_folders (name) VALUES
  ('未分類'),
  ('記事画像'),
  ('ヒーロー画像'),
  ('アイキャッチ')
ON CONFLICT (name) DO NOTHING;

-- Row Level Securityを有効化
ALTER TABLE image_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（公開画像なので）
CREATE POLICY "Anyone can view image folders"
ON image_folders FOR SELECT
USING (true);

CREATE POLICY "Anyone can view image metadata"
ON image_metadata FOR SELECT
USING (true);

-- 認証済みユーザーのみ編集可能
CREATE POLICY "Authenticated users can manage folders"
ON image_folders FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage image metadata"
ON image_metadata FOR ALL
USING (auth.role() = 'authenticated');

-- コメント追加
COMMENT ON TABLE image_folders IS '画像を分類するためのフォルダ';
COMMENT ON TABLE image_metadata IS 'Cloudinary画像のメタデータ（フォルダ分類、タイトルなど）';
COMMENT ON COLUMN image_metadata.image_url IS 'Cloudinary画像のURL';
COMMENT ON COLUMN image_metadata.folder_id IS '所属するフォルダのID（NULL=未分類）';
