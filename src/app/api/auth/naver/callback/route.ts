import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const savedState = request.cookies.get('naver_oauth_state')?.value

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_state_mismatch`)
  }

  try {
    const tokenRes = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&code=${code}&state=${state}`
    )
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_token_failed`)
    }

    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profileData = await profileRes.json()
    const naverEmail = profileData.response?.email
    const naverName = profileData.response?.name || profileData.response?.nickname || '네이버 사용자'

    if (!naverEmail) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_no_email`)
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    let userId = existingUsers?.users.find(u => u.email === naverEmail)?.id

    if (!userId) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: naverEmail,
        email_confirm: true,
        user_metadata: { full_name: naverName, provider: 'naver' },
      })
      if (createError || !newUser.user) {
        return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_create_failed`)
      }
      userId = newUser.user.id
    }

    // 돌아올 주소를 새로 만든 클라이언트 처리 페이지로 지정
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: naverEmail,
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/naver/complete`,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_link_failed`)
    }

    return NextResponse.redirect(linkData.properties.action_link)
  } catch (err) {
    console.error('네이버 로그인 오류:', err)
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_unknown`)
  }
}