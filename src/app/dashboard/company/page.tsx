'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CompanyDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        setProfile(data)
      }
    } catch (err) {
      console.error('데이터 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: '#94A3B8' }}>로딩 중...</div>
    </div>
  )

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .side-item { transition: background 0.15s ease, color 0.15s ease; }
        .side-item:hover { background: #F1F5F9; }
        .quick-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .quick-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,23,42,0.08); }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>

        {/* 사이드바 — 마일리지 메뉴 제거됨 */}
        <div style={{
          width: '210px', background: '#fff',
          borderRight: '0.5px solid rgba(0,0,0,0.08)',
          padding: '24px 0', flexShrink: 0
        }}>
          <div style={{ padding: '0 20px 16px', fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            기업 대시보드
          </div>
          <Link href="/instructors" className="side-item" style={{
            padding: '11px 20px', fontSize: '13.5px',
            color: '#475569', display: 'block',
            textDecoration: 'none', borderLeft: '3px solid transparent', fontWeight: 500
          }}>🔍 강사검색</Link>
          <Link href="/dashboard/company/jobs" className="side-item" style={{
            padding: '11px 20px', fontSize: '13.5px',
            color: '#475569', display: 'block',
            textDecoration: 'none', borderLeft: '3px solid transparent', fontWeight: 500
          }}>📋 구인공고</Link>
          <Link href="/favorites" className="side-item" style={{
            padding: '11px 20px', fontSize: '13.5px',
            color: '#475569', display: 'block',
            textDecoration: 'none', borderLeft: '3px solid transparent', fontWeight: 500
          }}>♥ 즐겨찾기</Link>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, padding: '32px', maxWidth: '900px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#0F172A', letterSpacing: '-0.3px' }}>
            안녕하세요{profile?.name ? `, ${profile.name}님` : ''} 👋
          </div>
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '28px' }}>
            원하는 강사를 검색하고 구인공고를 등록해보세요
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            <Link href="/instructors" style={{ textDecoration: 'none' }}>
              <div className="quick-card" style={{
                background: 'linear-gradient(135deg, #0B1E4D 0%, #1E3A8A 100%)',
                borderRadius: '18px', padding: '26px', color: '#fff', height: '100%', boxSizing: 'border-box'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>강사 검색</div>
                <div style={{ fontSize: '12.5px', color: 'rgba(226,232,255,0.8)' }}>전문분야, 강사료로 원하는 강사를 찾아보세요</div>
              </div>
            </Link>

            <Link href="/dashboard/company/jobs" style={{ textDecoration: 'none' }}>
              <div className="quick-card" style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '18px', padding: '26px', height: '100%', boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: '#0F172A' }}>구인공고 관리</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>강사를 공개 모집하고 지원자를 확인하세요</div>
              </div>
            </Link>

            <Link href="/requests/new" style={{ textDecoration: 'none' }}>
              <div className="quick-card" style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '18px', padding: '26px', height: '100%', boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>📝</div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: '#0F172A' }}>강의 의뢰 등록</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>원하는 강사에게 직접 의뢰를 보내보세요</div>
              </div>
            </Link>

            <Link href="/favorites" style={{ textDecoration: 'none' }}>
              <div className="quick-card" style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '18px', padding: '26px', height: '100%', boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>♥</div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: '#0F172A' }}>즐겨찾기</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>저장해둔 강사와 최근 본 강사를 확인하세요</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}