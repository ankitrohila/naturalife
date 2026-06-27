# Local Image Management System

This directory contains all static images used in the Naturalife platform.

## Directory Structure

```
public/images/
├── logo/                    # Naturalife branding logos
│   ├── naturalife-logo.svg # Main logo (SVG - vector)
│   ├── naturalife-logo.png # Main logo (PNG - raster)
│   └── favicon.ico         # Browser favicon
├── products/               # Product images (organized by category)
│   ├── doormats/
│   ├── rugs/
│   ├── dhurries/
│   ├── carpets/
│   ├── mats/
│   ├── cushion-covers/
│   ├── table-mats/
│   ├── stools/
│   └── chef-mats/
├── categories/             # Category banner images
│   ├── doormats.jpg
│   ├── rugs.jpg
│   └── ...
├── heroes/                 # Hero section images
│   ├── hero-1.jpg
│   └── hero-2.jpg
└── social/                 # Social media images
    ├── instagram-1.jpg
    └── ...
```

## How to Use Local Images

### In React Components
```jsx
import Image from 'next/image'

export default function MyComponent() {
  return (
    <Image
      src="/images/products/doormats/DM-001.jpg"
      alt="Classic Microfiber Doormat"
      width={400}
      height={400}
      priority
    />
  )
}
```

### In Database Seeds
```typescript
// Instead of:
image: 'https://images.unsplash.com/...'

// Use:
image: '/images/products/doormats/DM-001.jpg'
```

### In CSS/Tailwind
```css
/* CSS */
background-image: url('/images/categories/doormats.jpg');

/* Tailwind */
<div style={{ backgroundImage: 'url(/images/categories/doormats.jpg)' }} />
```

## Image Specifications

### Product Images
- **Format:** JPG or PNG
- **Dimensions:** 400×400 px (square)
- **Size:** < 200KB each
- **Quality:** High resolution (72 DPI minimum)
- **Background:** White or transparent

### Category Images
- **Format:** JPG
- **Dimensions:** 600×400 px
- **Size:** < 300KB
- **Quality:** High resolution

### Hero Images
- **Format:** JPG
- **Dimensions:** 1920×600 px
- **Size:** < 500KB
- **Quality:** High resolution

### Logo
- **Format:** SVG (preferred) or PNG
- **Dimensions:** SVG (scalable), PNG (400×200 px)
- **Size:** < 50KB

## How to Add New Images

### 1. Download Images from Naturalife WordPress Site
Visit: https://naturalife.co.in/

**To download images:**
1. Right-click image → "Save image as..."
2. Save to appropriate folder (e.g., `public/images/products/doormats/`)
3. Rename file to match product SKU (e.g., `DM-001.jpg`)

### 2. Optimize Images
```bash
# Using ImageOptim (Mac) or FileOptimizer (Windows)
# Or online: https://imagecompressor.com/

# For bulk optimization on Windows:
# Install ImageMagick, then run:
for %f in (*.jpg) do magick "%f" -resize 400x400 -quality 85 "%f"
```

### 3. Update Code References
Once images are added locally, update:
- Seed file: `prisma/seed-comprehensive.ts`
- Component imports: `src/components/**/*.tsx`
- CSS/styles: `src/app/globals.css`

### 4. Verify in Browser
```bash
npm run dev
# Check http://localhost:3005/shop
# Images should load from /images/* paths
```

## Current Image Sources

### Logo
- ✅ Local: `/images/logo/naturalife-logo.svg`
- Download original: https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png

### Products
- Download from: https://naturalife.co.in/
- Categories to download:
  - Doormats
  - Rugs & Dhurries
  - Carpets
  - Mats
  - Cushion Covers
  - Table Mats

### Hero Images
- Download from: https://naturalife.co.in/
- Look for banner/slider images

## Performance Tips

1. **Use WebP Format** (Supported by Next.js Image)
   - Better compression than JPG/PNG
   - Smaller file sizes

2. **Add Image Optimization in next.config.ts**
   ```javascript
   images: {
     formats: ['image/avif', 'image/webp'],
     remotePatterns: [], // No external images
   }
   ```

3. **Use Responsive Images**
   ```jsx
   <Image
     src="/images/products/..."
     alt="..."
     width={400}
     height={400}
     quality={85}
     priority={true} // For above-fold images
   />
   ```

## Batch Download Script

To download images from Naturalife WordPress site:

```bash
# Linux/Mac:
cd public/images/products
wget -r -A.jpg,.png https://naturalife.co.in/wp-content/uploads/

# Windows (using curl):
cd public\images\products
curl -O https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png
```

## Troubleshooting

### Images not loading
- Check path starts with `/images/`
- Verify file exists in `public/images/`
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser DevTools → Network tab

### Images too large
- Use online compressor: https://imagecompressor.com/
- Or locally: ImageOptim (Mac) / FileOptimizer (Windows)

### Need to replace images
- Delete old image
- Add new image with same filename
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

## Image Attribution

All images used should be:
- ✅ Original Naturalife products
- ✅ Properly licensed
- ✅ Ready for commercial use
- ✅ In appropriate format for web

Do NOT use:
- ❌ Unsplash/Pexels/Pixabay images (use real product photos)
- ❌ Compressed/low-quality images
- ❌ Images without proper rights

## Next Steps

1. Download logo: https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png
2. Place in: `public/images/logo/naturalife-logo.png`
3. Download product images from Naturalife site
4. Organize in: `public/images/products/[category]/[product-code].jpg`
5. Update seed file paths
6. Test in browser
