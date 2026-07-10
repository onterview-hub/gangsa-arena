import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // 프로필 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      // user_type 없으면 온보딩으로
      if (!profile?.user_type) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // user_type 있으면 대시보드로
      if (profile.user_type === 'instructor') {
        return NextResponse.redirect(`${origin}/dashboard/instructor`)
      } else if (profile.user_type === 'company') {
        return NextResponse.redirect(`${origin}/dashboard/company`)
      } else if (profile.user_type === 'admin') {
        return NextResponse.redirect(`${origin}/admin`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}