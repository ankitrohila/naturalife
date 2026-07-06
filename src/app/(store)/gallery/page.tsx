export const metadata = { title: 'Gallery', description: 'A visual look at Naturalife\'s handcrafted home textiles.' }

const IMAGES = [
  '/images/products/p-sq-1.jpg',
  '/images/products/p-sq-2.jpg',
  '/images/products/p-sq-3.jpg',
  '/images/products/p-sq-4.jpg',
  '/images/products/p-sq-5.jpg',
  '/images/products/p-sq-8.jpg',
  '/images/products/p-sq-10.jpg',
  '/images/products/p-sq-12.jpg',
  '/images/products/p-sq-13.jpg',
  '/images/products/p-sq-14.jpg',
  '/images/products/p-sq-15.jpg',
  '/images/products/p-sq-17.jpg',
]

export default function GalleryPage() {
  return (
    <main className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--green)' }}>Our Gallery</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Craftsmanship in Every Weave</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {IMAGES.map((src) => (
          <div key={src} className="aspect-square overflow-hidden bg-[var(--surface)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Naturalife product" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </div>
    </main>
  )
}
