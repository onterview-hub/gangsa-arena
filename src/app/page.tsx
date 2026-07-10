'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Supabase DB의 'requests' 테이블에서 최신 3건 조회
        const { data: requestData, error: reqError } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        if (reqError) {
          console.error('의뢰 데이터 조회 오류:', reqError)
        } else if (requestData) {
          setRequests(requestData)
        }

        // 2. Supabase DB의 'instructors' 테이블에서 최신 강사 데이터 조회
        const { data: instructorData, error: instError } = await supabase
          .from('instructors')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4)

        if (instError) {
          console.error('강사 데이터 조회 오류:', instError)
        } else if (instructorData) {
          setInstructors(instructorData)
        }
      } catch (err) {
        console.error('데이터 통신 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* 히어로 영역 */}
      <section style={{ background: '#EFF6FF', padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
            필요한 강사를 지금 바로 찾으세요
          </h1>
          <p style={{ fontSize: '16px', color: '#475569', marginBottom: '28px' }}>
            AI · 취업 · 리더십 · 진로 등 검증된 분야별 전문 강사 매칭
          </p>

          <div style={{ display: 'flex', gap: '8px', maxWidth: '500px', margin: '0 auto 20px' }}>
            <input
              type="text"
              placeholder="강사 이름, 전문 분야 검색..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              style={{
                padding: '12px 24px',
                background: '#2563EB',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              검색
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['AI', '취업', '면접', 'ChatGPT', '리더십', '진로'].map((tag) => (
              <span key={tag} style={{ background: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', color: '#64748B', border: '1px solid #E2E8F0' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 컨텐츠 레이아웃 */}
      <div style={{ maxWidth: '1000px', margin: '40px auto 0', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* 1. 프리미엄 강사 */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>⭐ 프리미엄 강사</h2>
            <Link href="/instructors" style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>
              전체보기 →
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: '20px', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
              강사 정보를 불러오는 중...
            </div>
          ) : instructors.length === 0 ? (
            <div style={{ padding: '20px', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
              등록된 강사가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {instructors.slice(0, 2).map((ins) => (
                <Link
                  key={ins.id}
                  href={`/instructors/${ins.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    flex: '1',
                    minWidth: '240px',
                    maxWidth: '300px'
                  }}
                >
                  <div style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    height: '100%',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {ins.photo_url ? (
                        <img src={ins.photo_url} alt={ins.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                          {ins.name ? ins.name.charAt(0) : '강'}
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          {ins.category ? ins.category.split(',')[0] : '전문강사'}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0 0 0', color: '#0F172A' }}>{ins.name} 강사</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ins.headline || ins.bio || '등록된 한 줄 소개가 없습니다.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 2. 최근 등록 강사 */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>👥 최근 등록 강사</h2>
            <Link href="/instructors" style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>
              전체보기 →
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: '20px', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
              강사 정보를 불러오는 중...
            </div>
          ) : instructors.length === 0 ? (
            <div style={{ padding: '20px', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
              등록된 강사가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {instructors.map((ins) => (
                <Link
                  key={ins.id}
                  href={`/instructors/${ins.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    flex: '1',
                    minWidth: '240px',
                    maxWidth: '300px'
                  }}
                >
                  <div style={{
                    background: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    height: '100%',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {ins.photo_url ? (
                        <img src={ins.photo_url} alt={ins.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                          {ins.name ? ins.name.charAt(0) : '강'}
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          {ins.category ? ins.category.split(',')[0] : '전문강사'}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '4px 0 0 0', color: '#0F172A' }}>{ins.name} 강사</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ins.headline || ins.bio || '등록된 한 줄 소개가 없습니다.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 3. 강의 의뢰 현황 */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>📢 최신 강의 의뢰 현황</h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>기업 및 기관에서 출강을 요청한 매칭 의뢰 건입니다.</p>
            </div>
            <Link href="/requests" style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>
              전체 의뢰보기 →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              강의 의뢰 목록을 불러오는 중입니다...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              등록된 강의 의뢰가 없습니다. 첫 강의 의뢰를 등록해 보세요!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req) => (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#fff',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '4px 8px', borderRadius: '4px' }}>
                        {req.status || '모집 중'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600' }}>
                        {req.deadline ? `${req.deadline} 마감` : '상시 모집'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      {req.title || req.topic}
                    </h3>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                      <span>📍 <strong>장소/지역:</strong> {req.location || req.region || '미정'}</span>
                      <span>💰 <strong>강사료:</strong> {req.fee ? `${req.fee}` : '협의'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}