'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NaverLoginCompletePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const finishLogin = async () => {
      // 주소창의 # 뒤에 붙어있는 로그인 정보를 직접 꺼내요
      const hash = window.location.hash.substring(1) // 맨 앞 '#' 제거
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (!access_token || !refresh_token) {
        router.push('/login?error=naver_no_token')
        return
      }

      // 꺼낸 정보로 직접 로그인 세션을 만들어요
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error || !data.session) {
        router.push('/login?error=naver_session_failed')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.session.user.id)
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