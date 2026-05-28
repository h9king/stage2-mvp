-- =====================================================
-- STAGE2 MVP 스키마 재정비 v2.0
-- 002_fix_spaces_schema.sql
--
-- ⚠️ 실행 전 주의사항:
--    기존 테이블을 삭제하고 재생성합니다.
--    현재 MVP 초기 단계이므로 데이터 손실 없습니다.
--
-- 실행 위치: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. 기존 테이블 삭제 (의존성 순서 역순)
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS memories CASCADE;
DROP TABLE IF EXISTS stages CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;

-- 기존 함수/트리거도 정리
DROP FUNCTION IF EXISTS update_updated_at CASCADE;

-- =====================================================
-- 2. SPACES 테이블 (코드 기준으로 재설계)
-- =====================================================
CREATE TABLE spaces (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- 주인공 정보
  name             TEXT NOT NULL,                          -- 주인공 이름
  relationship     TEXT,                                   -- 관계: spouse|parent|child|sibling|grandparent|friend|self|other
  birth_year       INTEGER,                                -- 출생 연도
  death_year       INTEGER,                                -- 별세 연도 (사전 기록이면 NULL)
  bio              TEXT,                                   -- 한 줄 소개 (100자)
  life_story       TEXT,                                   -- 인생 이야기 (자유 텍스트)

  -- 미디어
  profile_image_url TEXT,                                  -- 프로필 사진 URL (Storage)
  cover_image_url   TEXT,                                  -- 커버 사진 URL (Storage)

  -- 설정
  is_self          BOOLEAN DEFAULT FALSE,                  -- 본인 사전 기록 여부
  status           TEXT DEFAULT 'draft'                    -- draft | published
    CHECK (status IN ('draft', 'published')),
  visibility       TEXT DEFAULT 'private'                  -- private | family | public
    CHECK (visibility IN ('private', 'family', 'public')),

  -- 메타
  view_count       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. STAGES 테이블 (삶의 챕터)
-- =====================================================
CREATE TABLE stages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id     UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,        -- 예: 유년기, 학창시절, 직장생활
  period_start INTEGER,              -- 시작 연도
  period_end   INTEGER,              -- 종료 연도
  story        TEXT,                 -- 해당 시기 이야기
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MEMORIES 테이블 (사진/영상/음성/텍스트)
-- =====================================================
CREATE TABLE memories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id     UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  stage_id     UUID REFERENCES stages(id) ON DELETE SET NULL,
  memory_type  TEXT NOT NULL
    CHECK (memory_type IN ('photo', 'video', 'audio', 'text')),
  file_url     TEXT,                 -- Supabase Storage URL
  thumbnail_url TEXT,               -- 썸네일 (영상용)
  caption      TEXT,                -- 설명/제목
  taken_at     DATE,                -- 촬영/기록 날짜
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. FAMILY_MEMBERS 테이블 (공동 편집)
-- =====================================================
CREATE TABLE family_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id   UUID REFERENCES spaces(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       TEXT DEFAULT 'viewer'
    CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- =====================================================
-- 6. 자동 updated_at 함수
-- =====================================================
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

-- =====================================================
-- 7. RLS (Row Level Security) 활성화
-- =====================================================
ALTER TABLE spaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. RLS 정책
-- =====================================================

-- SPACES
-- 소유자 또는 가족 멤버: 전체 접근
CREATE POLICY "spaces_select" ON spaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT space_id FROM family_members WHERE user_id = auth.uid())
    OR visibility = 'public'
  );

CREATE POLICY "spaces_insert" ON spaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "spaces_update" ON spaces FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT space_id FROM family_members WHERE user_id = auth.uid() AND role IN ('owner','editor'))
  );

CREATE POLICY "spaces_delete" ON spaces FOR DELETE
  USING (owner_id = auth.uid());

-- STAGES
CREATE POLICY "stages_access" ON stages FOR ALL
  USING (
    space_id IN (
      SELECT id FROM spaces
      WHERE owner_id = auth.uid()
      OR id IN (SELECT space_id FROM family_members WHERE user_id = auth.uid())
    )
  );

-- MEMORIES
CREATE POLICY "memories_access" ON memories FOR ALL
  USING (
    space_id IN (
      SELECT id FROM spaces
      WHERE owner_id = auth.uid()
      OR id IN (SELECT space_id FROM family_members WHERE user_id = auth.uid())
    )
  );

-- FAMILY_MEMBERS
CREATE POLICY "family_read" ON family_members FOR SELECT
  USING (user_id = auth.uid() OR space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid()));

CREATE POLICY "family_insert" ON family_members FOR INSERT
  WITH CHECK (space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid()));

CREATE POLICY "family_delete" ON family_members FOR DELETE
  USING (space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid()));

-- =====================================================
-- 9. 인덱스 (성능 최적화)
-- =====================================================
CREATE INDEX idx_spaces_owner_id ON spaces(owner_id);
CREATE INDEX idx_stages_space_id ON stages(space_id);
CREATE INDEX idx_memories_space_id ON memories(space_id);
CREATE INDEX idx_memories_stage_id ON memories(stage_id);
CREATE INDEX idx_family_space_id ON family_members(space_id);
CREATE INDEX idx_family_user_id ON family_members(user_id);

-- =====================================================
-- 완료 확인 쿼리 (실행 후 결과 확인용)
-- =====================================================
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('spaces','stages','memories','family_members')
ORDER BY table_name, ordinal_position;
