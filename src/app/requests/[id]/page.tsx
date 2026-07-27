'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '검토 중', color: '#B45309', bg: '#FEF3C7' },
  confirmed: { label: '확정', color: '#15803D', bg: '#DCFCE7' },
  rejected: { label: '거절됨', color: '#B91C1C', bg: '#FEE2E2' },
  closed: { label: '마감', color: '#64748B', bg: '#F1F5F9' },
}

function getEffectiveStatus(req: any): string {
  if (req.deadline && (req.status === 'pending' || !req.status)) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(req.deadline)
    if (deadlineDate < today) return 'closed'
  }
  return req.status || 'pending'
}

export default function RequestDetailPage() {
  const params = useParams()
  const id = params?.id
  const supabase = createClient()
  const [request, setRequest] = useState<any>(null)
  const [instructor, setInstructor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [myInstructorId, setMyInstructorId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchRequest()
  }, [id])

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('강의 의뢰 상세 조회 오류:', error)
        setLoading(false)
        return
      }

      setRequest(data)

      if (data?.instructor_id) {
        const { data: instData } = await supabase
          .from('instructors')
          .select('id, name, photo_url, headline, category, fee')
          .eq('id', data.instructor_id)
          .maybeSingle()
        setInstructor(instData)
      }

      // 지금 로그인한 사람이 강사라면, 이 의뢰의 지정 강사 본인인지 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        const { data: myInstructor } = await supabase
          .from('instructors')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle()
        if (myInstructor) setMyInstructorId(myInstructor.id)
      }
    } catch (err) {
      console.error('통신 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: 'confirmed' | 'rejected') => {
    setUpdating(true)
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('상태 변경 실패: ' + error.message)
      setUpdating(false)
      return
    }

    setRequest((prev: any) => ({ ...prev, status: newStatus }))
    toast.success(newStatus === 'confirmed' ? '의뢰를 확정했어요!' : '의뢰를 거절했어요')
    setUpdating(false)
  }

  if (loading) {
    return (
      <main style={{ background: '#F7F8FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#94A3B8' }}>강의 의뢰 정보를 불러오는 중입니다...</p>
      </main>
    )
  }

  if (!request) {
    return (
      <main style={{ background: '#F7F8FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>강의 의뢰 정보를 찾을 수 없습니다.</h2>
        <Link href="/requests" style={{ color: '#2563EB', fontWeight: '700', fontSize: '13.5px', textDecoration: 'none' }}>
          ← 강의 의뢰 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  const effectiveStatus = getEffectiveStatus(request)
  const s = STATUS_LABELS[effectiveStatus] || { label: effectiveStatus || '모집 중', color: '#2563EB', bg: '#EFF6FF' }
  const isImage = request.attachment_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(request.attachment_url)
  const isPending = effectiveStatus === 'pending'
  const isMyRequest = myInstructorId && request.instructor_id === myInstructorId

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
        .link-btn { transition: opacity 0.15s ease; }
        .link-btn:hover { opacity: 0.75; }
        .confirm-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .confirm-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .reject-btn { transition: background 0.15s ease; }
        .reject-btn:hover:not(:disabled) { background: #FEE2E2 !important; }
      `}</style>

      {/* 서브 히어로 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          📋 강의 의뢰 상세
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>
          의뢰 내용을 확인하고 필요한 경우 담당자에게 연락해보세요
        </p>
      </section>

      <div style={{ maxWidth: '720px', margin: '-36px auto 0', padding: '0 20px 60px' }}>
        <Link href="/requests" className="link-btn" style={{ display: 'inline-block', margin: '20px 0 12px', fontSize: '13.5px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          ← 목록으로
        </Link>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 16px 40px rgba(15,23,42,0.12)', border: '1px solid rgba(0,0,0,0.04)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: s.color, background: s.bg, padding: '5px 12px', borderRadius: '8px' }}>
              {s.label}
            </span>
            <span style={{ fontSize: '12.5px', color: '#94A3B8' }}>
              {request.created_at ? new Date(request.created_at).toLocaleDateString('ko-KR') + ' 등록' : ''}
            </span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', lineHeight: 1.4 }}>
            {request.title || '(제목 없음)'}
          </h1>

          {/* 강사 본인에게 지정된 의뢰일 때: 확정/거절 액션 */}
          {isMyRequest && isPending && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1E3A8A', marginBottom: '12px' }}>
                🎯 나에게 지정된 의뢰예요. 확정 또는 거절해주세요.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleUpdateStatus('confirmed')}
                  disabled={updating}
                  className="confirm-btn"
                  style={{
                    flex: 1, padding: '11px', background: 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff',
                    border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700',
                    cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1
                  }}>
                  ✅ 확정하기
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={updating}
                  className="reject-btn"
                  style={{
                    flex: 1, padding: '11px', background: '#fff', color: '#B91C1C',
                    border: '1px solid #FECACA', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700',
                    cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1
                  }}>
                  ❌ 거절하기
                </button>
              </div>
            </div>
          )}

          {/* 지정 강사 카드 */}
          {instructor ? (
            <Link href={`/instructors/${instructor.id}`} style={{
              display: 'flex', gap: '14px', alignItems: 'center', textDecoration: 'none',
              background: 'linear-gradient(135deg, #0B1E4D 0%, #1E3A8A 100%)',
              padding: '18px', borderRadius: '14px', marginBottom: '24px'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                background: instructor.photo_url ? `url(${instructor.photo_url}) center/cover` : 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: '700', color: '#fff', border: '2px solid rgba(255,255,255,0.3)'
              }}>
                {!instructor.photo_url && (instructor.name?.[0] || '?')}
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#fff' }}>🎯 {instructor.name} 강사에게 지정된 의뢰</div>
                <div style={{ fontSize: '12px', color: 'rgba(226,232,255,0.8)', marginTop: '2px' }}>{instructor.headline || '프로필 보러가기 →'}</div>
              </div>
            </Link>
          ) : (
            <div style={{ background: '#F1F5F9', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
              🌐 특정 강사를 지정하지 않은 전체 공개 의뢰예요
            </div>
          )}

          {/* 조건 정보 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', background: '#F8FAFC', padding: '18px', borderRadius: '14px', marginBottom: '24px', fontSize: '13.5px', color: '#334155' }}>
            <div>📅 <strong>희망 일정:</strong> {request.schedule || '협의'}</div>
            <div>💰 <strong>예산 범위:</strong> {request.budget || '협의'}</div>
            {request.deadline && (
              <div style={{ color: effectiveStatus === 'closed' ? '#EF4444' : '#334155', fontWeight: effectiveStatus === 'closed' ? 700 : 400 }}>
                ⏰ <strong>지원 마감일:</strong> {request.deadline} {effectiveStatus === 'closed' && '(마감됨)'}
              </div>
            )}
          </div>

          {/* 첨부파일 */}
          {request.attachment_url && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>첨부파일</h3>
              {isImage ? (
                <a href={request.attachment_url} target="_blank" rel="noopener noreferrer">
                  <img src={request.attachment_url} alt={request.attachment_name || '첨부 이미지'}
                    style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                </a>
              ) : (
                <a href={request.attachment_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  background: '#EFF6FF', color: '#2563EB', borderRadius: '10px', textDecoration: 'none',
                  fontSize: '13.5px', fontWeight: 700
                }}>
                  📄 {request.attachment_name || '첨부파일 다운로드'}
                </a>
              )}
            </div>
          )}

          {/* 상세 내용 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>상세 요청 내용</h3>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {request.description || '상세 내용이 작성되지 않았습니다.'}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '24px 0' }} />

          {/* 담당자 연락처 */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>의뢰 기업 / 담당자 정보</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13.5px', color: '#334155' }}>
              <div>🏢 <strong>기업명:</strong> {request.company_name || '미상'}</div>
              <div>👤 <strong>담당자:</strong> {request.contact_person || '미상'}</div>
              <div>📞 <strong>연락처:</strong> {request.phone || '미기재'}</div>
              <div>✉️ <strong>이메일:</strong> {request.email || '미기재'}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}