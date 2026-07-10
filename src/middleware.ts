import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // 개발 중: 보호 잠깐 해제
  // 배포 전에 다시 활성화 필요!
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}