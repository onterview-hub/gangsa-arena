'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminPage() {
  const [stats, setStats] = useState({ instructors: 0, requests: 0, notices: 0, faqs: 0 })
  const [instructors, setInstructors] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', is_published: true })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [instRes, reqRes, noticeRes, faqRes] = await Promise.all([
      supabase.from('instructors').select('*').order('created_at', { ascending: false }),
      supabase.from('requests').select('*').order('created_at', { ascending: false }),
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      supabase.from('faq').select('*'),
    ])
    setInstructors(instRes.data || [])
    setRequests(reqRes.data || [])
    setNotices(noticeRes.data || [])
    setStats({
      instructors: instRes.data?.length || 0,
      requests: reqRes.data?.length || 0,
      notices: noticeRes.data?.length || 0,
      faqs: faqRes.data?.length || 0,
    })
    setLoading(false)
  }

  const handleNoticeSubmit = async () => {
    if (!noticeForm.title || !noticeForm.content) { toast.error('제목과 내용을 입력해주세요'); return }
    const { error } = await supabase.from('notices').insert([noticeForm])
    if (error) { toast.error('등록 실패: ' + error.message) }
    else { toast.success('공지사항이 등록됐어요!'); setNoticeForm({ title: '', content: '', is_published: true }); loadData() }
  }

  const handleDeleteNotice = async (id: string) => {
    const { error } = await supabase.from('notices').delete().eq('id', id)
    if (error) { toast.error('삭제 실패') }
    else { toast.success('삭제됐어요'); loadData() }
  }

  const handleToggleInstructor = async (id: string, current: boolean) => {
    const { error } = await supabase.from('instructors').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error('변경 실패') }
    else { toast.success(current ? '비활성화했어요' : '활성화했어요'); loadData() }
  }

  const handleTogglePremium = async (id: string, current: boolean) => {
    const { error } = await supabase.from('instructors').update({ is_premium: !current }).eq('id', id)
    if (error) { toast.error('변경 실패') }
    else { toast.success(current ? '프리미엄 해제했어요' : '프리미엄 설정했어요'); loadData() }
  }

  const TABS = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'instructors', label: '강사 관리' },
    { id: 'requests', label: '의뢰 관리' },
    { id: 'notices', label: '공지 관리' },
  ]

  const thStyle = { fontSize: '11.5px', color: '#94A3B8', fontWeight: '700', textAlign: 'left' as const, padding: '13px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.08)', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }
  const tdStyle = { padding: '13px 16px', fontSize: '13.5px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }

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

        .admin-tab { transition: color 0.15s ease, border-color 0.15s ease; }
        .admin-tab:hover { color: #2563EB; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,23,42,0.08); }
        .admin-table tbody tr { transition: background 0.12s ease; }
        .admin-table tbody tr:hover { background: #F8FAFC; }
        .pill-btn { transition: transform 0.12s ease, filter 0.12s ease; }
        .pill-btn:hover { transform: translateY(-1px); filter: brightness(0.97); }
        .submit-notice-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .submit-notice-btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
      `}</style>

      {/* 관리자 전용 헤더 */}
      <header style={{
        background: 'linear-gradient(135deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '0 24px', height: '58px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link href="/" style={{ fontSize: '17px', fontWeight: '800', color: '#fff', textDecoration: 'none' }}>
          강사아레나
        </Link>
        <span style={{ fontSize: '12.5px', color: '#FCA5A5', fontWeight: '700', background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px' }}>
          🔐 관리자 모드
        </span>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', color: '#0F172A', letterSpacing: '-0.3px' }}>관리자 대시보드</div>

        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          {TABS.map(tab => (
            <button key={tab.id} className="admin-tab" onClick={() => setActiveTab(tab.id)} style={{
              padding: '11px 18px', fontSize: '13.5px', cursor: 'pointer',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              fontWeight: activeTab === tab.id ? '700' : '600',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '2.5px solid #2563EB' : '2.5px solid transparent'
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '16px' }}>
            {[
              { label: '등록 강사', value: stats.instructors, icon: '👨‍🏫' },
              { label: '강의 의뢰', value: stats.requests, icon: '📋' },
              { label: '공지사항', value: stats.notices, icon: '📢' },
              { label: 'FAQ', value: stats.faqs, icon: '❓' },
            ].map(stat => (
              <div key={stat.label} className="stat-card" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{stat.icon}</div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: '#1E3A8A', letterSpacing: '-0.5px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'instructors' && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['이름', '분야', '프리미엄', '상태', '관리'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instructors.map(inst => (
                  <tr key={inst.id}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0F172A' }}>{inst.name}</td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{inst.category || '-'}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleTogglePremium(inst.id, inst.is_premium)} className="pill-btn" style={{
                        padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', border: 'none',
                        background: inst.is_premium ? '#FEF3C7' : '#F1F5F9', color: inst.is_premium ? '#92400E' : '#64748B'
                      }}>
                        {inst.is_premium ? '⭐ 프리미엄' : '일반'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: inst.is_active ? '#DCFCE7' : '#F1F5F9', color: inst.is_active ? '#166534' : '#64748B'
                      }}>
                        {inst.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleToggleInstructor(inst.id, inst.is_active)} className="pill-btn" style={{
                        padding: '5px 12px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer'
                      }}>
                        {inst.is_active ? '정지' : '활성화'}
                      </button>
                    </td>
                  </tr>
                ))}
                {instructors.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>등록된 강사가 없어요</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['제목', '기업/기관', '상태', '등록일'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0F172A' }}>{req.title || '-'}</td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{req.company_name || '-'}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#EFF6FF', color: '#2563EB' }}>
                        {req.status || '접수'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#475569' }}>
                      {req.created_at ? new Date(req.created_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>등록된 의뢰가 없어요</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notices' && (
          <div>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '26px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '16px', color: '#0F172A' }}>📝 공지 등록</div>
              <input type="text" placeholder="공지 제목" value={noticeForm.title}
                onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea placeholder="공지 내용" value={noticeForm.content}
                onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                rows={4} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '14px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                  <input type="checkbox" checked={noticeForm.is_published}
                    onChange={e => setNoticeForm({ ...noticeForm, is_published: e.target.checked })}
                    style={{ accentColor: '#2563EB' }} />
                  즉시 게시
                </label>
                <button onClick={handleNoticeSubmit} className="submit-notice-btn" style={{
                  padding: '9px 22px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
                  border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                }}>등록</button>
              </div>
            </div>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['제목', '게시여부', '등록일', '관리'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notices.map(notice => (
                    <tr key={notice.id}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0F172A' }}>{notice.title}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: notice.is_published ? '#DCFCE7' : '#F1F5F9', color: notice.is_published ? '#166534' : '#64748B' }}>
                          {notice.is_published ? '게시중' : '미게시'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#475569' }}>
                        {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => handleDeleteNotice(notice.id)} className="pill-btn" style={{ padding: '5px 12px', background: '#FEF2F2', border: 'none', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>삭제</button>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>등록된 공지가 없어요</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}