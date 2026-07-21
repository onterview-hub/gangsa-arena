'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function CompanyDashboardPage() {
  const [balance, setBalance] = useState(0)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('기업 담당자')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 개발 중 로그인 체크 임시 해제
      // if (!user) { router.push('/login'); return }

      if (user) {
        const { data: account } = await supabase
          .from('mileage_accounts')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        setBalance(account?.balance || 0)

        const { data: mileageLogs } = await supabase
          .from('mileage_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        setLogs(mileageLogs || [])
      }
    } catch (err) {
      console.error('데이터 로드 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCharge = (amount: number) => {
    if (balance + amount > 100000) {
      toast.error('보유 마일리지와 합산 100,000P를 초과할 수 없어요')
      return
    }
    toast('PortOne 결제 연동 후 사용 가능해요', { icon: '💳' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: '#94A3B8' }}>로딩 중...</div>
    </div>
  )

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="bottom-right" />

      {/* 대시보드 레이아웃 */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

        {/* 사이드바 */}
        <div style={{
          width: '200px', background: '#fff',
          borderRight: '0.5px solid rgba(0,0,0,0.1)',
          padding: '20px 0', flexShrink: 0
        }}>
          <div style={{
            padding: '10px 20px', fontSize: '13px',
            color: '#2563EB', background: '#EFF6FF',
            borderLeft: '2px solid #2563EB', fontWeight: '500'
          }}>💰 마일리지</div>
          <Link href="/dashboard/company/jobs" style={{
            padding: '10px 20px', fontSize: '13px',
            color: '#475569', display: 'block',
            textDecoration: 'none', borderLeft: '2px solid transparent'
          }}>📋 구인공고</Link>
          <Link href="/instructors" style={{
            padding: '10px 20px', fontSize: '13px',
            color: '#475569', display: 'block',
            textDecoration: 'none', borderLeft: '2px solid transparent'
          }}>🔍 강사검색</Link>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, padding: '28px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>마일리지</div>
          <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>
            강사 연락처 열람에 사용됩니다 (1회 1,000P)
          </div>

          {/* 마일리지 현황 */}
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: '16px', padding: '24px', marginBottom: '24px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563EB' }}>
                {balance.toLocaleString()}P
              </div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>보유 마일리지</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>충전 금액 선택</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[10000, 30000, 50000, 100000].map(amount => (
                  <button key={amount} onClick={() => handleCharge(amount)} style={{
                    background: '#F8FAFC', border: '0.5px solid rgba(0,0,0,0.18)',
                    borderRadius: '12px', padding: '8px 14px',
                    fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                  }}>
                    {amount.toLocaleString()}P
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '8px' }}>
                ⚠️ 보유+충전 합산 100,000P 초과 불가
              </div>
            </div>
          </div>

          {/* 사용 내역 */}
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: '16px', padding: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>사용 내역</div>
            {logs.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['일시', '내용', '변동', '잔액'].map(h => (
                      <th key={h} style={{
                        fontSize: '12px', color: '#94A3B8', fontWeight: '500',
                        textAlign: 'left', padding: '8px 12px',
                        borderBottom: '0.5px solid rgba(0,0,0,0.1)'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#475569', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                        {new Date(log.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#475569', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                        {log.reason}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', borderBottom: '0.5px solid rgba(0,0,0,0.07)', color: log.type === 'charge' ? '#16A34A' : '#DC2626' }}>
                        {log.type === 'charge' ? '+' : '-'}{log.amount.toLocaleString()}P
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#475569', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                        {log.balance_after.toLocaleString()}P
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>
                사용 내역이 없어요
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}