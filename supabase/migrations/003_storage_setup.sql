-- =====================================================
-- STAGE2 Storage 버킷 설정
-- 003_storage_setup.sql
--
-- 실행 위치: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. 스토리지 버킷 생성 (public: 이미지 URL 직접 접근 가능)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stage2-uploads',
  'stage2-uploads',
  true,
  10485760,  -- 10MB
  '{image/jpeg,image/jpg,image/png,image/webp,image/gif}'
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = '{image/jpeg,image/jpg,image/png,image/webp,image/gif}';

-- 2. Storage RLS 정책
-- 공개 읽기 (URL로 누구나 이미지 볼 수 있음)
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stage2-uploads');

-- 로그인 사용자만 업로드 가능
CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stage2-uploads'
    AND auth.role() = 'authenticated'
  );

-- 업로드한 사람만 수정/삭제 가능
CREATE POLICY "Owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'stage2-uploads'
    AND auth.uid() = owner
  );

CREATE POLICY "Owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stage2-uploads'
    AND auth.uid() = owner
  );

-- 완료 확인
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'stage2-uploads';
