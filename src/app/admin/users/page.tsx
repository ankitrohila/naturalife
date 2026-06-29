'use client'

import { useEffect, useState } from 'react'

interface User { id: string; name: string; primaryEmail: string; primaryPhone: string; role: string; createdAt: string; _count?: { orders: number } }

const ROLES = ['ADMIN', 'DISTRIBUTOR', 'CUSTOMER']
const roleColor: Record<string, string> = {
  ADMIN: 'bg-[var(--green-light)] text-[var(--green-dark)]',
  DISTRIBUTOR: 'bg-blue-50 text-blue-700',
  CUSTOMER: 'bg-gray-100 text-gray-600',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = (query = '') => {
    setLoading(true)
    fetch(`/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`).then(r => r.json()).then(d => setUsers(d.users ?? [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  const changeRole = async (u: User, role: string) => {
    setMsg('')
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    const data = await res.json()
    if (res.ok) { setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role } : x)); setMsg(`${u.name} is now ${role}`) }
    else setMsg(data.error ?? 'Failed to update role')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Users &amp; Roles</h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1">Manage who has admin, distributor or customer access</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load(q) }} className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone…" className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]" />
        <button className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>Search</button>
      </form>
      {msg && <p className="text-sm text-[var(--green)] mb-3">{msg}</p>}

      <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--line)] text-sm text-[var(--ink-soft)]">{users.length} users</div>
        {loading ? <p className="p-8 text-center text-sm text-[var(--ink-soft)]">Loading…</p> : users.length === 0 ? <p className="p-8 text-center text-sm text-[var(--ink-soft)]">No users found</p> : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)] border-b border-[var(--line)]">
              <tr>
                {['User', 'Phone', 'Orders', 'Role', 'Set Role'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--surface)]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--ink)]">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.primaryEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-soft)] text-xs">{u.primaryPhone}</td>
                  <td className="px-4 py-3 text-[var(--ink-soft)]">{u._count?.orders ?? 0}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]}`}>{u.role}</span></td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="border border-[var(--line)] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[var(--green)]">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
