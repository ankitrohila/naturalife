'use client'

import { useState, useRef } from 'react'
import { X, Camera, Upload, Loader2 } from 'lucide-react'
import { ImageSearchResults } from './ImageSearchResults'
import type { ProductCardData } from '@/components/shop/ProductCard'

export function ImageSearchModal({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ProductCardData[] | null>(null)
  const [matchedColors, setMatchedColors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResults(null)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const search = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch('/api/search/image', { method: 'POST', body: formData })
      const data = await res.json()
      setResults(data.products ?? [])
      setMatchedColors(data.matchedColors ?? [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Camera size={18} /> Search by Image
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-[var(--ink)]"><X size={20} /></button>
        </div>

        <div className="p-6">
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver ? 'border-[var(--green)] bg-[var(--green-light)]' : 'border-gray-300'}`}
            >
              <Upload size={32} className="text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">Drag & drop a photo here</p>
              <p className="text-xs text-gray-400">or click to upload from your device</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Uploaded" className="w-24 h-24 object-cover border border-[var(--line)]" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">{file?.name}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={search}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white disabled:opacity-50 flex items-center gap-2"
                      style={{ backgroundColor: 'var(--green)' }}
                    >
                      {loading && <Loader2 size={14} className="animate-spin" />}
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                    <button
                      onClick={() => { setPreview(null); setFile(null); setResults(null) }}
                      className="px-4 py-2 text-sm font-medium border border-[var(--line)] text-gray-600"
                    >
                      Choose Different Photo
                    </button>
                  </div>
                </div>
              </div>

              {results && (
                <ImageSearchResults products={results} matchedColors={matchedColors} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
