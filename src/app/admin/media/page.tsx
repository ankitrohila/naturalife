import { prisma } from '@/lib/prisma'

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 60 }).catch(() => [])

  const sampleImages = [
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/square-26-350x350.jpg', name: 'DOORMAT-BB-11' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/square-73-350x350.jpg', name: 'MICRO-SHAG-BB-73' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/BLK-GRE-1-rotated-350x242.jpg', name: 'BLK-GRE variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/WIN-rotated-350x235.jpg', name: 'WIN variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/CHA-GRE-1-rotated-595x409.jpg', name: 'CHA-GRE variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/CHO-BRO-1-rotated-595x408.jpg', name: 'CHO-BRO variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/MAR-BRO-1-rotated-595x408.jpg', name: 'MAR-BRO variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/NAV-GRE-1-rotated-595x411.jpg', name: 'NAV-GRE variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/OLV-MUD-1-rotated-595x409.jpg', name: 'OLV-MUD variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2025/02/WIN-MUD-1-rotated-595x407.jpg', name: 'WIN-MUD variant' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png', name: 'Logo' },
    { url: 'https://naturalife.co.in/wp-content/uploads/2017/01/1920x760.jpg', name: 'Hero Banner' },
  ]

  const displayAssets = assets.length > 0
    ? assets.map(a => ({ url: a.url, name: a.altText ?? a.publicId }))
    : sampleImages

  return (
    <>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
              <p className="text-sm text-gray-500 mt-1">{displayAssets.length} assets</p>
            </div>
            <button className="px-4 py-2 text-white rounded-none text-sm font-medium" style={{ backgroundColor: 'var(--green)' }}>
              + Upload Image
            </button>
          </div>

          {assets.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-none px-5 py-3 mb-6 text-sm text-yellow-700">
              Showing sample images. Connect Cloudinary and seed the database to manage your media library.
            </div>
          )}

          <div className="bg-white rounded-none border-2 border-dashed border-gray-200 p-8 text-center mb-6 hover:border-green-400 transition-colors cursor-pointer">
            <p className="font-medium text-gray-600 mb-1">Drag & drop images here</p>
            <p className="text-sm text-gray-400 mb-4">PNG, JPG, WEBP up to 10MB</p>
            <button className="px-5 py-2 text-white rounded-none text-sm font-medium" style={{ backgroundColor: 'var(--green)' }}>Browse Files</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displayAssets.map((asset, i) => (
              <div key={i} className="group relative bg-white rounded-none overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100">
                    <button className="text-white text-xs bg-white/20 rounded px-2 py-1 hover:bg-white/30">Copy URL</button>
                  </div>
                </div>
                <div className="p-1.5">
                  <p className="text-xs text-gray-500 truncate">{asset.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  )
}
