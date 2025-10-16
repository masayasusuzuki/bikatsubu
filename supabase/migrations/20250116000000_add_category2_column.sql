-- Add category2 column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category2 VARCHAR(100);

-- Add index for category2 for efficient filtering
CREATE INDEX IF NOT EXISTS idx_articles_category2 ON articles(category2);

-- Add comment explaining the column
COMMENT ON COLUMN articles.category2 IS 'Secondary category for article classification (肌育, 最新の美容機器, ホームケア, サロン経営, 海外トレンド, 調査レポート)';
