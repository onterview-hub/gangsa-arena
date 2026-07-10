'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. 테스트 로그인 세션 확인
      if (typeof window !== 'undefined') {
        const isTestLoggedIn = localStorage.getItem('test_user_logged_in') === 'true'
        if (isTestLoggedIn) {
          setUser({ email: 'test@example.com' })
          setProfile({
            name: '테스트 강사',
            specialty: 'AI 및 취업 솔루션',
          })
          setLoading(false)
          return
        }
      }

      // 2. Supabase 실제 로그인 세션 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('로그인이 필요한 페이지입니다.')
        router.push('/login')
        return
      }

      setUser(session.user)

      // 프로필 정보 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      setProfile(profileData)
      setLoading(false)
    }

    fetchUserData()
  }, [router, supabase])

  if (loading) {
    return (
      <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#64748B' }}>마이페이지 정보를 불러오는 중입니다...</p>
      </main>
    )
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>마이페이지</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>계정 정보 및 프로필 상태 관리</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>계정 이메일</span>
            <p style={{ fontSize: '15px', fontWeight: '600', margin: '4px 0 0 0', color: '#0F172A' }}>{user?.email}</p>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '4px 0' }} />
          <div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>성함 / 활동명</span>
            <p style={{ fontSize: '15px', fontWeight: '600', margin: '4px 0 0 0', color: '#0F172A' }}>{profile?.name || '미등록'}</p>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>전문 분야</span>
            <p style={{ fontSize: '15px', fontWeight: '600', margin: '4px 0 0 0', color: '#0F172A' }}>{profile?.specialty || '미등록'}</p>
          </div>
        </div>
      </div>
    </main>
  )
}