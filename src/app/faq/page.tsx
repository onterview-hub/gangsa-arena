'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    const { data } = await supabase
      .from('faq')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
    setFaqs(data || [])
    setLoading(false)
  }

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  // 데이터 없을 때 보여줄 기본 FAQ
  const defaultFaqs = [
    {
      id: '1',
      question: '강사 등록은 무료인가요?',
      answer: '네, 강사 등록은 완전 무료입니다. 프로필을 등록하고 기업의 연락을 받을 수 있어요. 프리미엄 멤버십(월 5,500원)을 통해 상단에 노출되고 배지를 받을 수 있습니다.'
    },
    {
      id: '2',
      question: '연락처 열람 비용은 얼마인가요?',
      answer: '강사 연락처 열람 시 1,000 마일리지가 차감됩니다. 마일리지는 대시보드에서 충전하실 수 있어요. 열람 후 환불은 불가합니다.'
    },
    {
      id: '3',
      question: 'PDF 제안서 다운로드는 누가 가능한가요?',
      answer: '기업 회원만 PDF 다운로드가 가능합니다. 비회원이나 강사 회원은 다운로드가 제한됩니다.'
    },
    {
      id: '4',
      question: '섭외 수수료는 어떻게 되나요?',
      answer: '플랫폼 수수료는 강사료의 20%입니다. 강의 의뢰 등록 시 자동으로 계산해드려요.'
    },
    {
      id: '5',
      question: '프리미엄 강사 혜택은 무엇인가요?',
      answer: '프리미엄 강사(월 5,500원)는 검색 결과 상단에 노출되고, 프로필에 프리미엄 배지가 표시됩니다. 홈 화면 프리미엄 강사 섹션에도 노출됩니다.'
    },
  ]

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh' }}>
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
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/instructors" style={{ padding: '6px 10px', color: '#475569', fontSize: '13px', textDecoration: 'none' }}>강사검색</Link>
          <Link href="/notices" style={{ padding: '6px 10px', color: '#475569', fontSize: '13px', textDecoration: 'none' }}>공지사항</Link>
          <Link href="/faq" style={{ padding: '6px 10px', color: '#2563EB', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>FAQ</Link>
          <Link href="/login" style={{
            marginLeft: '8px', padding: '6px 14px',
            background: '#2563EB', color: '#fff',
            borderRadius: '12px', fontSize: '13px',
            textDecoration: 'none', fontWeight: '500'
          }}>로그인</Link>
        </nav>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>자주 묻는 질문</div>
        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>궁금한 점을 확인해보세요</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>로딩 중...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayFaqs.map(faq => (
              <div key={faq.id} style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px', overflow: 'hidden'
              }}>
                <div onClick={() => toggleFaq(faq.id)} style={{
                  padding: '16px 20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#2563EB', fontSize: '16px', fontWeight: '700' }}>Q</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#0F172A' }}>
                      {faq.question}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '18px', color: '#94A3B8',
                    transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s'
                  }}>
                    ∨
                  </span>
                </div>
                {openId === faq.id && (
                  <div style={{
                    padding: '0 20px 16px 20px',
                    borderTop: '0.5px solid rgba(0,0,0,0.07)'
                  }}>
                    <div style={{
                      paddingTop: '14px', fontSize: '14px',
                      color: '#475569', lineHeight: '1.7'
                    }}>
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}