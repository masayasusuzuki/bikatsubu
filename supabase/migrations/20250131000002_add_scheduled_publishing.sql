-- Add published_at and scheduled_publish_at columns to articles table
ALTER TABLE articles
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE;

-- Update status column to allow 'scheduled' value
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check
CHECK (status IN ('draft', 'published', 'scheduled'));

-- Create index for scheduled publishing queries
CREATE INDEX articles_scheduled_publish_at_idx ON articles(scheduled_publish_at)
WHERE status = 'scheduled';

-- Trigger to set published_at when article is first published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to 'published' and published_at is not set
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;

  -- Clear scheduled_publish_at when manually published
  IF NEW.status = 'published' AND OLD.status = 'scheduled' THEN
    NEW.scheduled_publish_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_articles_published_at ON articles;
CREATE TRIGGER set_articles_published_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- Function to automatically publish scheduled articles
CREATE OR REPLACE FUNCTION publish_scheduled_articles()
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET
    status = 'published',
    published_at = NOW(),
    scheduled_publish_at = NULL
  WHERE
    status = 'scheduled'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Update existing published articles to have published_at set to created_at
UPDATE articles
SET published_at = created_at
WHERE status = 'published' AND published_at IS NULL;

-- Comment for documentation
COMMENT ON COLUMN articles.published_at IS '記事が実際に公開された日時（SEO用）';
COMMENT ON COLUMN articles.scheduled_publish_at IS '予約公開日時';
