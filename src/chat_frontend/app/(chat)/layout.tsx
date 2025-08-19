import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CipherNest Chat - Post-Quantum Secure Messaging',
  description: 'Secure, ephemeral messaging with post-quantum cryptography',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col">
      {children}
    </div>
  )
}
