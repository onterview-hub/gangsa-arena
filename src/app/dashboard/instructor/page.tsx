'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function InstructorDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({
    name: '',
    category: '',
    headline: '',
    experience: '',
    fee: '',
    phone: '',
    email: '',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('instructors')
      .select('*')
      .eq('email', user.email)
      .single()

    if (data) {
      setProfile(data)
      setForm({
        name: data.name || '',
        category: data.category || '',
        headline: data.headline || '',
        experience: data.experience || '',
        fee: data.fee || '',
        phone: data.phone || '',
        email: data.email || '',
      })
    } else {
      setForm(f => ({ ...f, email: user.email || '' }))
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (profile) {
      const { error } = await supabase
        .from('instructors')
        .update(form)
        .eq('id', profile.id)
      if (error) { toast.error('저장 실패: ' + error.message) }
      else { toast.success('프로필이 저장됐어요!'); loadProfile() }
    } else {
      const { error } = await supabase
        .from('instructors')
        .insert([{ ...form, is_active: true, is_premium: false }])
      if (error) { toast.error('저장 실패: ' + error.message) }
      else { toast.success('프로필이 등록됐어요!'); loadProfile() }
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('로그아웃했어요')
    setTimeout(() => router.push('/'), 800)
  }

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: '10px 16px', fontSize: '13px', cursor: 'pointer',
    color: activeTab === tab ? '#2563EB' : '#475569',
    fontWeight: activeTab === tab ? '500' : '400',
    background: 'none', border: 'none',
    borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: '#94A3B8' }}>로딩 중...</div>
    </div>
  )

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="bottom-right" />

      {/* 헤더 */}
      <header style={{
        background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        padding: '0 20px', height: '56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}>
          강사아레나
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#475569' }}>{form.name || '강사'} 님</span>
          <button onClick={handleLogout} style={{
            padding: '6px 14px', background: '#fff',
            border: '0.5px solid rgba(0,0,0,0.18)',
            borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
          }}>로그아웃</button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        {/* 사이드바 */}
        <div style={{
          width: '200px', background: '#fff',
          borderRight: '0.5px solid rgba(0,0,0,0.1)',
          padding: '20px 0', flexShrink: 0
        }}>
          <div onClick={() => setActiveTab('profile')} style={{
            padding: '10px 20px', fontSize: '13px', cursor: 'pointer',
            color: activeTab === 'profile' ? '#2563EB' : '#475569',
            background: activeTab === 'profile' ? '#EFF6FF' : 'transparent',
            borderLeft: activeTab === 'profile' ? '2px solid #2563EB' : '2px solid transparent',
            fontWeight: activeTab === 'profile' ? '500' : '400'
          }}>👤 내 프로필</div>
          <div onClick={() => setActiveTab('preview')} style={{
            padding: '10px 20px', fontSize: '13px', cursor: 'pointer',
            color: activeTab === 'preview' ? '#2563EB' : '#475569',
            background: activeTab === 'preview' ? '#EFF6FF' : 'transparent',
            borderLeft: activeTab === 'preview' ? '2px solid #2563EB' : '2px solid transparent',
            fontWeight: activeTab === 'preview' ? '500' : '400'
          }}>👁️ 미리보기</div>
          <Link href="/instructors" style={{
            padding: '10px 20px', fontSize: '13px', cursor: 'pointer',
            color: '#475569', display: 'block', textDecoration: 'none',
            borderLeft: '2px solid transparent'
          }}>🔍 강사 목록</Link>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, padding: '28px' }}>

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>내 프로필</div>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>
                {profile ? '프로필을 수정하세요' : '⚠️ 아직 프로필이 없어요. 등록해주세요!'}
              </div>

              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '24px', maxWidth: '600px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>이름 *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="홍길동"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>연락처</label>
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>전문분야 *</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    placeholder="AI, 취업, 리더십 등"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>한 줄 소개 *</label>
                  <input type="text" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })}
                    placeholder="전문 강사 한 줄 소개"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>강사료</label>
                  <input type="text" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })}
                    placeholder="협의 가능 / 시간당 50만원 등"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>경력 및 강의 이력</label>
                  <textarea value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                    rows={5} placeholder="주요 출강 기관, 강의 주제, 경력 등"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                <button onClick={handleSave} disabled={saving} style={{
                  padding: '12px 24px', background: '#2563EB', color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer'
                }}>
                  {saving ? '저장 중...' : profile ? '💾 수정 저장' : '✅ 프로필 등록'}
                </button>
              </div>
            </div>
          )}

          {/* 미리보기 탭 */}
          {activeTab === 'preview' && (
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>내 프로필 미리보기</div>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>강사 목록에서 이렇게 보여요</div>

              {profile ? (
                <div style={{ maxWidth: '400px' }}>
                  <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: '#EFF6FF', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#2563EB'
                      }}>
                        {profile.name?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '700' }}>{profile.name}</div>
                        <div style={{ fontSize: '12px', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '4px' }}>
                          {profile.category}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>{profile.headline}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>💰 {profile.fee || '협의'}</div>
                  </div>
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <Link href={`/instructors/${profile.id}`} style={{
                      color: '#2563EB', fontSize: '13px', textDecoration: 'none'
                    }}>
                      상세 페이지 보기 →
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '14px' }}>
                  프로필을 먼저 등록해주세요
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}