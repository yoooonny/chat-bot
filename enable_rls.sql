-- 1. Enable RLS on the documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 2. Allow public to strictly SELECT (read-only for the User Chat UI to run RAG)
CREATE POLICY "Allow public read access"
ON documents FOR SELECT
USING (true);

-- 3. (Optional) Allow authenticated or everyone to insert if you want client-side uploads,
-- but since we use the Service Role Key in the backend API, the backend can safely bypass RLS.
-- This prevents random users from deleting or inserting malicious documents directly.

-- 4. Enable RLS on storage (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Give public read access to the 'files' bucket
-- CREATE POLICY "Give public read access" ON storage.objects FOR SELECT USING (bucket_id = 'files');
