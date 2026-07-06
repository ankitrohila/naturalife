'use client'

import { useState, useEffect, useCallback } from 'react'
import { Inbox, User as UserIcon, Eye, Trash2, RotateCcw } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  category: string
  priority: string
  status: string
  assignedTo: string | null
  isTrashed: boolean
  updatedAt: string
  createdAt: string
  user: { name: string; primaryEmail: string }
  messages: { message: string; senderRole: string }[]
  _count: { messages: number }
}

interface Admin { id: string; name: string }

const STATUS_LIST = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']
const PRIORITY_LIST = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const CATEGORY_LIST = ['General', 'Order Issue', 'Product Quality', 'Shipping & Delivery', 'Returns & Refunds', 'Wholesale']
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#f59e0b', PENDING: '#3b82f6', RESOLVED: '#16a34a', CLOSED: '#9ca3af',
}
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#9ca3af', MEDIUM: '#3b82f6', HIGH: '#f97316', URGENT: '#ef4444',
}

const VIEW_TABS = [
  { key: 'all', label: 'All Tickets', icon: Inbox },
  { key: 'mine', label: 'My Tickets', icon: UserIcon },
  { key: 'unassigned', label: 'Unassigned', icon: Eye },
  { key: 'trashed', label: 'Trashed', icon: Trash2 },
] as const

const STATUS_GROUPS = [
  { key: 'active', label: 'Active' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
] as const

interface Message { id: string; senderRole: string; senderName: string; message: string; createdAt: string }

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({ all: 0, mine: 0, unassigned: 0, trashed: 0 })
  const [admins, setAdmins] = useState<Admin[]>([])

  const [view, setView] = useState<typeof VIEW_TABS[number]['key']>('all')
  const [statusGroup, setStatusGroup] = useState<typeof STATUS_GROUPS[number]['key']>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')

  const [activeTicket, setActiveTicket] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('view', view)
    params.set('statusGroup', statusGroup)
    if (categoryFilter) params.set('category', categoryFilter)
    if (agentFilter) params.set('agent', agentFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    if (search) params.set('search', search)
    params.set('sort', sort)
    const res = await fetch(`/api/admin/tickets?${params.toString()}`)
    const data = await res.json()
    setTickets(data.tickets ?? [])
    setStatusCounts(data.statusCounts ?? {})
    setViewCounts(data.viewCounts ?? { all: 0, mine: 0, unassigned: 0, trashed: 0 })
    setAdmins(data.admins ?? [])
    setSelected(new Set())
    setLoading(false)
  }, [view, statusGroup, categoryFilter, agentFilter, priorityFilter, sort, search])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const resetFilters = () => {
    setCategoryFilter(''); setAgentFilter(''); setPriorityFilter(''); setSort('newest'); setSearch(''); setSearchInput('')
  }
  const activeFilterCount = [categoryFilter, agentFilter, priorityFilter, search].filter(Boolean).length

  const openTicket = async (id: string) => {
    setActiveTicket(id)
    const res = await fetch(`/api/tickets/${id}`)
    const data = await res.json()
    setMessages(data.ticket?.messages ?? [])
  }

  const updateField = async (id: string, field: 'status' | 'priority' | 'assignedTo', value: string) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: field === 'assignedTo' ? (value || null) : value }),
    })
    fetchTickets()
  }

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !activeTicket) return
    await fetch(`/api/tickets/${activeTicket}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: reply }),
    })
    setReply('')
    openTicket(activeTicket)
    fetchTickets()
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === tickets.length ? new Set() : new Set(tickets.map((t) => t.id))))
  }

  const applyBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return
    if (bulkAction === 'delete' && !confirm(`Permanently delete ${selected.size} ticket(s)? This cannot be undone.`)) return
    await fetch('/api/admin/tickets/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], action: bulkAction }),
    })
    setBulkAction('')
    setActiveTicket(null)
    fetchTickets()
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-sm text-gray-500">Track and resolve every customer complaint</p>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
        {VIEW_TABS.map((tab) => {
          const Icon = tab.icon
          const active = view === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active ? 'border-[var(--green)] text-[var(--green)]' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon size={15} /> {tab.label}
              <span className="text-xs text-gray-400">({viewCounts[tab.key] ?? 0})</span>
            </button>
          )
        })}
      </div>

      {/* Status pills + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {STATUS_GROUPS.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusGroup(s.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                statusGroup === s.key ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              style={statusGroup === s.key ? { backgroundColor: 'var(--green)' } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>
        <form onSubmit={submitSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search keyword..."
            className="border border-gray-300 px-3 py-1.5 text-sm w-52"
          />
          <button type="submit" className="px-3 py-1.5 text-white text-sm font-medium" style={{ backgroundColor: 'var(--green)' }}>Search</button>
        </form>
      </div>

      {/* Filter dropdowns */}
      <div className="bg-white border border-gray-100 p-4 mb-5 flex flex-wrap items-center gap-3 shadow-sm">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {CATEGORY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Agents</option>
          <option value="unassigned">Unassigned</option>
          {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Priorities</option>
          {PRIORITY_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="priority">Sort: Priority</option>
        </select>
        {activeFilterCount > 0 && (
          <button onClick={resetFilters} className="px-3 py-2 text-sm text-gray-500 hover:text-red-500">
            Reset Filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-3 mb-3">
        <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">Bulk Actions</option>
          <option value="assign_me">Assign to Me</option>
          <option value="unassign">Unassign</option>
          <option value="resolve">Mark Resolved</option>
          <option value="close">Mark Closed</option>
          {view === 'trashed' ? (
            <>
              <option value="restore">Restore</option>
              <option value="delete">Delete Permanently</option>
            </>
          ) : (
            <option value="trash">Move to Trash</option>
          )}
        </select>
        <button onClick={applyBulkAction} disabled={!bulkAction || selected.size === 0} className="px-4 py-2 text-white text-sm font-medium disabled:opacity-40" style={{ backgroundColor: 'var(--green)' }}>
          Apply
        </button>
        <span className="text-xs text-gray-400 ml-auto">{selected.size > 0 ? `${selected.size} selected · ` : ''}Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={tickets.length > 0 && selected.size === tickets.length} onChange={toggleSelectAll} />
                </th>
                {['Title', 'Reply', 'Agent', 'Priority', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No tickets found</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.id} className={`hover:bg-gray-50 cursor-pointer ${activeTicket === t.id ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800" onClick={() => openTicket(t.id)}>
                    {t.subject}
                    <span className="block text-xs text-gray-400">{t.category} · {t.user.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate" onClick={() => openTicket(t.id)}>
                    {t.messages[0]?.message ?? '—'}
                    <span className="block text-xs text-gray-400">{t._count.messages} msg{t._count.messages !== 1 ? 's' : ''}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select value={t.assignedTo ?? ''} onChange={(e) => updateField(t.id, 'assignedTo', e.target.value)} className="text-xs px-2 py-1 border border-gray-200">
                      <option value="">Unassigned</option>
                      {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select value={t.priority} onChange={(e) => updateField(t.id, 'priority', e.target.value)} className="text-xs font-semibold px-2 py-1 border-0" style={{ backgroundColor: `${PRIORITY_COLORS[t.priority]}20`, color: PRIORITY_COLORS[t.priority] }}>
                      {PRIORITY_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select value={t.status} onChange={(e) => updateField(t.id, 'status', e.target.value)} className="text-xs font-semibold px-2 py-1 border-0" style={{ backgroundColor: `${STATUS_COLORS[t.status]}20`, color: STATUS_COLORS[t.status] }}>
                      {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap" onClick={() => openTicket(t.id)}>{new Date(t.updatedAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Thread panel */}
        <div className="bg-white border border-gray-100 shadow-sm p-4">
          {!activeTicket ? (
            <p className="text-sm text-gray-400 text-center py-10">Select a ticket to view the conversation</p>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conversation</p>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-3">
                {messages.map((m) => (
                  <div key={m.id} className="text-sm">
                    <p className="text-xs font-semibold text-gray-500">{m.senderName} {m.senderRole === 'ADMIN' && '(You)'}</p>
                    <p className="text-gray-800">{m.message}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="flex gap-2">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Reply to customer..." className="flex-1 border border-gray-300 px-3 py-2 text-sm" />
                <button type="submit" className="px-4 text-white text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>Send</button>
              </form>
              <div className="flex gap-3 mt-3">
                {tickets.find((t) => t.id === activeTicket)?.isTrashed ? (
                  <button
                    onClick={async () => { await fetch('/api/admin/tickets/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [activeTicket], action: 'restore' }) }); setActiveTicket(null); fetchTickets() }}
                    className="text-xs font-medium flex items-center gap-1 hover:underline"
                    style={{ color: 'var(--green)' }}
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                ) : (
                  <button
                    onClick={async () => { await fetch('/api/admin/tickets/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [activeTicket], action: 'trash' }) }); setActiveTicket(null); fetchTickets() }}
                    className="text-xs font-medium flex items-center gap-1 text-red-500 hover:underline"
                  >
                    <Trash2 size={12} /> Move to Trash
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {STATUS_LIST.map((s) => (
          <div key={s} className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s}</p>
            <p className="text-xl font-bold" style={{ color: STATUS_COLORS[s] }}>{statusCounts[s] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
