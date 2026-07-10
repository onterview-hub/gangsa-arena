'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RequestDetailPage() {
  const params = useParams()
  const id = params?.id
  const supabase = createClient()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('강의 의뢰 상세 조회 오류:', error)
        } else {
          setRequest(data)
        }
      } catch (err) {
        console.error('통신 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [id, supabase])

  if (loading) {
    return (
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748B' }}>강의 의뢰 정보를 불러오는 중입니다...</p>
      </main>
    )
  }

  if (!request) {
    return (
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>강의 의뢰 정보를 찾을 수 없습니다.</h2>
        <Link href="/requests" style={{ display: 'inline-block', marginTop: '16px', color: '#2563EB', fontWeight: '600' }}>
          ← 강의 의뢰 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/requests" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '14px', color: '#64748B', textDecoration: 'none' }}>
          ← 강의 의뢰 목록으로
        </Link>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
              {request.status || '모집 중'}
            </span>
            <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: '600' }}>
              {request.deadline ? `${request.deadline} 마감` : '상시 모집'}
            </span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
            {request.title || request.topic}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', color: '#334155' }}>
            <div>📍 <strong>지역:</strong> {request.location || request.region || '미정'}</div>
            <div>💰 <strong>강사료:</strong> {request.fee ? `${request.fee}` : '협의'}</div>
            <div>📅 <strong>일정:</strong> {request.schedule || '협의'}</div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>상세 요청 내용</h3>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {request.description || request.details || '상세 내용이 작성되지 않았습니다.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}