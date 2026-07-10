import type { Metadata } from 'next'
import Header from '@/components/Header'
import './globals.css' // 프로젝트 상황에 맞게 유지

export const metadata: Metadata = {
  title: '강사아레나 - 기업 강사 매칭 플랫폼',
  description: '최적의 강사 매칭 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, background: '#F8FAFC' }}>
        <Header />
        {children}
      </body>
    </html>
  )
}