'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '검토 중', color: '#B45309', bg: '#FEF3C7' },
  confirmed: { label: '확정', color: '#15803D', bg: '#DCFCE7' },
  rejected: { label: '거절됨', color: '#B91C1C', bg: '#FEE2E2' },
}

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [instructorRow, setInstructorRow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  const [balance, setBalance] = useState(0)
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('로그인이 필요한 페이지예요')
      router.push('/login')
      return
    }
    setUser(session.user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()

    setProfile(profileData)

    if (profileData?.user_type === 'company') {
      setName(profileData?.name || '')

      const { data: account } = await supabase
        .from('mileage_accounts')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle()
      setBalance(account?.balance || 0)
    }

    if (profileData?.user_type === 'instructor') {
      const { data: instructorData } = await supabase
        .from('instructors')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle()

      setInstructorRow(instructorData)
      // 강사는 instructors 테이블의 이름을 기준으로 보여줌 (강사 목록/상세페이지와 동일한 이름)
      setName(instructorData?.name || profileData?.name || '')

      if (instructorData) {
        const { data: reqs } = await supabase
          .from('requests')
          .select('*')
          .eq('instructor_id', instructorData.id)
          .order('created_at', { ascending: false })
        setReceivedRequests(reqs || [])
      }
    }

    setLoading(false)
  }

  const handleSaveName = async () => {
    if (!user) return
    if (!name.trim()) {
      toast.error('이름을 입력해주세요')
      return
    }
    setSaving(true)

    // profiles 테이블은 항상 갱신
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, name, user_type: profile?.user_type })

    if (profileError) {
      toast.error('저장 실패: ' + profileError.message)
      setSaving(false)
      return
    }

    // 강사 계정이면 instructors 테이블 이름도 같이 갱신 (강사 프로필과 연동)
    if (profile?.user_type === 'instructor' && instructorRow) {
      const { error: instructorError } = await supabase
        .from('instructors')
        .update({ name })
        .eq('id', instructorRow.id)

      if (instructorError) {
        toast.error('강사 프로필 반영 실패: ' + instructorError.message)
        setSaving(false)
        return
      }
    }

    toast.success('저장됐어요! 강사 프로필에도 반영됩니다.')
    fetchAll()
    setSaving(false)
  }

  if (loading) {
    return (
      <main style={{ background: '#F7F8FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#94A3B8' }}>마이페이지 정보를 불러오는 중입니다...</p>
      </main>
    )
  }

  const userType = profile?.user_type
  const statusInfo = (status: string) => STATUS_LABELS[status] || { label: status || '알 수 없음', color: '#475569', bg: '#F1F5F9' }

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', padding: '40px 20px 80px', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
        .save-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.06); }
        .form-input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .form-input:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); outline: none; }
        .request-card { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
        .request-card:hover { box-shadow: 0 8px 20px rgba(15,23,42,0.06); }
        .link-btn { transition: opacity 0.15s ease; }
        .link-btn:hover { opacity: 0.75; }
      `}</style>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#0F172A', letterSpacing: '-0.3px' }}>마이페이지</div>
        <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>계정 정보 및 프로필 상태 관리</div>

        {/* 계정 정보 + 이름 수정 */}
        <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>계정 이메일</span>
            <p style={{ fontSize: '15px', fontWeight: '700', margin: '4px 0 0', color: '#0F172A' }}>{user?.email}</p>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>회원 유형</span>
            <p style={{ fontSize: '15px', fontWeight: '700', margin: '4px 0 0', color: '#0F172A' }}>
              {userType === 'instructor' ? '🎤 강사' : userType === 'company' ? '🏢 기업' : '미설정'}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '18px 0' }} />

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>성함 / 활동명</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
            <button onClick={handleSaveName} disabled={saving} className="save-btn" style={{
              padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700',
              cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, whiteSpace: 'nowrap'
            }}>
              {saving ? '저장 중...' : '💾 저장'}
            </button>
          </div>

          {userType === 'instructor' && (
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '12px' }}>
              {instructorRow
                ? '이 이름은 강사 목록/상세페이지에도 함께 반영돼요. 전문분야·강사료·사진·경력 등은 '
                : '아직 강사 프로필이 등록되지 않았어요. '}
              <Link href="/dashboard/instructor" className="link-btn" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>강사 대시보드</Link>
              {instructorRow ? '에서 수정하세요.' : '에서 먼저 프로필을 등록해주세요.'}
            </p>
          )}
        </div>

        {/* 기업 계정: 마일리지 요약 */}
        {userType === 'company' && (
          <div style={{
            background: 'linear-gradient(135deg, #0B1E4D 0%, #1E3A8A 100%)',
            borderRadius: '16px', padding: '24px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
            boxShadow: '0 12px 30px rgba(30,58,138,0.2)'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', fontWeight: 600 }}>보유 마일리지</div>
              <div style={{ fontSize: '30px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>{balance.toLocaleString()}P</div>
            </div>
            <Link href="/dashboard/company" className="link-btn" style={{
              padding: '10px 18px', background: 'rgba(255,255,255,0.95)', color: '#1E3A8A',
              borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '700'
            }}>
              💰 마일리지 관리하러 가기
            </Link>
          </div>
        )}

        {/* 강사 계정: 받은 강의 의뢰 목록 */}
        {userType === 'instructor' && (
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
              📬 받은 강의 의뢰 {receivedRequests.length > 0 && <span style={{ color: '#2563EB' }}>{receivedRequests.length}건</span>}
            </div>

            {receivedRequests.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '0.5px solid rgba(0,0,0,0.08)', color: '#94A3B8', fontSize: '14px' }}>
                아직 받은 의뢰가 없어요
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {receivedRequests.map(req => {
                  const s = statusInfo(req.status)
                  return (
                    <div key={req.id} className="request-card" style={{
                      background: '#fff', padding: '20px', borderRadius: '14px', border: '0.5px solid rgba(0,0,0,0.08)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: s.color, background: s.bg, padding: '4px 10px', borderRadius: '6px' }}>
                          {s.label}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {req.created_at ? new Date(req.created_at).toLocaleDateString('ko-KR') : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                        {req.title || '(제목 없음)'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                        🏢 {req.company_name} · 담당자 {req.contact_person}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#64748B', flexWrap: 'wrap' }}>
                        {req.schedule && <span>📅 {req.schedule}</span>}
                        {req.budget && <span>💰 {req.budget}</span>}
                        {req.phone && <span>📞 {req.phone}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}