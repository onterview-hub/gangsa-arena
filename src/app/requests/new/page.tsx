'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function NewRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetInstructorId = searchParams.get('instructor_id')
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    schedule: '',
    budget: '',
    description: '',
    deadline: '',
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 용량은 10MB 이하만 가능해요')
      e.target.value = ''
      return
    }

    setUploadingFile(true)
    try {
      const ext = file.name.split('.').pop()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${Date.now()}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('request-files')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('request-files').getPublicUrl(path)
      setAttachment({ url: publicUrlData.publicUrl, name: file.name })
      toast.success('파일이 첨부됐어요!')
    } catch (err: any) {
      toast.error('파일 업로드 실패: ' + err.message)
    } finally {
      setUploadingFile(false)
    }
  }

  const removeAttachment = () => setAttachment(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('requests')
        .insert({
          instructor_id: targetInstructorId || null,
          title: formData.title,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          phone: formData.phone,
          email: formData.email,
          schedule: formData.schedule,
          budget: formData.budget,
          description: formData.description,
          deadline: formData.deadline || null,
          attachment_url: attachment?.url || null,
          attachment_name: attachment?.name || null,
          status: 'pending',
        })
      if (error) throw error
      router.push('/requests')
      router.refresh()
    } catch (err: any) {
      console.error('의뢰 등록 실패:', err.message)
      toast.error('등록 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' as const }

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', paddingBottom: '60px', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .form-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .form-input:focus {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          outline: none;
        }
        .submit-btn:not(:disabled) {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }
        .file-upload-btn { transition: background 0.15s ease; cursor: pointer; }
        .file-upload-btn:hover { background: #EFF6FF !important; }
      `}</style>

      {/* 서브 히어로 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          📋 강의 의뢰하기
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>
          교육 조건에 맞는 강사 매칭을 위해 의뢰 내용을 작성해 주세요
        </p>
      </section>

      <div style={{ maxWidth: '640px', margin: '-36px auto 0', padding: '0 20px' }}>
        <div style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 16px 40px rgba(15,23,42,0.12)', border: '1px solid rgba(0,0,0,0.04)' }}>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>의뢰 제목 (강의 주제)</label>
              <input type="text" required className="form-input" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 생성형 AI 활용 생산성 향상 워크숍"
                style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>기업/기관명</label>
                <input type="text" required className="form-input" value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="예: 스케치온"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>담당자 성함</label>
                <input type="text" required className="form-input" value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="예: 김철수 팀장"
                  style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>연락처</label>
                <input type="text" required className="form-input" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>이메일</label>
                <input type="email" required className="form-input" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@company.com"
                  style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>희망 일정</label>
                <input type="text" required className="form-input" value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="예: 2026년 8월 중 주말"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>예산 범위</label>
                <input type="text" required className="form-input" value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="예: 시간당 50만원"
                  style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>지원 마감일 (선택)</label>
              <input type="date" className="form-input" value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                style={inputStyle} />
              <p style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '6px' }}>
                날짜를 지정하면 마감일이 지난 후 목록에 자동으로 "마감"으로 표시돼요.
              </p>
            </div>

            <div>
              <label style={labelStyle}>상세 의뢰 내용</label>
              <textarea required rows={5} className="form-input" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="교육 대상, 인원, 주요 요구사항 등을 자유롭게 작성해 주세요."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={labelStyle}>첨부파일 (이미지/문서, 선택)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label className="file-upload-btn" style={{
                  padding: '9px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                  borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#334155'
                }}>
                  {uploadingFile ? '업로드 중...' : '📎 파일 선택'}
                  <input type="file" accept="image/*,.pdf,.doc,.docx,.hwp,.ppt,.pptx"
                    onChange={handleFileChange} disabled={uploadingFile} style={{ display: 'none' }} />
                </label>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>10MB 이하</span>
                {attachment && (
                  <span style={{ fontSize: '12.5px', color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📄 {attachment.name}
                    <button type="button" onClick={removeAttachment} style={{
                      border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700
                    }}>취소</button>
                  </span>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading || uploadingFile} className="submit-btn" style={{
              padding: '13px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '14.5px',
              fontWeight: '700', cursor: (loading || uploadingFile) ? 'default' : 'pointer',
              opacity: (loading || uploadingFile) ? 0.7 : 1, marginTop: '4px'
            }}>
              {loading ? '등록 중...' : '📋 강의 의뢰 제출하기'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>로딩 중...</div>}>
      <NewRequestForm />
    </Suspense>
  )
}