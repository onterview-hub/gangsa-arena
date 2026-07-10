'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 20px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* 서비스 로고 */}
        <Link href="/" style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB', textDecoration: 'none' }}>
          강사아레나
        </Link>

        {/* 메인 메뉴 (버튼형 UI 스타일 적용) */}
        <nav style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            href="/instructors"
            style={{
              fontSize: '13px',
              color: '#334155',
              fontWeight: '600',
              textDecoration: 'none',
              background: '#F1F5F9',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            🔍 강사 찾기
          </Link>

          <Link
            href="/requests"
            style={{
              fontSize: '13px',
              color: '#334155',
              fontWeight: '600',
              textDecoration: 'none',
              background: '#F1F5F9',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            📋 강의 의뢰 현황
          </Link>

          <Link
            href="/onboarding"
            style={{
              fontSize: '13px',
              color: '#2563EB',
              fontWeight: '700',
              textDecoration: 'none',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
          >
            + 강사 프로필 등록
          </Link>

          <Link
            href="/requests/new"
            style={{
              fontSize: '13px',
              color: '#2563EB',
              fontWeight: '700',
              textDecoration: 'none',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
          >
            + 강의 의뢰 등록
          </Link>
        </nav>

        {/* 우측 로그인 / 마이페이지 액션 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '120px', justifyContent: 'flex-end' }}>
          {loading ? (
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>확인 중...</span>
          ) : user ? (
            <>
              <Link
                href="/mypage"
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#2563EB',
                  background: '#EFF6FF',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                👤 마이페이지
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#64748B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#fff',
                background: '#2563EB',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none'
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