import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const naverClientId = process.env.NAVER_CLIENT_ID
  const redirectUri = `${request.nextUrl.origin}/api/auth/naver/callback`
  const state = Math.random().toString(36).substring(2, 15)

  const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  const response = NextResponse.redirect(naverAuthUrl)
  response.cookies.set('naver_oauth_state', state, { maxAge: 600, httpOnly: true })
  return response
}