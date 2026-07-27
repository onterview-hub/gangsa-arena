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
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // 비밀번호 변경 관련
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  // 회원탈퇴 관련
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

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

      if (session.user.email) {
        const { data: sent } = await supabase
          .from('requests')
          .select('*')
          .eq('email', session.user.email)
          .order('created_at', { ascending: false })
        setSentRequests(sent || [])
      }
    }

    if (profileData?.user_type === 'instructor') {
      const { data: instructorData } = await supabase
        .from('instructors')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle()

      setInstructorRow(instructorData)
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

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, name, user_type: profile?.user_type })

    if (profileError) {
      toast.error('저장 실패: ' + profileError.message)
      setSaving(false)
      return
    }

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

  const handleUpdateRequestStatus = async (reqId: string, newStatus: 'confirmed' | 'rejected') => {
    setUpdatingId(reqId)
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', reqId)

    if (error) {
      toast.error('상태 변경 실패: ' + error.message)
      setUpdatingId(null)
      return
    }

    setReceivedRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r))
    toast.success(newStatus === 'confirmed' ? '의뢰를 확정했어요!' : '의뢰를 거절했어요')
    setUpdatingId(null)
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !newPassword2) {
      toast.error('모든 항목을 입력해주세요')
      return
    }
    if (newPassword.length < 6) {
      toast.error('새 비밀번호는 6자 이상이어야 해요')
      return
    }
    if (newPassword !== newPassword2) {
      toast.error('새 비밀번호가 일치하지 않아요')
      return
    }

    setChangingPw(true)

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    })

    if (reauthError) {
      toast.error('현재 비밀번호가 올바르지 않아요')
      setChangingPw(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      toast.error('비밀번호 변경 실패: ' + updateError.message)
      setChangingPw(false)
      return
    }

    toast.success('비밀번호가 변경됐어요!')
    setOldPassword('')
    setNewPassword('')
    setNewPassword2('')
    setChangingPw(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '회원탈퇴') {
      toast.error('"회원탈퇴"를 정확히 입력해주세요')
      return
    }

    setDeleting(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('세션이 만료됐어요. 다시 로그인해주세요.')
      setDeleting(false)
      return
    }

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || '탈퇴 처리 중 오류가 발생했어요')
        setDeleting(false)
        return
      }

      toast.success('탈퇴 처리가 완료됐어요. 이용해주셔서 감사합니다.')
      await supabase.auth.signOut()
      setTimeout(() => router.push('/'), 1200)
    } catch (e: any) {
      toast.error('탈퇴 처리 중 오류가 발생했어요: ' + e.message)
      setDeleting(false)
    }
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
  const hasEmailAuth = user?.identities?.some((i: any) => i.provider === 'email')

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
        .danger-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .danger-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .confirm-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .confirm-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .reject-btn { transition: background 0.15s ease; }
        .reject-btn:hover:not(:disabled) { background: #FEE2E2 !important; }
      `}</style>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#0F172A', letterSpacing: '-0.3px' }}>마이페이지</div>
        <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>계정 정보 및 프로필 상태 관리</div>

        {/* 강사 프로필 요약 카드 */}
        {userType === 'instructor' && instructorRow && (
          <div style={{
            background: 'linear-gradient(135deg, #0B1E4D 0%, #1E3A8A 100%)',
            borderRadius: '18px', padding: '26px', marginBottom: '20px',
            boxShadow: '0 12px 30px rgba(30,58,138,0.2)'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
                background: instructorRow.photo_url ? `url(${instructorRow.photo_url}) center/cover` : 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: '700', color: '#fff', border: '2px solid rgba(255,255,255,0.3)'
              }}>
                {!instructorRow.photo_url && (instructorRow.name?.[0] || '?')}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{instructorRow.name} 강사</div>
                <div style={{ fontSize: '12.5px', color: 'rgba(226,232,255,0.8)', marginTop: '2px' }}>{instructorRow.headline || '한 줄 소개가 없어요'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {instructorRow.category && instructorRow.category.split(',').map((c: string) => c.trim()).filter(Boolean).map((c: string) => (
                <span key={c} style={{ fontSize: '11.5px', color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>{c}</span>
              ))}
              <span style={{ fontSize: '11.5px', color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>💰 {instructorRow.fee || '협의'}</span>
            </div>
            <Link href={`/instructors/${instructorRow.id}`} className="link-btn" style={{
              display: 'inline-block', marginTop: '16px', fontSize: '12.5px', color: '#fff',
              textDecoration: 'underline', fontWeight: 600
            }}>
              내 공개 프로필 보기 →
            </Link>
          </div>
        )}

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

        {/* 계정보안 */}
        <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '18px' }}>🔒 계정보안</div>

          {hasEmailAuth ? (
            <>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>비밀번호 변경</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                <input type="password" className="form-input" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 (6자 이상)"
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                <input type="password" className="form-input" value={newPassword2} onChange={e => setNewPassword2(e.target.value)}
                  placeholder="새 비밀번호 확인"
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <button onClick={handleChangePassword} disabled={changingPw} className="save-btn" style={{
                padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700',
                cursor: changingPw ? 'default' : 'pointer', opacity: changingPw ? 0.7 : 1
              }}>
                {changingPw ? '변경 중...' : '비밀번호 변경'}
              </button>
            </>
          ) : (
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>
              소셜 로그인(카카오/네이버)으로 가입된 계정은 별도 비밀번호가 없어요.
            </p>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '22px 0 18px' }} />

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>회원탈퇴</label>
          <p style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '12px' }}>
            탈퇴 시 계정, 프로필, 강사 정보(해당 시)가 모두 삭제되며 되돌릴 수 없어요.
          </p>
          <button onClick={() => setShowDeleteModal(true)} className="danger-btn" style={{
            padding: '10px 20px', background: '#FEE2E2', color: '#B91C1C',
            border: '1px solid #FECACA', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700',
            cursor: 'pointer'
          }}>
            회원탈퇴 신청
          </button>
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
                  const isPending = !req.status || req.status === 'pending'
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
                      <Link href={`/requests/${req.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                          {req.title || '(제목 없음)'}
                        </div>
                      </Link>
                      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                        🏢 {req.company_name} · 담당자 {req.contact_person}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#64748B', flexWrap: 'wrap', marginBottom: isPending ? '14px' : 0 }}>
                        {req.schedule && <span>📅 {req.schedule}</span>}
                        {req.budget && <span>💰 {req.budget}</span>}
                        {req.phone && <span>📞 {req.phone}</span>}
                      </div>

                      {isPending && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'confirmed')}
                            disabled={updatingId === req.id}
                            className="confirm-btn"
                            style={{
                              flex: 1, padding: '9px', background: 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff',
                              border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700',
                              cursor: updatingId === req.id ? 'default' : 'pointer', opacity: updatingId === req.id ? 0.6 : 1
                            }}>
                            ✅ 확정하기
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                            disabled={updatingId === req.id}
                            className="reject-btn"
                            style={{
                              flex: 1, padding: '9px', background: '#F8FAFC', color: '#B91C1C',
                              border: '1px solid #FECACA', borderRadius: '9px', fontSize: '13px', fontWeight: '700',
                              cursor: updatingId === req.id ? 'default' : 'pointer', opacity: updatingId === req.id ? 0.6 : 1
                            }}>
                            ❌ 거절하기
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 기업 계정: 내가 보낸 강의 의뢰 목록 */}
        {userType === 'company' && (
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
              📤 내가 보낸 강의 의뢰 {sentRequests.length > 0 && <span style={{ color: '#2563EB' }}>{sentRequests.length}건</span>}
            </div>

            {sentRequests.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '0.5px solid rgba(0,0,0,0.08)', color: '#94A3B8', fontSize: '14px' }}>
                <div style={{ marginBottom: '10px' }}>아직 보낸 의뢰가 없어요</div>
                <Link href="/requests/new" className="link-btn" style={{ color: '#2563EB', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                  강의 의뢰 등록하러 가기 →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sentRequests.map(req => {
                  const s = statusInfo(req.status)
                  return (
                    <Link href={`/requests/${req.id}`} key={req.id} className="request-card" style={{
                      display: 'block', background: '#fff', padding: '20px', borderRadius: '14px', border: '0.5px solid rgba(0,0,0,0.08)', textDecoration: 'none'
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
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#64748B', flexWrap: 'wrap' }}>
                        {req.schedule && <span>📅 {req.schedule}</span>}
                        {req.budget && <span>💰 {req.budget}</span>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', maxWidth: '400px', width: '100%' }}>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>정말 탈퇴하시겠어요?</div>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '18px', lineHeight: 1.5 }}>
              계정, 프로필, 강사 정보(해당 시)가 모두 삭제되며 <b>되돌릴 수 없습니다</b>.<br />
              계속하시려면 아래에 <b>회원탈퇴</b>라고 입력해주세요.
            </p>
            <input type="text" className="form-input" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="회원탈퇴"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }} style={{
                flex: 1, padding: '10px', background: '#F1F5F9', color: '#334155',
                border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer'
              }}>
                취소
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting} className="danger-btn" style={{
                flex: 1, padding: '10px', background: '#DC2626', color: '#fff',
                border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700',
                cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.7 : 1
              }}>
                {deleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}