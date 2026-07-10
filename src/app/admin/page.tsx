'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminPage() {
  const [stats, setStats] = useState({
    instructors: 0,
    requests: 0,
    notices: 0,
    faqs: 0,
  })
  const [instructors, setInstructors] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', is_published: true })
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [instRes, reqRes, noticeRes, faqRes] = await Promise.all([
      supabase.from('instructors').select('*').order('created_at', { ascending: false }),
      supabase.from('requests').select('*').order('created_at', { ascending: false }),
      supabase.from('notices').select('*').order('created_at', { ascending: false }),
      supabase.from('faq').select('*', { count: 'exact' }),
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
    if (!noticeForm.title || !noticeForm.content) {
      toast.error('제목과 내용을 입력해주세요')
      return
    }
    const { error } = await supabase.from('notices').insert([noticeForm])
    if (error) {
      toast.error('등록 실패: ' + error.message)
    } else {
      toast.success('공지사항이 등록됐어요!')
      setNoticeForm({ title: '', content: '', is_published: true })
      loadData()
    }
  }

  const handleDeleteNotice = async (id: string) => {
    const { error } = await supabase.from('notices').delete().eq('id', id)
    if (error) {
      toast.error('삭제 실패')
    } else {
      toast.success('삭제됐어요')
      loadData()
    }
  }

  const handleToggleInstructor = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('instructors')
      .update({ is_active: !current })
      .eq('id', id)
    if (error) {
      toast.error('변경 실패')
    } else {
      toast.success(current ? '비활성화했어요' : '활성화했어요')
      loadData()
    }
  }

  const handleTogglePremium = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('instructors')
      .update({ is_premium: !current })
      .eq('id', id)
    if (error) {
      toast.error('변경 실패')
    } else {
      toast.success(current ? '프리미엄 해제했어요' : '프리미엄 설정했어요')
      loadData()
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: '#94A3B8' }}>로딩 중...</div>
    </div>
  )

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="bottom-right" />

      <header style={{
        background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        padding: '0 20px', height: '56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}>
          강사아레나
        </Link>
        <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>🔐 관리자 모드</span>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>관리자 대시보드</div>

        <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          {['dashboard', 'instructors', 'requests', 'notices'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 16px', fontSize: '13px', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === tab ? '#2563EB' : '#475569',
              fontWeight: activeTab === tab ? '500' : '400',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
            } as React.CSSProperties}>
              {tab === 'dashboard' ? '대시보드' : tab === 'instructors' ? '강사 관리' : tab === 'requests' ? '의뢰 관리' : '공지 관리'}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { label: '등록 강사', value: stats.instructors, icon: '👨‍🏫' },
              { label: '강의 의뢰', value: stats.requests, icon: '📋' },
              { label: '공지사항', value: stats.notices, icon: '📢' },
              { label: 'FAQ', value: stats.faqs, icon: '❓' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '16px', padding: '20px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563EB' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'instructors' && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['이름', '분야', '프리미엄', '상태', '관리'].map(h => (
                    <th key={h} style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500', textAlign: 'left', padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instructors.map(inst => (
                  <tr key={inst.id}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>{inst.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>{inst.category || '-'}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                      <button onClick={() => handleTogglePremium(inst.id, inst.is_premium)} style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', border: 'none',
                        background: inst.is_premium ? '#FEF3C7' : '#F1F5F9', color: inst.is_premium ? '#92400E' : '#64748B'
                      }}>
                        {inst.is_premium ? '⭐ 프리미엄' : '일반'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500',
                        background: inst.is_active ? '#DCFCE7' : '#F1F5F9', color: inst.is_active ? '#166534' : '#64748B'
                      }}>
                        {inst.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                      <button onClick={() => handleToggleInstructor(inst.id, inst.is_active)} style={{
                        padding: '4px 10px', background: '#fff', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                      }}>
                        {inst.is_active ? '정지' : '활성화'}
                      </button>
                    </td>
                  </tr>
                ))}
                {instructors.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>등록된 강사가 없어요</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['제목', '기관', '상태', '등록일'].map(h => (
                    <th key={h} style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500', textAlign: 'left', padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>{req.title || req.topic || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>{req.organization_name || '-'}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', background: '#EFF6FF', color: '#2563EB' }}>
                        {req.status || '접수'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                      {new Date(req.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>등록된 의뢰가 없어요</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notices' && (
          <div>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>공지 등록</div>
              <input type="text" placeholder="공지 제목" value={noticeForm.title}
                onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                style={{ width: '100%', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea placeholder="공지 내용" value={noticeForm.content}
                onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                rows={4} style={{ width: '100%', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={noticeForm.is_published}
                    onChange={e => setNoticeForm({ ...noticeForm, is_published: e.target.checked })}
                    style={{ accentColor: '#2563EB' }} />
                  즉시 게시
                </label>
                <button onClick={handleNoticeSubmit} style={{ padding: '8px 20px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>등록</button>
              </div>
            </div>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['제목', '게시여부', '등록일', '관리'].map(h => (
                      <th key={h} style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500', textAlign: 'left', padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notices.map(notice => (
                    <tr key={notice.id}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>{notice.title}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', background: notice.is_published ? '#DCFCE7' : '#F1F5F9', color: notice.is_published ? '#166534' : '#64748B' }}>
                          {notice.is_published ? '게시중' : '미게시'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                        {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                        <button onClick={() => handleDeleteNotice(notice.id)} style={{ padding: '4px 10px', background: '#FEF2F2', border: 'none', borderRadius: '6px', fontSize: '11px', color: '#DC2626', cursor: 'pointer' }}>삭제</button>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>등록된 공지가 없어요</td></tr>
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