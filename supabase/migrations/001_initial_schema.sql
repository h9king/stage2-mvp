-- STAGE2 MVP 초기 스키마 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- =====================
-- 1. SPACES 테이블
-- 한 사람의 인생 공간
-- =====================
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,       -- 주인공 이름 (예: 김철수)
  subject_birth DATE,               -- 생년월일
  cover_photo_url TEXT,             -- 대표 사진 URL
  is_memorial BOOLEAN DEFAULT FALSE, -- 추모 모드 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 2. STAGES 테이블
-- 삶의 구간 (유년기, 학창시절 등)
-- =====================
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,              -- 예: 유년기, 학창시절
  period_start DATE,                -- 시작 시기
  period_end DATE,                  -- 종료 시기
  sort_order INT DEFAULT 0,         -- 정렬 순서
  ai_story TEXT,                    -- AI가 생성한 인생 스토리
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 3. MEMORIES 테이블
-- 기억 단위 (사진, 영상, 텍스트)
-- =====================
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
  memory_type TEXT CHECK (memory_type IN ('photo', 'video', 'audio', 'text')),
  file_url TEXT,                    -- Storage URL
  caption TEXT,                     -- 사진 설명
  taken_at DATE,                    -- 촬영/기록 날짜
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 4. FAMILY_MEMBERS 테이블
-- 가족 공동 편집 멤버
-- =====================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  is_memorial_admin BOOLEAN DEFAULT FALSE, -- 추모 모드 전환 승인권
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- =====================
-- 5. RLS (Row Level Security) 활성화
-- =====================
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- =====================
-- 6. RLS 정책 설정
-- =====================

-- SPACES: 소유자 또는 가족 멤버만 접근
CREATE POLICY "spaces_access" ON spaces
  FOR ALL USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT space_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- STAGES: 해당 SPACE에 접근 가능한 사람만
CREATE POLICY "stages_access" ON stages
  FOR ALL USING (
    space_id IN (
      SELECT id FROM spaces
      WHERE owner_id = auth.uid()
        OR id IN (SELECT space_id FROM family_members WHERE user_id = auth.uid())
    )
  );

-- MEMORIES: 해당 STAGE에 접근 가능한 사람만
CREATE POLICY "memories_access" ON memories
  FOR ALL USING (
    stage_id IN (
      SELECT s.id FROM stages s
      JOIN spaces sp ON s.space_id = sp.id
      WHERE sp.owner_id = auth.uid()
        OR sp.id IN (SELECT space_id FROM family_members WHERE user_id = auth.uid())
    )
  );

-- FAMILY_MEMBERS: 해당 SPACE 소유자만 관리
CREATE POLICY "family_members_read" ON family_members
  FOR SELECT USING (
    space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "family_members_manage" ON family_members
  FOR INSERT WITH CHECK (
    space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid())
  );

-- =====================
-- 7. Storage 버킷 생성 (SQL Editor에서 실행)
-- =====================
-- 주의: 아래는 Supabase Dashboard > Storage에서 수동 생성하세요
-- 버킷명: memories-bucket
-- 공개 여부: Private
-- 파일 크기 제한: 100MB

-- =====================
-- 8. updated_at 자동 갱신 함수
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
