'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: requestData } = await supabase
        .from('requests').select('*')
        .order('created_at', { ascending: false }).limit(3)
      const { data: instructorData } = await supabase
        .from('instructors').select('*')
        .order('created_at', { ascending: false }).limit(4)
      setRequests(requestData || [])
      setInstructors(instructorData || [])
      setLoading(false)
    }
    fetchData()

    // 카운터 애니메이션
    let i = 0
    const timer = setInterval(() => {
      i += 7
      if (i >= 300) { setCount(300); clearInterval(timer) }
      else setCount(i)
    }, 20)
    return () => clearInterval(timer)
  }, [])

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* 히어로 */}
      <section style={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
        padding: '80px 20px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* 배경 장식 */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#fff', marginBottom: '20px', backdropFilter: 'blur(10px)' }}>
            🎯 강사 전문 매칭 플랫폼
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#fff', marginBottom: '16px', lineHeight: '1.2', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            필요한 강사를<br />지금 바로 찾으세요 ✨
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '32px' }}>
            AI · 취업 · 리더십 · 진로 등 검증된 전문 강사 매칭
          </p>

          <div style={{ display: 'flex', gap: '8px', maxWidth: '520px', margin: '0 auto 24px', background: 'rgba(255,255,255,0.95)', borderRadius: '14px', padding: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <input type="text" placeholder="강사 이름, 전문 분야 검색..."
              style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontSize: '15px', background: 'transparent', borderRadius: '10px' }} />
            <Link href="/instructors" style={{
              padding: '10px 24px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: '#fff', borderRadius: '10px', textDecoration: 'none',
              fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center'
            }}>검색</Link>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🤖 AI', '💼 취업', '🎤 면접', '💬 ChatGPT', '👑 리더십', '🧭 진로'].map(tag => (
              <Link key={tag} href="/instructors" style={{
                background: 'rgba(255,255,255,0.2)', padding: '6px 14px',
                borderRadius: '20px', fontSize: '13px', color: '#fff',
                textDecoration: 'none', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>{tag}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section style={{ background: '#fff', padding: '32px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {[
            { icon: '👨‍🏫', value: `${count}+`, label: '등록 강사' },
            { icon: '🏢', value: '50+', label: '파트너 기관' },
            { icon: '✅', value: '98%', label: '매칭 만족도' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563EB' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '1000px', margin: '40px auto 0', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 프리미엄 강사 */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>⭐ 프리미엄 강사</h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>검증된 전문 강사진</p>
            </div>
            <Link href="/instructors" style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              전체보기 →
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: '16px' }}>불러오는 중...</div>
          ) : instructors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.1)' }}>등록된 강사가 없어요</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {instructors.slice(0, 2).map(ins => (
                <Link key={ins.id} href={`/instructors/${ins.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)',
                    padding: '24px', borderRadius: '16px',
                    border: '0.5px solid rgba(37,99,235,0.15)',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.08)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: '700', color: '#fff'
                      }}>
                        {ins.name?.[0] || '강'}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', marginBottom: '4px', display: 'inline-block' }}>
                          ⭐ {ins.category?.split(',')[0] || '전문강사'}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{ins.name} 강사</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                      {ins.headline || ins.bio || '소개글이 없습니다.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 최근 등록 강사 */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>👥 최근 등록 강사</h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>새로 합류한 강사진</p>
            </div>
            <Link href="/instructors" style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>전체보기 →</Link>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: '16px' }}>불러오는 중...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {instructors.map(ins => (
                <Link key={ins.id} href={`/instructors/${ins.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', padding: '20px', borderRadius: '16px',
                    border: '0.5px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: '700', color: '#2563EB'
                      }}>
                        {ins.name?.[0] || '강'}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', marginBottom: '4px', display: 'inline-block' }}>
                          {ins.category?.split(',')[0] || '전문강사'}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>{ins.name} 강사</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                      {ins.headline || ins.bio || '소개글이 없습니다.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 강의 의뢰 현황 */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>📢 최신 강의 의뢰</h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>기업 및 기관의 출강 요청</p>
            </div>
            <Link href="/requests" style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>전체보기 →</Link>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: '16px' }}>불러오는 중...</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.1)' }}>
              등록된 강의 의뢰가 없어요
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map(req => (
                <Link key={req.id} href={`/requests/${req.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', padding: '20px', borderRadius: '16px',
                    border: '0.5px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
                        🔥 {req.status || '모집 중'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600' }}>
                        {req.deadline ? `${req.deadline} 마감` : '상시 모집'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px' }}>
                      {req.title || req.topic}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#475569' }}>
                      <span>📍 {req.location || req.region || '미정'}</span>
                      <span>💰 {req.fee || '협의'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA 섹션 */}
        <section style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
          borderRadius: '24px', padding: '48px 32px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            지금 바로 시작하세요
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '28px' }}>
            강사로 등록하거나 원하는 강사를 찾아보세요
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              padding: '12px 28px', background: '#fff',
              color: '#2563EB', borderRadius: '12px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '700'
            }}>🎤 강사로 등록하기</Link>
            <Link href="/instructors" style={{
              padding: '12px 28px', background: 'rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: '12px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '700',
              border: '1px solid rgba(255,255,255,0.4)'
            }}>🔍 강사 찾아보기</Link>
          </div>
        </section>

      </div>
    </main>
  )
}