'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert(`회원가입 실패: ${error.message}`)
        return
      }

      alert('회원가입이 완료되었습니다! 바로 로그인해 주세요.')
      router.push('/login')
    } catch (err: any) {
      alert(`오류 발생: ${err.message || '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>강사아레나 회원가입</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', textAlign: 'center' }}>테스트용 계정을 만듭니다.</p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자리 이상 입력"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {loading ? '가입 중...' : '회원가입하기'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
            로그인하기
          </Link>
        </div>
      </div>
    </main>
  )
}