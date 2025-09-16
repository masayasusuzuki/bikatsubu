-- Add cosmetics-specific fields to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS article_type VARCHAR(50) DEFAULT 'article';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS price VARCHAR(50);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5);

-- Add index for article_type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_articles_article_type ON articles(article_type);

-- Update existing articles to have type 'article'
UPDATE articles SET article_type = 'article' WHERE article_type IS NULL;