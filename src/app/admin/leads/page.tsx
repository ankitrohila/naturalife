'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, Trash2 } from 'lucide-react'

interface Lead {
  id: string
  formKey: string
  form: { name: string; key: string }
  name: string
  email: string | null
  phone: string | null
  data: Record<string, string>
  imageUrl: string | null
  status: string
  notes: string | null
  createdAt: string
}
interface FormOption { key: string; name: string }
interface ContactEnquiry { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; status: string; createdAt: string }
interface EmailSub { id: string; email: string; name: string | null; subscribedAt: string; isActive: boolean }

const LEAD_STATUS_LIST = ['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'LOST']
const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: '#f59e0b', CONTACTED: '#3b82f6', QUOTED: '#8b5cf6', CONVERTED: '#16a34a', LOST: '#ef4444',
}
const CONTACT_STATUS_LIST = ['NEW', 'REPLIED', 'CLOSED']
const CONTACT_STATUS_COLORS: Record<string, string> = { NEW: '#f59e0b', REPLIED: '#3b82f6', CLOSED: '#16a34a' }

const TABS = [
  { key: 'leads', label: 'Form Leads' },
  { key: 'contact', label: 'Contact Enquiries' },
  { key: 'subscriptions', label: 'Email Subscriptions' },
] as const

function LeadsTab({ initialFormFilter }: { initialFormFilter: string }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [forms, setForms] = useState<FormOption[]>([])
  const [total, setTotal] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [formFilter, setFormFilter] = useState(initialFormFilter)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (formFilter) params.set('formKey', formFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/leads?${params.toString()}`)
    const data = await res.json()
    setLeads(data.leads ?? [])
    setForms(data.forms ?? [])
    setTotal(data.total ?? 0)
    setStatusCounts(data.statusCounts ?? {})
    setLoading(false)
  }, [formFilter, statusFilter, search])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchLeads()
  }
  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
    fetchLeads()
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{total} total submissions</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {LEAD_STATUS_LIST.map((s) => (
          <div key={s} className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s}</p>
            <p className="text-xl font-bold" style={{ color: LEAD_STATUS_COLORS[s] }}>{statusCounts[s] ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 shadow-sm">
        <select value={formFilter} onChange={(e) => setFormFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Forms</option>
          {forms.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {LEAD_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="border border-gray-300 px-3 py-2 text-sm flex-1 min-w-48" />
      </div>
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name', 'Contact', 'Form', 'Status', 'Date', ''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No leads found</td></tr>
            ) : leads.map((lead) => (
              <Fragment key={lead.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <button onClick={() => setExpanded(expanded === lead.id ? null : lead.id)} className="flex items-center gap-1 hover:text-[var(--green)]">
                      {lead.name} <ChevronDown size={14} className={`transition-transform ${expanded === lead.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.email ?? '—'}{lead.phone ? ` · ${lead.phone}` : ''}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.form?.name ?? lead.formKey}</td>
                  <td className="px-4 py-3">
                    <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} className="text-xs font-semibold px-2 py-1 border-0" style={{ backgroundColor: `${LEAD_STATUS_COLORS[lead.status]}20`, color: LEAD_STATUS_COLORS[lead.status] }}>
                      {LEAD_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(lead.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteLead(lead.id)} aria-label="Delete" className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
                {expanded === lead.id && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 bg-gray-50">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          {Object.entries(lead.data).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs py-1 border-b border-gray-100">
                              <span className="text-gray-500 capitalize">{k}</span>
                              <span className="text-gray-800 font-medium">{v || '—'}</span>
                            </div>
                          ))}
                        </div>
                        {lead.imageUrl && (
                          <div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lead.imageUrl} alt="Reference" className="w-40 h-40 object-cover border border-gray-200" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ContactEnquiriesTab() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([])
  const [total, setTotal] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/contact-enquiries?${params.toString()}`)
    const data = await res.json()
    setEnquiries(data.enquiries ?? [])
    setTotal(data.total ?? 0)
    setStatusCounts(data.statusCounts ?? {})
    setLoading(false)
  }, [statusFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/contact-enquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchData()
  }
  const remove = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return
    await fetch(`/api/admin/contact-enquiries/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{total} contact form submissions</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {CONTACT_STATUS_LIST.map((s) => (
          <div key={s} className="bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s}</p>
            <p className="text-xl font-bold" style={{ color: CONTACT_STATUS_COLORS[s] }}>{statusCounts[s] ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 shadow-sm">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {CONTACT_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, message..." className="border border-gray-300 px-3 py-2 text-sm flex-1 min-w-48" />
      </div>
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name', 'Contact', 'Subject', 'Status', 'Date', ''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : enquiries.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No contact enquiries found</td></tr>
            ) : enquiries.map((c) => (
              <Fragment key={c.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="flex items-center gap-1 hover:text-[var(--green)]">
                      {c.name} <ChevronDown size={14} className={`transition-transform ${expanded === c.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}{c.phone ? ` · ${c.phone}` : ''}</td>
                  <td className="px-4 py-3 text-gray-600">{c.subject ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select value={c.status} onChange={(e) => updateStatus(c.id, e.target.value)} className="text-xs font-semibold px-2 py-1 border-0" style={{ backgroundColor: `${CONTACT_STATUS_COLORS[c.status]}20`, color: CONTACT_STATUS_COLORS[c.status] }}>
                      {CONTACT_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(c.id)} aria-label="Delete" className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
                {expanded === c.id && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 bg-gray-50 text-sm text-gray-700">{c.message}</td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmailSubscriptionsTab() {
  const [subs, setSubs] = useState<EmailSub[]>([])
  const [total, setTotal] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/email-subscriptions?${params.toString()}`)
    const data = await res.json()
    setSubs(data.subscriptions ?? [])
    setTotal(data.total ?? 0)
    setActiveCount(data.activeCount ?? 0)
    setLoading(false)
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  const remove = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return
    await fetch(`/api/admin/email-subscriptions/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{total} total subscribers · {activeCount} active</p>
      <div className="bg-white border border-gray-100 p-4 mb-5 shadow-sm">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or name..." className="border border-gray-300 px-3 py-2 text-sm w-full max-w-sm" />
      </div>
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Email', 'Name', 'Status', 'Subscribed', ''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : subs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No subscribers found</td></tr>
            ) : subs.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.email}</td>
                <td className="px-4 py-3 text-gray-600">{s.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 font-medium ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'ACTIVE' : 'UNSUBSCRIBED'}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(s.subscribedAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(s.id)} aria-label="Delete" className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminLeadsPage() {
  const searchParams = useSearchParams()
  const initialFormFilter = searchParams.get('form') ?? ''
  const [tab, setTab] = useState<typeof TABS[number]['key']>('leads')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads &amp; Form Submissions</h1>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[var(--green)] text-[var(--green)]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'leads' && <LeadsTab initialFormFilter={initialFormFilter} />}
      {tab === 'contact' && <ContactEnquiriesTab />}
      {tab === 'subscriptions' && <EmailSubscriptionsTab />}
    </div>
  )
}
