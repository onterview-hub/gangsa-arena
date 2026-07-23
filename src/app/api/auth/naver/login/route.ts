import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const naverClientId = process.env.NAVER_CLIENT_ID
  const redirectUri = `${request.nextUrl.origin}/api/auth/naver/callback`

  // 디버그용: 실제 값을 화면에 그대로 보여줌
  return NextResponse.json({
    clientId: naverClientId,
    clientIdLength: naverClientId?.length,
    redirectUri: redirectUri,
  })
}