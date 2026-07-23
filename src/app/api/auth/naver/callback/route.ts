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
    // 1. 네이버에 code를 보내서 access_token 받기
    const tokenRes = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&code=${code}&state=${state}`
    )
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_token_failed`)
    }

    // 2. access_token으로 네이버 사용자 정보(이메일 등) 가져오기
    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profileData = await profileRes.json()
    const naverEmail = profileData.response?.email
    const naverName = profileData.response?.name || profileData.response?.nickname || '네이버 사용자'

    if (!naverEmail) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=naver_no_email`)
    }

    // 3. Supabase 관리자 권한으로 이 이메일의 계정을 찾거나 새로 만들기
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 이미 가입된 이메일인지 확인
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    let userId = existingUsers?.users.find(u => u.email === naverEmail)?.id

    if (!userId) {
      // 없으면 새로 계정 생성 (비밀번호는 랜덤, 어차피 소셜로그인만 씀)
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

    // 4. 이 사용자로 로그인 링크(매직링크) 생성해서, 그 링크로 리다이렉트 → 자동 로그인
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: naverEmail,
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