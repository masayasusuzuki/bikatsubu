-- Check if popular_medical_beauty records already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE section_name = 'popular_medical_beauty') THEN
    -- Add popular_medical_beauty section to page_sections table
    INSERT INTO page_sections (section_name, position, article_id) VALUES
      -- Popular Medical Beauty section (3 articles)
      ('popular_medical_beauty', 1, NULL),
      ('popular_medical_beauty', 2, NULL),
      ('popular_medical_beauty', 3, NULL);
    RAISE NOTICE 'Added popular_medical_beauty section records';
  ELSE
    RAISE NOTICE 'popular_medical_beauty section records already exist';
  END IF;
END $$;