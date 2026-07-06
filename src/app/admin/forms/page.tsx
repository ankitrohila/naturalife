'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, X, Trash2, Pencil } from 'lucide-react'

interface FieldDef { name: string; label: string; type: 'text' | 'tel' | 'email' | 'select' | 'textarea'; required: boolean; options?: string[] }
interface FormDef { key: string; name: string; fields: FieldDef[]; isActive: boolean; createdAt: string; _count: { leads: number } }

const FIELD_TYPES = ['text', 'tel', 'email', 'select', 'textarea'] as const

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function emptyField(): FieldDef {
  return { name: '', label: '', type: 'text', required: false }
}

export default function AdminFormsPage() {
  const [forms, setForms] = useState<FormDef[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<FormDef | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchForms = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/forms')
    const data = await res.json()
    setForms(data.forms ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchForms() }, [fetchForms])

  const toggleActive = async (form: FormDef) => {
    await fetch(`/api/admin/forms/${form.key}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !form.isActive }),
    })
    fetchForms()
  }

  const remove = async (form: FormDef) => {
    if (!confirm(`Delete the "${form.name}" form definition?`)) return
    const res = await fetch(`/api/admin/forms/${form.key}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error); return }
    fetchForms()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Create and edit the custom forms used across the site (e.g. Custom Design Request)</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-medium" style={{ backgroundColor: 'var(--green)' }}>
          <Plus size={16} /> Create Form
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Key', 'Fields', 'Submissions', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : forms.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No forms yet — create one to get started</td></tr>
            ) : forms.map((f) => (
              <tr key={f.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{f.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{f.key}</td>
                <td className="px-4 py-3 text-gray-600">{f.fields.length}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads?form=${f.key}`} className="font-semibold hover:underline" style={{ color: 'var(--green)' }}>
                    {f._count.leads}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(f)}
                    className={`text-xs px-2 py-0.5 font-medium ${f.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {f.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setEditing(f)} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--green)' }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => remove(f)} className="text-xs font-medium flex items-center gap-1 text-red-500 hover:underline">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <FormEditorModal
          form={editing}
          onClose={() => { setCreating(false); setEditing(null) }}
          onSaved={() => { setCreating(false); setEditing(null); fetchForms() }}
        />
      )}
    </div>
  )
}

function FormEditorModal({ form, onClose, onSaved }: { form: FormDef | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!form
  const [name, setName] = useState(form?.name ?? '')
  const [key, setKey] = useState(form?.key ?? '')
  const [keyTouched, setKeyTouched] = useState(isEdit)
  const [fields, setFields] = useState<FieldDef[]>(form?.fields?.length ? form.fields : [emptyField()])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateName = (v: string) => {
    setName(v)
    if (!keyTouched) setKey(slugify(v))
  }

  const updateField = (i: number, patch: Partial<FieldDef>) => {
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  }
  const addField = () => setFields((prev) => [...prev, emptyField()])
  const removeField = (i: number) => setFields((prev) => prev.filter((_, idx) => idx !== i))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !key.trim()) { setError('Name and key are required'); return }
    if (fields.some((f) => !f.name.trim() || !f.label.trim())) { setError('Every field needs a name and label'); return }

    setSaving(true)
    const payload = {
      name,
      fields: fields.map((f) => ({
        ...f,
        options: f.type === 'select' ? (f.options ?? []) : undefined,
      })),
    }
    const res = isEdit
      ? await fetch(`/api/admin/forms/${form!.key}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/admin/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, key }) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? `Edit "${form!.name}"` : 'Create Form'}</h2>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Form Name</label>
              <input required value={name} onChange={(e) => updateName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Key (used in code/URLs)</label>
              <input
                required
                disabled={isEdit}
                value={key}
                onChange={(e) => { setKeyTouched(true); setKey(slugify(e.target.value)) }}
                className="w-full border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-600">Fields</label>
              <button type="button" onClick={addField} className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--green)' }}>
                <Plus size={12} /> Add Field
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={i} className="border border-gray-200 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Field name (e.g. budget)" value={f.name} onChange={(e) => updateField(i, { name: e.target.value })} className="border border-gray-300 px-2 py-1.5 text-sm" />
                    <input placeholder="Label (e.g. Your Budget)" value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} className="border border-gray-300 px-2 py-1.5 text-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={f.type} onChange={(e) => updateField(i, { type: e.target.value as FieldDef['type'] })} className="border border-gray-300 px-2 py-1.5 text-sm">
                      {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input type="checkbox" checked={f.required} onChange={(e) => updateField(i, { required: e.target.checked })} /> Required
                    </label>
                    <button type="button" onClick={() => removeField(i)} className="text-xs text-red-500 hover:underline ml-auto">Remove</button>
                  </div>
                  {f.type === 'select' && (
                    <input
                      placeholder="Options (comma separated)"
                      value={(f.options ?? []).join(', ')}
                      onChange={(e) => updateField(i, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                      className="w-full border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-2.5 text-white font-medium text-sm disabled:opacity-50" style={{ backgroundColor: 'var(--green)' }}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Form'}
          </button>
        </form>
      </div>
    </div>
  )
}
