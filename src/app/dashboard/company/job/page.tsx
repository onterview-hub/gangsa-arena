'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('job_openings')
      .select('*')
      .eq('company_id', user.id)
      .order('created_at', { ascending: false })

    setJobs(data || [])
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error('제목과 내용을 입력해주세요')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editId) {
      const { error } = await supabase
        .from('job_openings')
        .update({ title: form.title, content: form.content })
        .eq('id', editId)
      if (error) { toast.error('수정 실패') }
      else { toast.success('수정됐어요!'); setEditId(null); setForm({ title: '', content: '' }) }
    } else {
      const { error } = await supabase
        .from('job_openings')
        .insert([{ company_id: user.id, title: form.title, content: form.content, is_active: true }])
      if (error) { toast.error('등록 실패: ' + error.message) }
      else { toast.success('공고가 등록됐어요!'); setForm({ title: '', content: '' }) }
    }
    setSaving(false)
    loadJobs()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('job_openings').delete().eq('id', id)
    if (error) { toast.error('삭제 실패') }
    else { toast.success('삭제됐어요'); loadJobs() }
  }

  const handleEdit = (job: any) => {
    setEditId(job.id)
    setForm({ title: job.title, content: job.content })
    window.scrollTo(0, 0)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: '#94A3B8' }}>로딩 중...</div>
    </div>
  )

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="bottom-right" />

      {/* 헤더 */}
      <header style={{
        background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        padding: '0 20px', height: '56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}>
          강사아레나
        </Link>
        <Link href="/dashboard/company" style={{ fontSize: '13px', color: '#475569', textDecoration: 'none' }}>
          ← 대시보드
        </Link>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>구인공고</div>
        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>원하는 강사를 공개 모집할 수 있어요</div>

        {/* 등록/수정 폼 */}
        <div style={{
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
            {editId ? '✏️ 공고 수정' : '📝 공고 등록'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <input type="text" placeholder="공고 제목" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <textarea placeholder="모집 조건, 강의 내용, 일정 등을 입력하세요" value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSubmit} disabled={saving} style={{
              padding: '10px 20px', background: '#2563EB', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer'
            }}>
              {saving ? '저장 중...' : editId ? '수정 완료' : '등록'}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ title: '', content: '' }) }} style={{
                padding: '10px 20px', background: '#F1F5F9', color: '#475569',
                border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
              }}>취소</button>
            )}
          </div>
        </div>

        {/* 공고 목록 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.07)', fontSize: '14px', fontWeight: '600' }}>
            등록된 공고 ({jobs.length})
          </div>
          {jobs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
              등록된 공고가 없어요
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} style={{
                padding: '16px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.07)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#0F172A', marginBottom: '4px' }}>
                    {job.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {new Date(job.created_at).toLocaleDateString('ko-KR')}
                    {' · '}
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px',
                      background: job.is_active ? '#DCFCE7' : '#F1F5F9',
                      color: job.is_active ? '#166534' : '#64748B'
                    }}>
                      {job.is_active ? '진행중' : '마감'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(job)} style={{
                    padding: '6px 12px', background: '#F8FAFC',
                    border: '0.5px solid rgba(0,0,0,0.18)',
                    borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
                  }}>수정</button>
                  <button onClick={() => handleDelete(job.id)} style={{
                    padding: '6px 12px', background: '#FEF2F2',
                    border: 'none', borderRadius: '6px',
                    fontSize: '12px', color: '#DC2626', cursor: 'pointer'
                  }}>삭제</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}