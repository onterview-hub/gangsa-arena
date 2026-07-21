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
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

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
    <div style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .side-item {
          transition: background 0.15s ease, color 0.15s ease;
        }
        .side-item:hover {
          background: #F1F5F9;
        }
        .charge-btn {
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
        }
        .charge-btn:hover {
          transform: translateY(-2px);
          border-color: #2563EB !important;
          background: #EFF6FF !important;
        }
        .dash-table tbody tr {
          transition: background 0.12s ease;
        }
        .dash-table tbody tr:hover {
          background: #F8FAFC;
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>

        {/* 사이드바 */}
        <div style={{
          width: '210px', background: '#fff',
          borderRight: '0.5px solid rgba(0,0,0,0.08)',
          padding: '24px 0', flexShrink: 0
        }}>
          <div style={{ padding: '0 20px 16px', fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            기업 대시보드
          </div>
          <div className="side-item" style={{
            padding: '11px 20px', fontSize: '13.5px',
            color: '#2563EB', background: '#EFF6FF',
            borderLeft: '3px solid #2563EB', fontWeight: '700'
          }}>💰 마일리지</div>
          <Link href="/dashboard/company/jobs" className="side-item" style={{
            padding: '11px 20px', fontSize: '13.5px',
            color: '#475569', display: 'block',
            textDecoration: 'none', borderLeft: '3px solid transparent', fontWeight: 500
          }}>📋 구인공고</Link>
          <Link href="/instructors" className="side-item" style={{
            padding: '11px 20px', fontSize: '13.5px',
            color: '#475569', display: 'block',
            textDecoration: 'none', borderLeft: '3px solid transparent', fontWeight: 500
          }}>🔍 강사검색</Link>
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, padding: '32px', maxWidth: '900px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#0F172A', letterSpacing: '-0.3px' }}>마일리지</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
            강사 연락처 열람에 사용됩니다 (1회 1,000P)
          </div>

          {/* 마일리지 현황 */}
          <div style={{
            background: 'linear-gradient(135deg, #0B1E4D 0%, #1E3A8A 100%)',
            borderRadius: '20px', padding: '28px', marginBottom: '20px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px',
            boxShadow: '0 12px 30px rgba(30,58,138,0.25)'
          }}>
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', fontWeight: 500 }}>보유 마일리지</div>
              <div style={{ fontSize: '38px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
                {balance.toLocaleString()}P
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 600 }}>충전 금액 선택</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[10000, 30000, 50000, 100000].map(amount => (
                  <button key={amount} className="charge-btn" onClick={() => handleCharge(amount)} style={{
                    background: 'rgba(255,255,255,0.95)', border: '1px solid transparent',
                    borderRadius: '10px', padding: '9px 15px',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: '#1E3A8A'
                  }}>
                    {amount.toLocaleString()}P
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#FCA5A5', marginTop: '10px', fontWeight: 600 }}>
                ⚠️ 보유+충전 합산 100,000P 초과 불가
              </div>
            </div>
          </div>

          {/* 사용 내역 */}
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
            borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '16px', color: '#0F172A' }}>사용 내역</div>
            {logs.length > 0 ? (
              <table className="dash-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['일시', '내용', '변동', '잔액'].map(h => (
                      <th key={h} style={{
                        fontSize: '12px', color: '#94A3B8', fontWeight: '700',
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
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, borderBottom: '0.5px solid rgba(0,0,0,0.07)', color: log.type === 'charge' ? '#16A34A' : '#DC2626' }}>
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
              <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontSize: '14px' }}>
                📭 사용 내역이 없어요
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}