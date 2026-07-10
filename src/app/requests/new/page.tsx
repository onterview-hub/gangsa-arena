'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewRequestPage() {
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
      // 1. 로그인 유저 확인 (없을 경우 기존 프로필 ID 재사용 임시 처리)
      let targetUserId: string | null = null
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        targetUserId = user.id
      } else {
        const { data: existingProfiles } = await supabase.from('profiles').select('id').limit(1)
        if (existingProfiles && existingProfiles.length > 0) {
          targetUserId = existingProfiles[0].id
        }
      }

      // 2. requests 테이블에 강의 의뢰 데이터 저장
      const { error } = await supabase
        .from('requests')
        .insert({
          client_id: targetUserId,
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
          created_at: new Date().toISOString(),
        })

      if (error) throw error

      alert('강의 의뢰가 성공적으로 등록되었습니다!')
      router.push('/requests')
      router.refresh()
    } catch (err: any) {
      alert(`의뢰 등록 실패: ${err.message || '오류가 발생했습니다. requests 테이블이 생성되어 있는지 확인해 주세요.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>강의 의뢰하기</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>기업/기관의 교육 조건에 맞는 강사 매칭을 위해 의뢰 내용을 작성해 주세요.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>의뢰 제목 (강의 주제)</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 생성형 AI 활용 생산성 향상 워크숍 (3시간)"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>기업/기관명</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="예: 스케치온"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>담당자 성함</label>
              <input
                type="text"
                required
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="예: 김철수 팀장"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>연락처</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-0000-0000"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>이메일</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@company.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>희망 일정</label>
              <input
                type="text"
                required
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="예: 2026년 8월 중 주말"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>예산 범위</label>
              <input
                type="text"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="예: 시간당 50만원"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>상세 의뢰 내용 및 교육 대상</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="교육 대상(예: 신입사원 30명), 주요 요구사항 등을 자유롭게 작성해 주세요."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? '등록 중...' : '강의 의뢰 제출하기'}
          </button>
        </form>
      </div>
    </main>
  )
}