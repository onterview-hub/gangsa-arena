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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: '#94A3B8' }}>로딩 중...</div>
    </div>
  )

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .side-item {
          transition: background 0.15s ease, color 0.15s ease;
        }
        .side-item:hover {
          background: #F1F5F9;
        }
        .form-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .form-input:focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          outline: none;
        }
        .save-btn {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }
        .preview-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .preview-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(15,23,42,0.10);
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* 사이드바 */}
        <div style={{
          width: '210px', background: '#fff',
          borderRight: '0.5px solid rgba(0,0,0,0.08)',
          padding: '24px 0', flexShrink: 0
        }}>
          <div style={{ padding: '0 20px 16px', fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            강사 대시보드
          </div>
          <div className="side-item" onClick={() => setActiveTab('profile')} style={{
            padding: '11px 20px', fontSize: '13.5px', cursor: 'pointer',
            color: activeTab === 'profile' ? '#2563EB' : '#475569',
            background: activeTab === 'profile' ? '#EFF6FF' : 'transparent',
            borderLeft: activeTab === 'profile' ? '3px solid #2563EB' : '3px solid transparent',
            fontWeight: activeTab === 'profile' ? '700' : '500'
          }}>👤 내 프로필</div>
          <div className="side-item" onClick={() => setActiveTab('preview')} style={{
            padding: '11px 20px', fontSize: '13.5px', cursor: 'pointer',
            color: activeTab === 'preview' ? '#2563EB' : '#475569',
            background: activeTab === 'preview' ? '#EFF6FF' : 'transparent',
            borderLeft: activeTab === 'preview' ? '3px solid #2563EB' : '3px solid transparent',
            fontWeight: activeTab === 'preview' ? '700' : '500'
          }}>👁️ 미리보기</div>
          <Link href="/instructors" className="side-item" style={{
            padding: '11px 20px', fontSize: '13.5px', cursor: 'pointer',
            color: '#475569', display: 'block', textDecoration: 'none',
            borderLeft: '3px solid transparent', fontWeight: 500
          }}>🔍 강사 목록</Link>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, padding: '32px' }}>

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#0F172A', letterSpacing: '-0.3px' }}>내 프로필</div>
              <div style={{ fontSize: '13px', color: profile ? '#64748B' : '#DC2626', fontWeight: profile ? 400 : 600, marginBottom: '24px' }}>
                {profile ? '프로필을 수정하세요' : '⚠️ 아직 프로필이 없어요. 등록해주세요!'}
              </div>

              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '28px', maxWidth: '600px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>이름 *</label>
                    <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="홍길동"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>연락처</label>
                    <input type="text" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>전문분야 *</label>
                  <input type="text" className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    placeholder="AI, 취업, 리더십 등"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>한 줄 소개 *</label>
                  <input type="text" className="form-input" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })}
                    placeholder="전문 강사 한 줄 소개"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>강사료</label>
                  <input type="text" className="form-input" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })}
                    placeholder="협의 가능 / 시간당 50만원 등"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>경력 및 강의 이력</label>
                  <textarea className="form-input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                    rows={5} placeholder="주요 출강 기관, 강의 주제, 경력 등"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                <button onClick={handleSave} disabled={saving} className="save-btn" style={{
                  padding: '12px 26px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '700', cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}>
                  {saving ? '저장 중...' : profile ? '💾 수정 저장' : '✅ 프로필 등록'}
                </button>
              </div>
            </div>
          )}

          {/* 미리보기 탭 */}
          {activeTab === 'preview' && (
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#0F172A', letterSpacing: '-0.3px' }}>내 프로필 미리보기</div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>강사 목록에서 이렇게 보여요</div>

              {profile ? (
                <div style={{ maxWidth: '380px' }}>
                  <div className="preview-card" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#fff'
                      }}>
                        {profile.name?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>{profile.name} 강사</div>
                        <div style={{ fontSize: '11px', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: 700 }}>
                          {profile.category}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: 1.5 }}>{profile.headline}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>💰 {profile.fee || '협의'}</div>
                  </div>
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <Link href={`/instructors/${profile.id}`} style={{
                      color: '#2563EB', fontSize: '13px', textDecoration: 'none', fontWeight: 700
                    }}>
                      상세 페이지 보기 →
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '14px', background: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '0.5px solid rgba(0,0,0,0.08)' }}>
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