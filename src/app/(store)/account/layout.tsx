import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccountSidebar } from '@/components/account/AccountSidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account')

  return (
    <main className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--ivory)' }}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        <AccountSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </main>
  )
}
