'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const RECENTLY_VIEWED_KEY = 'recently_viewed_instructors'

export default function FavoritesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [favorites, setFavorites] = useState<any[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      setLoggedIn(true)
      const { data: favRows } = await supabase
        .from('instructor_favorites')
        .select('instructor_id, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      const favIds = (favRows || []).map(f => f.instructor_id)
      if (favIds.length > 0) {
        const { data: instData } = await supabase
          .from('instructors')
          .select('*')
          .in('id', favIds)
        // 즐겨찾기한 순서 유지
        const map = (instData || []).reduce((acc: any, i: any) => { acc[i.id] = i; return acc }, {})
        setFavorites(favIds.map(id => map[id]).filter(Boolean))
      }
    }

    // 최근 본 강사 (localStorage)
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY)
      const ids: string[] = raw ? JSON.parse(raw) : []
      if (ids.length > 0) {
        const { data: instData } = await supabase
          .from('instructors')
          .select('*')
          .in('id', ids)
        const map = (instData || []).reduce((acc: any, i: any) => { acc[i.id] = i; return acc }, {})
        setRecentlyViewed(ids.map(id => map[id]).filter(Boolean))
      }
    } catch (e) {
      console.error('최근 본 강사 불러오기 실패:', e)
    }

    setLoading(false)
  }

  const InstructorCard = ({ ins }: { ins: any }) => (
    <Link href={`/instructors/${ins.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff', padding: '18px', borderRadius: '14px',
        border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center', gap: '14px'
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
          background: ins.photo_url ? `url(${ins.photo_url}) center/cover` : 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: '700', color: '#fff'
        }}>
          {!ins.photo_url && (ins.name?.[0] || '강')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#0F172A' }}>{ins.name} 강사</div>
          <div style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ins.headline || ins.category || ''}
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
      `}</style>

      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          ♥ 즐겨찾기 & 최근 본 강사
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>
          관심 있는 강사를 모아보고, 최근 확인한 강사도 다시 볼 수 있어요
        </p>
      </section>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px 60px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>불러오는 중입니다...</div>
        ) : (
          <>
            <div style={{ marginBottom: '36px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                ♥ 즐겨찾기한 강사 {favorites.length > 0 && <span style={{ color: '#2563EB' }}>{favorites.length}명</span>}
              </div>
              {!loggedIn ? (
                <div style={{ background: '#fff', padding: '32px', textAlign: 'center', borderRadius: '14px', border: '0.5px solid rgba(0,0,0,0.08)', color: '#94A3B8', fontSize: '13.5px' }}>
                  로그인 후 즐겨찾기한 강사를 확인할 수 있어요.{' '}
                  <Link href="/login" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>로그인하기</Link>
                </div>
              ) : favorites.length === 0 ? (
                <div style={{ background: '#fff', padding: '32px', textAlign: 'center', borderRadius: '14px', border: '0.5px solid rgba(0,0,0,0.08)', color: '#94A3B8', fontSize: '13.5px' }}>
                  아직 즐겨찾기한 강사가 없어요
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {favorites.map(ins => <InstructorCard key={ins.id} ins={ins} />)}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                🕒 최근 본 강사 {recentlyViewed.length > 0 && <span style={{ color: '#2563EB' }}>{recentlyViewed.length}명</span>}
              </div>
              {recentlyViewed.length === 0 ? (
                <div style={{ background: '#fff', padding: '32px', textAlign: 'center', borderRadius: '14px', border: '0.5px solid rgba(0,0,0,0.08)', color: '#94A3B8', fontSize: '13.5px' }}>
                  아직 확인한 강사가 없어요
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentlyViewed.map(ins => <InstructorCard key={ins.id} ins={ins} />)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}