'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function InstructorsPage() {
  const supabase = createClient()
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const { data, error } = await supabase
          .from('instructors')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('강사 목록 조회 오류:', error)
        } else if (data) {
          setInstructors(data)
        }
      } catch (err) {
        console.error('통신 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [supabase])

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
            👨‍🏫 전문 강사 찾기
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            다양한 분야에서 활동 중인 검증된 전문 강사진을 만나보세요.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            강사 목록을 불러오는 중입니다...
          </div>
        ) : instructors.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            등록된 강사가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {instructors.map((ins) => (
              <Link
                key={ins.id}
                href={`/instructors/${ins.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    background: '#fff',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {ins.photo_url ? (
                      <img src={ins.photo_url} alt={ins.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>
                        {ins.name ? ins.name.charAt(0) : '강'}
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        {ins.category ? ins.category.split(',')[0] : '전문강사'}
                      </span>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '4px 0 0 0', color: '#0F172A' }}>{ins.name} 강사</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                    {ins.headline || ins.bio || '등록된 한 줄 소개가 없습니다.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}