'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // 실제 Supabase 로그인 시도
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      alert('로그인 성공!')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert(`로그인 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 🚀 Supabase 서버 장애 우회용 테스트 로그인
  const handleTestLogin = () => {
    // 임시 테스트 세션 저장
    localStorage.setItem('test_user_logged_in', 'true')
    alert('테스트 계정으로 로그인되었습니다!')
    window.location.href = '/'
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>강사아레나 로그인</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', textAlign: 'center' }}>서비스 이용을 위해 로그인해 주세요.</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              placeholder="비밀번호 입력"
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
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '20px 0' }} />

        {/* 서버 장애 대응 원클릭 테스트 로그인 */}
        <button
          onClick={handleTestLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ⚡ 테스트 계정으로 바로 로그인하기
        </button>
      </div>
    </main>
  )
}