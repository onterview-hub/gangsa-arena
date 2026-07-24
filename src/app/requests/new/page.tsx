'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function NewRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetInstructorId = searchParams.get('instructor_id')
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    schedule: '',
    budget: '',
    description: '',
  })

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
          status: 'pending',
        })
      if (error) throw error
      router.push('/requests')
      router.refresh()
    } catch (err: any) {
      console.error('의뢰 등록 실패:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }
  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box' as const }

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', paddingBottom: '60px', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
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
              <label style={labelStyle}>상세 의뢰 내용</label>
              <textarea required rows={5} className="form-input" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="교육 대상, 인원, 주요 요구사항 등을 자유롭게 작성해 주세요."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <button type="submit" disabled={loading} className="submit-btn" style={{
              padding: '13px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
              border: 'none', borderRadius: '12px', fontSize: '14.5px',
              fontWeight: '700', cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '4px'
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