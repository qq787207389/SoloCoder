import type { Metadata } from 'next'
import { TRPCProvider } from '@/src/trpc/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zan - 点赞功能演示',
  description: '带乐观更新的点赞功能',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
