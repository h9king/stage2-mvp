-- =====================================================
-- STAGE2 RLS 정책 재정비 (무한 재귀 버그 수정)
-- 004_fix_rls_recursion.sql
--
-- 문제: spaces 정책에서 family_members 조회 시
--       family_members → spaces → family_members 무한 순환 발생
-- 해결: INSERT 정책은 단순하게, SELECT는 security definer 함수 사용
--
-- 실행 위치: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. 기존 spaces RLS 정책 모두 삭제
DROP POLICY IF EXISTS "spaces_select"  ON spaces;
DROP POLICY IF EXISTS "spaces_insert"  ON spaces;
DROP POLICY IF EXISTS "spaces_update"  ON spaces;
DROP POLICY IF EXISTS "spaces_delete"  ON spaces;

-- 기존 다른 이름 정책도 정리
DROP POLICY IF EXISTS "spaces_access"  ON spaces;

-- 2. stages / memories / family_members 정책도 재정비
DROP POLICY IF EXISTS "stages_access"   ON stages;
DROP POLICY IF EXISTS "memories_access" ON memories;
DROP POLICY IF EXISTS "family_read"     ON family_members;
DROP POLICY IF EXISTS "family_insert"   ON family_members;
DROP POLICY IF EXISTS "family_delete"   ON family_members;

-- =====================================================
-- 3. SPACES 정책 재작성 (재귀 없음)
-- =====================================================

-- INSERT: 로그인한 사용자는 자신이 owner인 공간 생성 가능
-- (가장 단순, 재귀 없음)
CREATE POLICY "spaces_insert"
  ON spaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- SELECT: 내가 owner이거나, public인 공간
-- family_members 참조 제거 → 재귀 완전 차단
CREATE POLICY "spaces_select"
  ON spaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR visibility = 'public'
  );

-- UPDATE: 내가 owner인 공간만
CREATE POLICY "spaces_update"
  ON spaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: 내가 owner인 공간만
CREATE POLICY "spaces_delete"
  ON spaces FOR DELETE
  USING (owner_id = auth.uid());

-- =====================================================
-- 4. STAGES 정책 재작성
-- =====================================================
CREATE POLICY "stages_all"
  ON stages FOR ALL
  USING (
    space_id IN (
      SELECT id FROM spaces WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    space_id IN (
      SELECT id FROM spaces WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- 5. MEMORIES 정책 재작성
-- =====================================================
CREATE POLICY "memories_all"
  ON memories FOR ALL
  USING (
    space_id IN (
      SELECT id FROM spaces WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    space_id IN (
      SELECT id FROM spaces WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- 6. FAMILY_MEMBERS 정책 재작성
-- =====================================================
CREATE POLICY "family_select"
  ON family_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "family_insert"
  ON family_members FOR INSERT
  WITH CHECK (
    space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "family_delete"
  ON family_members FOR DELETE
  USING (
    space_id IN (SELECT id FROM spaces WHERE owner_id = auth.uid())
  );

-- =====================================================
-- 완료 확인 — 현재 정책 목록 출력
-- =====================================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('spaces', 'stages', 'memories', 'family_members')
ORDER BY tablename, policyname;
