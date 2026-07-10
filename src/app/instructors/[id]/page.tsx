'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function InstructorDetailPage() {
  const params = useParams()
  const id = params?.id
  const supabase = createClient()
  const [instructor, setInstructor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchInstructor = async () => {
      try {
        const { data, error } = await supabase
          .from('instructors')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('강사 상세 정보 조회 오류:', error)
        } else {
          setInstructor(data)
        }
      } catch (err) {
        console.error('통신 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructor()
  }, [id, supabase])

  if (loading) {
    return (
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748B' }}>강사 정보를 불러오는 중입니다...</p>
      </main>
    )
  }

  if (!instructor) {
    return (
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>강사 정보를 찾을 수 없습니다.</h2>
        <Link href="/instructors" style={{ display: 'inline-block', marginTop: '16px', color: '#2563EB', fontWeight: '600' }}>
          ← 강사 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/instructors" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '14px', color: '#64748B', textDecoration: 'none' }}>
          ← 강사 목록으로
        </Link>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {instructor.photo_url ? (
              <img src={instructor.photo_url} alt={instructor.name} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700' }}>
                {instructor.name ? instructor.name.charAt(0) : '강'}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                {instructor.category || '전문강사'}
              </span>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: '8px 0' }}>{instructor.name} 강사</h1>
              <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>{instructor.headline || '소개글이 없습니다.'}</p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '28px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>강사 소개</h3>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {instructor.bio || '상세 소개 내용이 등록되지 않았습니다.'}
              </p>
            </div>

            {instructor.email && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>문의 이메일</h3>
                <p style={{ fontSize: '14px', color: '#334155' }}>{instructor.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}