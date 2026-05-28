import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const BUCKET = 'stage2-uploads'
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_MB = 10

/**
 * MemoryGallery — 추억 영상관 탭 전용 갤러리 컴포넌트
 * Props: spaceId, isOwner
 */
export default function MemoryGallery({ spaceId, isOwner }) {
  const { user } = useAuth()
  const inputRef = useRef(null)
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [lightbox, setLightbox] = useState(null) // 선택된 이미지 URL
  const [deleting, setDeleting] = useState(null) // 삭제 중인 memory id
  const [caption, setCaption] = useState('') // 업로드 캡션 입력
  const [showCaptionFor, setShowCaptionFor] = useState(null)

  useEffect(() => { fetchMemories() }, [spaceId])

  const fetchMemories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('space_id', spaceId)
      .eq('memory_type', 'photo')
      .order('created_at', { ascending: false })

    if (!error) setMemories(data || [])
    setLoading(false)
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    for (const file of files) {
      await uploadFile(file)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files || [])
    for (const file of files) {
      if (ALLOWED.includes(file.type)) await uploadFile(file)
    }
  }

  const uploadFile = async (file) => {
    setUploadError('')
    if (!ALLOWED.includes(file.type)) {
      setUploadError('이미지 파일만 업로드 가능합니다. (JPG, PNG, WebP, GIF)')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`파일 크기는 ${MAX_MB}MB 이하여야 합니다.`)
      return
    }

    setUploading(true)
    setUploadProgress(20)

    try {
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
      const filePath = `memories/${spaceId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type })

      if (uploadError) throw uploadError

      setUploadProgress(70)

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      // memories 테이블에 저장
      const { data: memData, error: dbError } = await supabase
        .from('memories')
        .insert([{
          space_id:    spaceId,
          memory_type: 'photo',
          file_url:    publicUrl,
          caption:     '',
        }])
        .select()
        .single()

      if (dbError) throw dbError

      setUploadProgress(100)
      setMemories(prev => [memData, ...prev])
    } catch (err) {
      console.error('Memory upload error:', err)
      setUploadError(`업로드 실패: ${err.message}`)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 600)
    }
  }

  const handleDelete = async (memory) => {
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) return
    setDeleting(memory.id)
    try {
      // Storage에서 삭제
      const urlParts = memory.file_url.split('/stage2-uploads/')
      if (urlParts.length > 1) {
        await supabase.storage.from(BUCKET).remove([urlParts[1]])
      }
      // DB에서 삭제
      await supabase.from('memories').delete().eq('id', memory.id)
      setMemories(prev => prev.filter(m => m.id !== memory.id))
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleting(null)
    }
  }

  const handleSaveCaption = async (memoryId, captionText) => {
    const { error } = await supabase
      .from('memories').update({ caption: captionText }).eq('id', memoryId)
    if (!error) {
      setMemories(prev => prev.map(m => m.id === memoryId ? { ...m, caption: captionText } : m))
      setShowCaptionFor(null)
      setCaption('')
    }
  }

  return (
    <div>
      {/* 업로드 영역 (소유자만) */}
      {isOwner && (
        <div style={{ marginBottom: '24px' }}>
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${uploading ? 'rgba(242,212,155,0.6)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '16px',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: uploading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              background: uploading ? 'rgba(242,212,155,0.04)' : 'transparent',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor = 'rgba(242,212,155,0.4)')}
            onMouseLeave={e => !uploading && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid rgba(242,212,155,0.2)', borderTopColor: '#F2D49B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: '#F2D49B' }}>
                  업로드 중... {uploadProgress}%
                </p>
                {/* 프로그레스 바 */}
                <div style={{ width: '200px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#F2D49B', transition: 'width 0.3s', borderRadius: '99px' }} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📷</div>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontWeight: 600 }}>
                  클릭하거나 사진을 여기에 드래그하세요
                </p>
                <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                  JPG, PNG, WebP, GIF · 최대 10MB · 여러 장 동시 업로드 가능
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: 'rgb(252,165,165)', marginTop: '8px' }}>
              {uploadError}
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* 갤러리 */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(242,212,155,0.2)', borderTopColor: '#F2D49B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : memories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#111', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}>🖼️</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#fff', marginBottom: '6px' }}>
            아직 사진이 없습니다
          </p>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
            {isOwner ? '위 영역에 사진을 업로드해보세요.' : '아직 등록된 사진이 없습니다.'}
          </p>
        </div>
      ) : (
        <>
          {/* 사진 수 */}
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
            사진 {memories.length}장
          </p>

          {/* 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {memories.map(memory => (
              <div key={memory.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#1A1A1A', aspectRatio: '1', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img
                  src={memory.file_url}
                  alt={memory.caption || '추억 사진'}
                  onClick={() => setLightbox(memory)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />

                {/* 오버레이 */}
                <div className="memory-overlay" style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0)', transition: 'background 0.2s',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px',
                }}>
                  {memory.caption && (
                    <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#fff', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                      {memory.caption}
                    </p>
                  )}
                </div>

                {/* 삭제 버튼 (소유자) */}
                {isOwner && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(memory) }}
                    disabled={deleting === memory.id}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', transition: 'all 0.2s', zIndex: 2,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.8)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >
                    {deleting === memory.id ? '…' : '×'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 라이트박스 */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%', width: '40px', height: '40px',
              color: '#fff', cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>

          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <img
              src={lightbox.file_url}
              alt={lightbox.caption || ''}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px' }}
            />
            {lightbox.caption && (
              <p style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '15px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontStyle: 'italic' }}>
                "{lightbox.caption}"
              </p>
            )}
            {isOwner && showCaptionFor === lightbox.id ? (
              <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '400px' }}>
                <input
                  autoFocus
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="사진 설명 입력..."
                  onKeyDown={e => e.key === 'Enter' && handleSaveCaption(lightbox.id, caption)}
                  style={{
                    flex: 1, background: '#1A1A1A', border: '1px solid rgba(242,212,155,0.4)',
                    borderRadius: '8px', padding: '8px 14px', color: '#fff',
                    fontFamily: 'Pretendard, sans-serif', fontSize: '14px', outline: 'none',
                  }}
                />
                <button onClick={() => handleSaveCaption(lightbox.id, caption)} style={{ background: '#F2D49B', color: '#080808', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '13px' }}>저장</button>
                <button onClick={() => { setShowCaptionFor(null); setCaption('') }} style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: '13px' }}>취소</button>
              </div>
            ) : isOwner && (
              <button onClick={() => { setShowCaptionFor(lightbox.id); setCaption(lightbox.caption || '') }} style={{ background: 'transparent', color: '#F2D49B', border: '1px solid rgba(242,212,155,0.3)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: '13px', fontWeight: 600 }}>
                {lightbox.caption ? '설명 수정' : '설명 추가'}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .memory-overlay:hover { background: rgba(0,0,0,0.3) !important; }
      `}</style>
    </div>
  )
}
