import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * ImageUpload — 단일 이미지 업로드 컴포넌트
 *
 * Props:
 *   currentUrl   : 현재 이미지 URL (없으면 null)
 *   storagePath  : 업로드 경로 예) `profiles/${spaceId}`
 *   onUploaded   : (url: string) => void  — 업로드 완료 후 콜백
 *   label        : 버튼 레이블 (기본: '사진 업로드')
 *   shape        : 'circle' | 'rect' (기본: 'circle')
 *   size         : 픽셀 수 (기본: 100)
 */
export default function ImageUpload({
  currentUrl = null,
  storagePath,
  onUploaded,
  label = '사진 업로드',
  shape = 'circle',
  size = 100,
}) {
  const [preview, setPreview] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)

  const BUCKET = 'stage2-uploads'
  const MAX_MB = 10
  const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    await upload(file)
    // input 초기화 (같은 파일 재선택 가능하게)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) await upload(file)
  }

  const upload = async (file) => {
    setError('')

    // 유효성 검사
    if (!ALLOWED.includes(file.type)) {
      setError('JPG, PNG, WebP, GIF 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_MB}MB 이하여야 합니다.`)
      return
    }

    // 미리보기
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)
    setProgress(10)

    try {
      // 확장자 추출
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
      // 타임스탬프로 캐시 무효화
      const filePath = `${storagePath}/${Date.now()}.${ext}`

      setProgress(30)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      setProgress(80)

      // Public URL 획득
      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath)

      setProgress(100)
      setPreview(data.publicUrl)
      onUploaded?.(data.publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(`업로드 실패: ${err.message}`)
      setPreview(currentUrl) // 원래 이미지로 복원
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 600)
    }
  }

  const isCircle = shape === 'circle'
  const borderRadius = isCircle ? '50%' : '12px'

  return (
    <div style={{ display: 'inline-block' }}>
      {/* 이미지 영역 */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius,
          border: '2px dashed rgba(242,212,155,0.4)',
          background: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: uploading ? 'wait' : 'pointer',
          position: 'relative',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor = '#F2D49B')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(242,212,155,0.4)')}
      >
        {/* 현재 이미지 */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        )}

        {/* 업로드 중 오버레이 */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '6px',
            zIndex: 2,
          }}>
            <div style={{
              width: '24px', height: '24px',
              border: '2px solid rgba(242,212,155,0.3)',
              borderTopColor: '#F2D49B',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', color: '#F2D49B' }}>
              {progress}%
            </span>
          </div>
        )}

        {/* 빈 상태 — 업로드 아이콘 */}
        {!preview && !uploading && (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div style={{ fontSize: `${size * 0.3}px`, opacity: 0.4, lineHeight: 1 }}>📷</div>
            {size >= 80 && (
              <div style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                클릭
              </div>
            )}
          </div>
        )}

        {/* 호버 오버레이 (이미지 있을 때) */}
        {preview && !uploading && (
          <div className="img-hover-overlay" style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
            zIndex: 1,
          }}>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0)', transition: 'color 0.2s' }}>
              변경
            </span>
          </div>
        )}
      </div>

      {/* 업로드 레이블 버튼 */}
      {label && (
        <button
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'block',
            marginTop: '10px',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: uploading ? 'rgba(255,255,255,0.3)' : '#F2D49B',
            background: 'transparent',
            border: 'none',
            cursor: uploading ? 'wait' : 'pointer',
            padding: 0,
            textAlign: 'center',
            width: `${size}px`,
            letterSpacing: '0.02em',
          }}
        >
          {uploading ? '업로드 중...' : label}
        </button>
      )}

      {/* 오류 메시지 */}
      {error && (
        <p style={{
          fontFamily: 'Pretendard, sans-serif', fontSize: '11px',
          color: 'rgb(252,165,165)', marginTop: '6px',
          width: `${Math.max(size, 160)}px`, lineHeight: 1.4,
        }}>
          {error}
        </p>
      )}

      {/* 숨겨진 파일 인풋 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .img-hover-overlay:hover {
          background: rgba(0,0,0,0.5) !important;
        }
        .img-hover-overlay:hover span {
          color: rgba(255,255,255,0.9) !important;
        }
      `}</style>
    </div>
  )
}
