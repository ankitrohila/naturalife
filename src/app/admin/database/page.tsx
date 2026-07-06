'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Plus, X, Save } from 'lucide-react'

interface ModelInfo { key: string; label: string; count: number }

export default function DatabaseManagerPage() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editingRow, setEditingRow] = useState<any | null>(null)
  const [editJson, setEditJson] = useState('')
  const [error, setError] = useState('')
  const [forbidden, setForbidden] = useState(false);

  const fetchModels = useCallback(async () => {
    const res = await fetch('/api/admin/database')
    if (res.status === 403) { setForbidden(true); setLoading(false); return }
    const data = await res.json()
    setModels(data.models ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])

  const fetchRows = useCallback(async (model: string, p: number) => {
    setLoading(true)
    const res = await fetch(`/api/admin/database/${model}?page=${p}`)
    const data = await res.json()
    setRows(data.rows ?? [])
    setTotal(data.total ?? 0)
    setTotalPages(data.totalPages ?? 1)
    setLoading(false)
  }, [])

  const openModel = (key: string) => {
    setActiveModel(key)
    setPage(1)
    fetchRows(key, 1)
  }

  const saveEdit = async () => {
    if (!activeModel || !editingRow) return
    setError('')
    let data: any
    try { data = JSON.parse(editJson) } catch { setError('Invalid JSON'); return }
    const res = await fetch(`/api/admin/database/${activeModel}/${editingRow.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (res.ok) { setEditingRow(null); fetchRows(activeModel, page) }
    else { const d = await res.json(); setError(d.error ?? 'Update failed') }
  }

  const deleteRow = async (id: string) => {
    if (!activeModel || !confirm('Permanently delete this row?')) return
    const res = await fetch(`/api/admin/database/${activeModel}/${id}`, { method: 'DELETE' })
    if (res.ok) fetchRows(activeModel, page)
    else { const d = await res.json(); alert(d.error ?? 'Delete failed') }
  }

  if (forbidden) {
    return (
      <div className="text-center py-24">
        <p className="text-lg font-semibold text-red-500">Access Restricted</p>
        <p className="text-sm text-gray-500 mt-2">This section is only available to Master Admin accounts.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Database Manager</h1>
        <p className="text-sm text-gray-500">Master Admin only — browse and edit records through a controlled interface.</p>
      </div>

      <div className="flex gap-6">
        <aside className="w-56 shrink-0 bg-white border border-gray-100 shadow-sm">
          {models.map((m) => (
            <button
              key={m.key}
              onClick={() => openModel(m.key)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 flex items-center justify-between transition-colors ${activeModel === m.key ? 'bg-[var(--green)] text-white' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <span>{m.label}</span>
              <span className={activeModel === m.key ? 'text-white/80' : 'text-gray-400'}>{m.count}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 min-w-0">
          {!activeModel ? (
            <div className="bg-white border border-gray-100 py-20 text-center text-sm text-gray-400">Select a table to browse</div>
          ) : (
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{models.find((m) => m.key === activeModel)?.label} ({total})</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {rows[0] && Object.keys(rows[0]).slice(0, 6).map((k) => (
                        <th key={k} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase whitespace-nowrap">{k}</th>
                      ))}
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr><td className="px-3 py-8 text-center text-gray-400" colSpan={7}>Loading...</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td className="px-3 py-8 text-center text-gray-400" colSpan={7}>No rows</td></tr>
                    ) : rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {Object.keys(rows[0]).slice(0, 6).map((k) => (
                          <td key={k} className="px-3 py-2 text-gray-700 max-w-[160px] truncate">{typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k] ?? '—')}</td>
                        ))}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button onClick={() => { setEditingRow(row); setEditJson(JSON.stringify(row, null, 2)); setError('') }} className="text-blue-500 hover:underline mr-2">Edit</button>
                          <button onClick={() => deleteRow(row.id)} className="text-red-500 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 py-3 border-t border-gray-100">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => { setPage(i + 1); fetchRows(activeModel, i + 1) }} className={`px-3 py-1 text-xs border ${page === i + 1 ? 'text-white' : 'text-gray-600'}`} style={page === i + 1 ? { backgroundColor: 'var(--green)', borderColor: 'var(--green)' } : {}}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editingRow && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingRow(null)}>
          <div className="bg-white w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Row</h2>
              <button onClick={() => setEditingRow(null)} aria-label="Close"><X size={18} /></button>
            </div>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <textarea value={editJson} onChange={(e) => setEditJson(e.target.value)} rows={16} className="w-full border border-gray-300 px-3 py-2 text-xs font-mono" />
            <button onClick={saveEdit} className="mt-3 flex items-center gap-2 px-5 py-2 text-white text-sm font-semibold" style={{ backgroundColor: 'var(--green)' }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
