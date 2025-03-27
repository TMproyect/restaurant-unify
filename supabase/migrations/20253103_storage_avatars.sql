
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the avatars bucket
CREATE POLICY "Public Access to Avatars 1vf4awy_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Allow authenticated users to upload to avatars
CREATE POLICY "Upload User Avatars 1vf4awy_0" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Update User Avatars 1vf4awy_0" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Delete User Avatars 1vf4awy_0" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
