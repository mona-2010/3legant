-- Fix storage policies for avatars bucket to allow upsert operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read 1oj01fe_0" ON storage.objects;

-- Create new comprehensive policies for avatars bucket
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to update their avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to delete their avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
