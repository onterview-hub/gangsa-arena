'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NaverLoginCompletePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const finishLogin = async () => {
      // 브라우저 URL의 #access_token 부분을 Supabase 클라이언트가 자동으로 읽어서
      // 세션을 만들어줄 때까지 잠깐 기다려요
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login?error=naver_session_failed')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profile?.user_type) {
        router.push('/onboarding')
      } else if (profile.user_type === 'instructor') {
        router.push('/dashboard/instructor')
      } else if (profile.user_type === 'company') {
        router.push('/dashboard/company')
      } else {
        router.push('/')
      }
    }

    finishLogin()
  }, [])

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA' }}>
      <p style={{ color: '#94A3B8', fontSize: '14px' }}>네이버 로그인 처리 중입니다...</p>
    </main>
  )
}