'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SPECIALTIES = ['AI', '취업', '면접', '챗GPT', '리더십', '진로', '마케팅', '안전·보건']
const FEE_OPTIONS = [
  { value: '협의 가능', label: '💰 협의 가능' },
  { value: '30-50만원', label: '💵 30-50만원' },
  { value: '50-100만원', label: '💵 50-100만원' },
  { value: '100만원 이상', label: '💎 100만원 이상' },
]

export default function InstructorsPage() {
  const supabase = createClient()
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpec, setSelectedSpec] = useState('')
  const [selectedFee, setSelectedFee] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchInstructors()
  }, [selectedSpec, selectedFee])

  const fetchInstructors = async () => {
    setLoading(true)
    let query = supabase
      .from('instructors')
      .select('*')
      .order('created_at', { ascending: false })

    if (selectedSpec) query = query.ilike('category', `%${selectedSpec}%`)
    if (selectedFee) query = query.ilike('fee', `%${selectedFee}%`)

    const { data } = await query
    setInstructors(data || [])
    setLoading(false)
  }

  const filtered = instructors.filter(ins =>
    search ? ins.name?.includes(search) || ins.category?.includes(search) || ins.headline?.includes(search) : true
  )

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        .skeleton-box { animation: skeletonPulse 1.4s ease-in-out infinite; }

        .filter-item {
          transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
        }
        .filter-item:hover {
          background: #F1F5F9;
          transform: translateX(2px);
        }
        .instructor-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .instructor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 26px rgba(15, 23, 42, 0.10);
          border-color: rgba(37, 99, 235, 0.25) !important;
        }
        .search-btn {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .search-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
      `}</style>

      {/* 서브 히어로 — 메인과 톤을 맞춘 네이비 그라데이션 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '20px', letterSpacing: '-0.4px' }}>
          👨‍🏫 전문 강사 찾기
        </h1>
        <div style={{
          display: 'flex', gap: '8px', maxWidth: '500px', margin: '0 auto',
          background: '#fff', borderRadius: '12px', padding: '6px',
          boxShadow: '0 12px 32px rgba(2,6,23,0.3)'
        }}>
          <input type="text" placeholder="강사 이름, 전문분야 검색..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 12px', fontSize: '14px', background: 'transparent' }} />
          <button className="search-btn" style={{
            padding: '8px 20px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px',
            fontWeight: '700', cursor: 'pointer'
          }}>검색</button>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '20px', padding: '28px 20px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* 필터 패널 */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
            borderRadius: '16px', padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'sticky', top: '20px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: '#0F172A' }}>🎯 필터</div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>전문분야</div>
              {SPECIALTIES.map(s => (
                <div key={s} className="filter-item" onClick={() => setSelectedSpec(selectedSpec === s ? '' : s)}
                  style={{
                    padding: '7px 10px', marginBottom: '4px', borderRadius: '8px',
                    fontSize: '13px', cursor: 'pointer',
                    background: selectedSpec === s ? '#EFF6FF' : 'transparent',
                    color: selectedSpec === s ? '#2563EB' : '#475569',
                    fontWeight: selectedSpec === s ? '700' : '400'
                  }}>
                  {selectedSpec === s ? '✓ ' : ''}{s}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>강사료</div>
              {FEE_OPTIONS.map(f => (
                <div key={f.value} className="filter-item" onClick={() => setSelectedFee(selectedFee === f.value ? '' : f.value)}
                  style={{
                    padding: '7px 10px', marginBottom: '4px', borderRadius: '8px',
                    fontSize: '12px', cursor: 'pointer',
                    background: selectedFee === f.value ? '#EFF6FF' : 'transparent',
                    color: selectedFee === f.value ? '#2563EB' : '#475569',
                    fontWeight: selectedFee === f.value ? '700' : '400'
                  }}>
                  {f.label}
                </div>
              ))}
            </div>

            {(selectedSpec || selectedFee) && (
              <button onClick={() => { setSelectedSpec(''); setSelectedFee('') }} style={{
                width: '100%', padding: '8px', background: '#F1F5F9',
                border: 'none', borderRadius: '8px', fontSize: '12px',
                color: '#475569', cursor: 'pointer', fontWeight: '600'
              }}>🔄 필터 초기화</button>
            )}
          </div>
        </div>

        {/* 강사 목록 */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#475569' }}>
              총 <strong style={{ color: '#2563EB' }}>{filtered.length}명</strong>의 강사
              {selectedSpec && <span style={{ marginLeft: '8px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>#{selectedSpec}</span>}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton-box" style={{ background: '#fff', borderRadius: '16px', padding: '20px', height: '160px', border: '0.5px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', marginBottom: '12px' }} />
                  <div style={{ height: '14px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '12px', background: '#F1F5F9', borderRadius: '4px', width: '60%' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>강사를 찾을 수 없어요</div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>다른 검색어나 필터를 시도해보세요</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {filtered.map(ins => (
                <Link key={ins.id} href={`/instructors/${ins.id}`} style={{ textDecoration: 'none' }}>
                  <div className="instructor-card" style={{
                    background: '#fff', padding: '20px', borderRadius: '16px',
                    border: '0.5px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer', height: '100%', boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: '700', color: '#fff'
                      }}>
                        {ins.name?.[0] || '강'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: '11px', background: '#EFF6FF', color: '#2563EB',
                          padding: '2px 8px', borderRadius: '4px', fontWeight: '700',
                          marginBottom: '4px', display: 'inline-block',
                          maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {ins.category?.split(',')[0] || '전문강사'}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{ins.name} 강사</div>
                      </div>
                    </div>
                    <p style={{
                      fontSize: '12px', color: '#64748B', margin: '0 0 12px',
                      lineHeight: '1.5', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {ins.headline || ins.bio || '소개글이 없습니다.'}
                    </p>
                    <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      💰 {ins.fee || '강사료 협의'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}