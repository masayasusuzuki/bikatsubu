-- Development-only policy: allow anonymous inserts into articles
-- NOTE: Remove before production.

CREATE POLICY "Dev: anon can insert articles"
ON articles
FOR INSERT
TO anon
WITH CHECK (true);


