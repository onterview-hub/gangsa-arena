'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

const SPECIALTIES = ['AI', '취업', '면접', '챗GPT', '리더십', '진로', '마케팅', '안전·보건']
const FEE_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '협의', label: '협의' },
  { value: '5만원 이상', label: '시간당 5만원 이상' },
  { value: '10만원 이상', label: '시간당 10만원 이상' },
  { value: '15만원 이상', label: '시간당 15만원 이상' },
  { value: '20만원 이상', label: '시간당 20만원 이상' },
  { value: '50만원 이상', label: '시간당 50만원 이상' },
]

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function InstructorDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    headline: '',
    fee: '',
    experience: '',
    photo_url: '',
    profile_file_url: '',
    profile_file_name: '',
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
        email: data.email || '',
        phone: data.phone || '',
        headline: data.headline || '',
        fee: data.fee || '',
        experience: data.experience || '',
        photo_url: data.photo_url || '',
        profile_file_url: data.profile_file_url || '',
        profile_file_name: data.profile_file_name || '',
      })
      setSelectedSpecs(data.category ? data.category.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
    } else {
      setForm(f => ({ ...f, email: user.email || '' }))
    }
    setLoading(false)
  }

  const toggleSpec = (s: string) => {
    setSelectedSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_PHOTO_SIZE) {
      toast.error('사진 용량은 5MB 이하만 가능해요')
      e.target.value = ''
      return
    }

    setUploadingPhoto(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingPhoto(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('instructor-photos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('사진 업로드 실패: ' + uploadError.message)
      setUploadingPhoto(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('instructor-photos').getPublicUrl(path)
    setForm(f => ({ ...f, photo_url: publicUrlData.publicUrl }))
    toast.success('사진이 업로드됐어요!')
    setUploadingPhoto(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 용량은 10MB 이하만 가능해요')
      e.target.value = ''
      return
    }

    setUploadingFile(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingFile(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('instructor-files')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('파일 업로드 실패: ' + uploadError.message)
      setUploadingFile(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('instructor-files').getPublicUrl(path)
    setForm(f => ({ ...f, profile_file_url: publicUrlData.publicUrl, profile_file_name: file.name }))
    toast.success('파일이 업로드됐어요!')
    setUploadingFile(false)
  }

  const handleSave = async () => {
    if (!form.name || !form.headline) {
      toast.error('이름과 한 줄 소개는 필수예요')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { ...form, category: selectedSpecs.join(', ') }

    if (profile) {
      const { error } = await supabase
        .from('instructors')
        .update(payload)
        .eq('id', profile.id)
      if (error) { toast.error('저장 실패: ' + error.message) }
      else { toast.success('프로필이 저장됐어요!'); loadProfile() }
    } else {
      const { error } = await supabase
        .from('instructors')
        .insert([{ ...payload, is_active: true, is_premium: false }])
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

        .side-item { transition: background 0.15s ease, color 0.15s ease; }
        .side-item:hover { background: #F1F5F9; }
        .form-input { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .form-input:focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          outline: none;
        }
        .save-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.06); }
        .preview-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .preview-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(15,23,42,0.10); }
        .spec-chip { transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; cursor: pointer; }
        .spec-chip:hover { border-color: #2563EB !important; }
        .photo-upload-btn { transition: background 0.15s ease; cursor: pointer; }
        .photo-upload-btn:hover { background: #EFF6FF !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
        {/* 사이드바 */}
        <div style={{ width: '210px', background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.08)', padding: '24px 0', flexShrink: 0 }}>
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
        <div style={{ flex: 1, padding: '32px', maxWidth: '900px' }}>

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#0F172A', letterSpacing: '-0.3px' }}>내 프로필</div>
              <div style={{ fontSize: '13px', color: profile ? '#64748B' : '#DC2626', fontWeight: profile ? 400 : 600, marginBottom: '24px' }}>
                {profile ? '프로필을 수정하세요' : '⚠️ 아직 프로필이 없어요. 등록해주세요!'}
              </div>

              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '28px', maxWidth: '640px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

                {/* 사진 업로드 */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#334155' }}>프로필 사진</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                      background: form.photo_url ? `url(${form.photo_url}) center/cover` : 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px', fontWeight: '700', color: '#fff'
                    }}>
                      {!form.photo_url && (form.name?.[0] || '?')}
                    </div>
                    <label className="photo-upload-btn" style={{
                      padding: '9px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#334155'
                    }}>
                      {uploadingPhoto ? '업로드 중...' : '📷 사진 선택'}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>5MB 이하</span>
                  </div>
                </div>

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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>이메일</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="example@email.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#334155' }}>전문분야 (선택)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SPECIALTIES.map(s => (
                      <div key={s} className="spec-chip" onClick={() => toggleSpec(s)} style={{
                        padding: '7px 14px', borderRadius: '20px', fontSize: '13px',
                        border: selectedSpecs.includes(s) ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                        background: selectedSpecs.includes(s) ? '#EFF6FF' : '#fff',
                        color: selectedSpecs.includes(s) ? '#2563EB' : '#64748B',
                        fontWeight: selectedSpecs.includes(s) ? 700 : 500
                      }}>
                        {selectedSpecs.includes(s) ? '✓ ' : ''}{s}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>한 줄 소개 *</label>
                  <input type="text" className="form-input" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })}
                    placeholder="전문 강사 한 줄 소개"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>강사료 (시간당)</label>
                  <select className="form-input" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box', background: '#fff' }}>
                    {FEE_OPTIONS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>경력 및 강의 이력</label>
                  <textarea className="form-input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                    rows={5} placeholder="주요 출강 기관, 강의 주제, 경력 등"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                {/* 프로필 첨부파일 */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#334155' }}>프로필 첨부파일 (이력서 등)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <label className="photo-upload-btn" style={{
                      padding: '9px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#334155'
                    }}>
                      {uploadingFile ? '업로드 중...' : '📎 파일 선택'}
                      <input type="file" onChange={handleFileUpload} disabled={uploadingFile} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>10MB 이하</span>
                    {form.profile_file_name && (
                      <span style={{ fontSize: '12.5px', color: '#2563EB', fontWeight: 600 }}>
                        📄 {form.profile_file_name}
                      </span>
                    )}
                  </div>
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
                        background: form.photo_url ? `url(${form.photo_url}) center/cover` : 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: '700', color: '#fff'
                      }}>
                        {!form.photo_url && (profile.name?.[0] || '?')}
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