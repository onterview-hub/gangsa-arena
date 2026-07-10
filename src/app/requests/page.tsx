'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RequestsPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        // Supabase DB의 'requests' 테이블에서 전체 목록 조회
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('전체 의뢰 목록 조회 오류:', error)
        } else if (data) {
          setRequests(data)
        }
      } catch (err) {
        console.error('데이터 통신 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllRequests()
  }, [supabase])

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* 상단 타이틀 & 등록 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>📋 전체 강의 의뢰 현황</h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
              현재 등록된 전체 강의 요청 목록입니다. 강사분들은 조건에 맞춰 출강 제안을 하실 수 있습니다.
            </p>
          </div>
          <Link
            href="/requests/new"
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#fff',
              background: '#2563EB',
              padding: '10px 16px',
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            + 강의 의뢰 등록
          </Link>
        </div>

        {/* 의뢰 목록 표시 */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            강의 의뢰 목록을 불러오는 중입니다...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            등록된 강의 의뢰가 없습니다. 첫 강의 의뢰를 등록해 보세요!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '4px 8px', borderRadius: '4px' }}>
                    {req.status || '모집 중'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: '600' }}>
                    {req.deadline ? `마감일: ${req.deadline}` : '상시 모집'}
                  </span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  {req.title || req.topic}
                </h2>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#475569', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px' }}>
                  <span>📍 <strong>장소/지역:</strong> {req.location || req.region || '미정'}</span>
                  <span>💰 <strong>강사료:</strong> {req.fee ? `${req.fee}` : '협의'}</span>
                </div>

                {req.description && (
                  <p style={{ fontSize: '14px', color: '#64748B', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {req.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}