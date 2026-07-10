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

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>강의 의뢰하기</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>교육 조건에 맞는 강사 매칭을 위해 의뢰 내용을 작성해 주세요.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>의뢰 제목 (강의 주제)</label>
            <input type="text" required value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 생성형 AI 활용 생산성 향상 워크숍"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>기업/기관명</label>
              <input type="text" required value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="예: 스케치온"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>담당자 성함</label>
              <input type="text" required value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="예: 김철수 팀장"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>연락처</label>
              <input type="text" required value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-0000-0000"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>이메일</label>
              <input type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@company.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>희망 일정</label>
              <input type="text" required value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="예: 2026년 8월 중 주말"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>예산 범위</label>
              <input type="text" required value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="예: 시간당 50만원"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>상세 의뢰 내용</label>
            <textarea required rows={4} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="교육 대상, 인원, 주요 요구사항 등을 자유롭게 작성해 주세요."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '12px', background: '#2563EB', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer', marginTop: '8px'
          }}>
            {loading ? '등록 중...' : '강의 의뢰 제출하기'}
          </button>
        </form>
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