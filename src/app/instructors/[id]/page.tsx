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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA' }}>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>강사 정보를 불러오는 중입니다...</p>
      </main>
    )
  }

  if (!instructor) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA', gap: '12px' }}>
        <div style={{ fontSize: '40px' }}>🔍</div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>강사 정보를 찾을 수 없어요</h2>
        <Link href="/instructors" style={{ color: '#2563EB', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
          ← 강사 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', paddingBottom: '80px', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .back-link { transition: opacity 0.15s ease; }
        .back-link:hover { opacity: 0.7; }

        .info-card {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .info-card:hover {
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .cta-btn {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }
      `}</style>

      {/* 상단 프로필 히어로 — 목록/메인과 통일된 네이비 톤 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.45), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '32px 20px 72px'
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <Link href="/instructors" className="back-link" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 500 }}>
            ← 강사 목록으로
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: '760px', margin: '-48px auto 0', padding: '0 20px' }}>

        {/* 프로필 카드 (히어로 위에 겹쳐지는 카드) */}
        <div style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 16px 40px rgba(15,23,42,0.12)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {instructor.photo_url ? (
              <img src={instructor.photo_url} alt={instructor.name} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '34px', fontWeight: '800'
              }}>
                {instructor.name ? instructor.name.charAt(0) : '강'}
              </div>
            )}

            <div style={{ flex: 1, minWidth: '200px' }}>
              <span style={{ fontSize: '12px', background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                {instructor.category || '전문강사'}
              </span>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: '10px 0 6px', letterSpacing: '-0.3px' }}>{instructor.name} 강사</h1>
              <p style={{ fontSize: '15px', color: '#475569', margin: 0, lineHeight: '1.5' }}>{instructor.headline || '소개글이 없습니다.'}</p>
            </div>
          </div>

          {/* 강사료 · 경력 요약 배지 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: '#F8FAFC', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              💰 {instructor.fee || '강사료 협의'}
            </div>
          </div>
        </div>

        {/* 상세 정보 섹션들 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>

          <div className="info-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📝 강사 소개
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
              {instructor.bio || '상세 소개 내용이 등록되지 않았습니다.'}
            </p>
          </div>

          {instructor.experience && (
            <div className="info-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🏆 경력 및 강의 이력
              </h3>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
                {instructor.experience}
              </p>
            </div>
          )}

          {(instructor.email || instructor.phone) && (
            <div className="info-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📮 문의 연락처
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {instructor.email && (
                  <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>✉️ {instructor.email}</p>
                )}
                {instructor.phone && (
                  <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>📞 {instructor.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* 하단 CTA */}
          <div style={{
            marginTop: '8px', textAlign: 'center', padding: '28px',
            background: 'linear-gradient(135deg, #0B1E4D 0%, #1E3A8A 100%)',
            borderRadius: '16px'
          }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: '14px' }}>
              {instructor.name} 강사에게 강의를 의뢰해보세요
            </p>
            <Link href="/requests/new" className="cta-btn" style={{
              display: 'inline-block', padding: '12px 28px', background: '#fff',
              color: '#1E3A8A', borderRadius: '10px', textDecoration: 'none',
              fontSize: '14px', fontWeight: '800'
            }}>
              📋 강의 의뢰하기
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}