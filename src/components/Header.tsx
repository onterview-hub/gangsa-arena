'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showRegisterMenu, setShowRegisterMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const checkUserStatus = async () => {
    try {
      if (typeof window !== 'undefined') {
        const testUserLoggedIn = localStorage.getItem('test_user_logged_in')
        if (testUserLoggedIn === 'true') {
          setUser({ email: 'test@example.com' })
          setLoading(false)
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUserStatus()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window !== 'undefined' && localStorage.getItem('test_user_logged_in') === 'true') {
        setUser({ email: 'test@example.com' })
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    checkUserStatus()
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowRegisterMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('test_user_logged_in')
    }
    await supabase.auth.signOut()
    setUser(null)
    alert('로그아웃되었습니다.')
    router.push('/')
    router.refresh()
  }

  const navLinkStyle = {
    fontSize: '13.5px', color: '#475569', fontWeight: '600',
    textDecoration: 'none', padding: '8px 4px'
  }

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 20px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* 서비스 로고 */}
        <Link href="/" style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB', textDecoration: 'none', flexShrink: 0 }}>
          강사아레나
        </Link>

        {/* 메인 메뉴 — 심플 텍스트 링크 */}
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
          <Link href="/instructors" style={navLinkStyle}>강사 찾기</Link>
          <Link href="/requests" style={navLinkStyle}>강의 의뢰 현황</Link>
          <Link href="/notices" style={navLinkStyle}>공지사항</Link>
          <Link href="/faq" style={navLinkStyle}>FAQ</Link>
        </nav>

        {/* 우측: 등록 드롭다운 + 로그인/마이페이지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRegisterMenu(v => !v)}
              style={{
                fontSize: '13px', color: '#2563EB', fontWeight: '700',
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              + 등록하기 <span style={{ fontSize: '10px' }}>▾</span>
            </button>
            {showRegisterMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '180px', overflow: 'hidden', zIndex: 60
              }}>
                <Link href="/onboarding" onClick={() => setShowRegisterMenu(false)} style={{
                  display: 'block', padding: '11px 16px', fontSize: '13px',
                  color: '#334155', textDecoration: 'none', fontWeight: 600
                }}>🎤 강사 프로필 등록</Link>
                <Link href="/requests/new" onClick={() => setShowRegisterMenu(false)} style={{
                  display: 'block', padding: '11px 16px', fontSize: '13px',
                  color: '#334155', textDecoration: 'none', fontWeight: 600,
                  borderTop: '1px solid #F1F5F9'
                }}>📋 강의 의뢰 등록</Link>
              </div>
            )}
          </div>

          {loading ? (
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>확인 중...</span>
          ) : user ? (
            <>
              <Link
                href="/mypage"
                style={{
                  fontSize: '13px', fontWeight: '600', color: '#2563EB',
                  background: '#EFF6FF', padding: '6px 12px',
                  borderRadius: '6px', textDecoration: 'none'
                }}
              >
                👤 마이페이지
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '13px', fontWeight: '500', color: '#64748B',
                  background: 'none', border: 'none', cursor: 'pointer'
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                fontSize: '13px', fontWeight: '600', color: '#fff',
                background: '#2563EB', padding: '8px 16px',
                borderRadius: '6px', textDecoration: 'none'
              }}
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}