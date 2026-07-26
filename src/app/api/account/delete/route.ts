import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '인증 정보가 없습니다.' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: '서버 설정 오류: SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다.' },
        { status: 500 }
      )
    }

    // 토큰으로 요청한 사람이 누구인지 검증 (일반 키로 확인)
    const anonClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: '유효하지 않은 사용자입니다.' }, { status: 401 })
    }

    // 관리자 권한 클라이언트 (service role key 사용, 서버에서만!)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 1. 강사 정보 삭제 (강사 계정인 경우)
    await adminClient.from('instructors').delete().eq('email', user.email)

    // 2. 마일리지 계정 삭제 (기업 계정인 경우)
    await adminClient.from('mileage_accounts').delete().eq('user_id', user.id)

    // 3. 프로필 삭제
    await adminClient.from('profiles').delete().eq('id', user.id)

    // 4. 인증 계정 완전 삭제 (되돌릴 수 없음)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: '계정 삭제 실패: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '알 수 없는 오류' }, { status: 500 })
  }
}