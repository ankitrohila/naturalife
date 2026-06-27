# 🖼️ Download & Setup Local Images Guide

## Overview
The Naturalife platform now uses **local images** instead of external CDN URLs. This means:
- ✅ Faster loading (no external requests)
- ✅ Better reliability (images always available)
- ✅ Full control over images
- ✅ Proper image optimization
- ✅ Professional appearance

## Current Status

### What's Ready
- ✅ Naturalife logo as local SVG: `/public/images/logo/naturalife-logo.svg`
- ✅ Directory structure created
- ✅ Login page using local logo
- ✅ Seed file updated to use local paths

### What's Needed
- ⏳ Download actual Naturalife logo (PNG version)
- ⏳ Download product images from Naturalife site
- ⏳ Organize images in local directories
- ⏳ Test with real images

---

## Step-by-Step Download Instructions

### Step 1: Download Naturalife Logo

**Original Logo URL:**
```
https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png
```

**How to Download:**
1. Right-click link → "Save link as..."
2. Navigate to: `D:\naturalife\naturalife-store\public\images\logo\`
3. Save as: `naturalife-logo.png`

**Or use curl (Windows Command Prompt):**
```bash
cd D:\naturalife\naturalife-store\public\images\logo
curl -o naturalife-logo.png https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png
```

### Step 2: Download Product Images

**Visit:** https://naturalife.co.in/

**Download images for each category:**

#### Doormats (5 images)
1. Browse to: Doormats section
2. Right-click each product image → "Save image as..."
3. Save to: `public/images/products/doormats/`
4. Name them: `DM-001.jpg`, `DM-002.jpg`, `DM-003.jpg`, `DM-004.jpg`, `DM-005.jpg`

#### Rugs (3 images)
1. Browse to: Rugs & Dhurries section
2. Download 3 rug images
3. Save to: `public/images/products/rugs/`
4. Name them: `RG-001.jpg`, `RG-002.jpg`, `RG-003.jpg`

#### Dhurries (2 images)
1. Download 2 dhurrie images
2. Save to: `public/images/products/dhurries/`
3. Name them: `DH-001.jpg`, `DH-002.jpg`

#### Carpets (2 images)
1. Download 2 carpet images
2. Save to: `public/images/products/carpets/`
3. Name them: `CP-001.jpg`, `CP-002.jpg`

#### Mats (3 images)
1. Download 3 mat images
2. Save to: `public/images/products/mats/`
3. Name them: `MT-001.jpg`, `MT-002.jpg`, `MT-003.jpg`

#### Cushion Covers (3 images)
1. Download 3 cushion cover images
2. Save to: `public/images/products/cushion-covers/`
3. Name them: `CC-001.jpg`, `CC-002.jpg`, `CC-003.jpg`

#### Table Mats (2 images)
1. Download 2 table mat images
2. Save to: `public/images/products/table-mats/`
3. Name them: `TM-001.jpg`, `TM-002.jpg`

#### Stools (2 images)
1. Download 2 stool images
2. Save to: `public/images/products/stools/`
3. Name them: `ST-001.jpg`, `ST-002.jpg`

#### Chef Mats (1 image)
1. Download 1 chef mat image
2. Save to: `public/images/products/chef-mats/`
3. Name it: `CM-001.jpg`

### Step 3: Batch Download Script (Advanced)

If you have wget or curl, use this script:

**For Windows (PowerShell):**
```powershell
# Navigate to project root
cd "D:\naturalife\naturalife-store"

# Download logo
curl -o public\images\logo\naturalife-logo.png https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png

# You can add more wget/curl commands for each product image
```

**For Mac/Linux:**
```bash
cd ~/projects/naturalife-store

# Download logo
wget https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png -O public/images/logo/naturalife-logo.png

# Bulk download from WordPress uploads
wget -r -A.jpg,.png https://naturalife.co.in/wp-content/uploads/ -P public/images/
```

---

## Organizing Downloaded Images

### Final Directory Structure
```
public/images/
├── logo/
│   ├── naturalife-logo.svg           ✅ Already there
│   └── naturalife-logo.png           ⏳ Download & add
├── products/
│   ├── doormats/
│   │   ├── DM-001.jpg                ⏳ Download
│   │   ├── DM-002.jpg                ⏳ Download
│   │   ├── DM-003.jpg                ⏳ Download
│   │   ├── DM-004.jpg                ⏳ Download
│   │   └── DM-005.jpg                ⏳ Download
│   ├── rugs/
│   │   ├── RG-001.jpg                ⏳ Download
│   │   ├── RG-002.jpg                ⏳ Download
│   │   └── RG-003.jpg                ⏳ Download
│   ├── dhurries/
│   │   ├── DH-001.jpg                ⏳ Download
│   │   └── DH-002.jpg                ⏳ Download
│   ├── carpets/
│   │   ├── CP-001.jpg                ⏳ Download
│   │   └── CP-002.jpg                ⏳ Download
│   ├── mats/
│   │   ├── MT-001.jpg                ⏳ Download
│   │   ├── MT-002.jpg                ⏳ Download
│   │   └── MT-003.jpg                ⏳ Download
│   ├── cushion-covers/
│   │   ├── CC-001.jpg                ⏳ Download
│   │   ├── CC-002.jpg                ⏳ Download
│   │   └── CC-003.jpg                ⏳ Download
│   ├── table-mats/
│   │   ├── TM-001.jpg                ⏳ Download
│   │   └── TM-002.jpg                ⏳ Download
│   ├── stools/
│   │   ├── ST-001.jpg                ⏳ Download
│   │   └── ST-002.jpg                ⏳ Download
│   └── chef-mats/
│       └── CM-001.jpg                ⏳ Download
└── README.md                          ✅ Image management guide
```

---

## After Downloading Images

### 1. Verify Images Are in Place
```bash
# Check if images exist
dir D:\naturalife\naturalife-store\public\images\products\doormats\
# Should see: DM-001.jpg, DM-002.jpg, etc.
```

### 2. Run the Seed
```bash
cd D:\naturalife\naturalife-store

# Push migrations
npx prisma db push

# Seed database with updated image paths
ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-comprehensive.ts
```

### 3. Restart Dev Server
```bash
npm run dev
```

### 4. Test Images Load
1. Go to `http://localhost:3005/login`
   - Should see Naturalife logo from `/images/logo/naturalife-logo.svg`

2. Go to `http://localhost:3005/shop`
   - Should see product images from `/images/products/[category]/[sku].jpg`

3. Click product → See product detail with image from `/images/products/...`

---

## Image Optimization

### Before Using Downloaded Images

**Optional: Optimize file sizes**

Using ImageMagick (Windows):
```bash
cd D:\naturalife\naturalife-store\public\images\products\doormats

# Resize to 400x400 and reduce quality
magick DM-001.jpg -resize 400x400 -quality 85 DM-001.jpg
magick DM-002.jpg -resize 400x400 -quality 85 DM-002.jpg
# ... repeat for all images
```

Using online tool:
1. Go to: https://imagecompressor.com/
2. Upload image
3. Compress
4. Download
5. Replace local file

---

## Troubleshooting

### Images Not Loading
```
Check:
1. File exists: ls D:\naturalife\naturalife-store\public\images\products\doormats\
2. Path is correct: /images/products/doormats/DM-001.jpg
3. Filename matches seed: "image": "/images/products/doormats/DM-001.jpg"
4. Dev server restarted: npm run dev
5. Browser cache cleared: Ctrl+Shift+Delete
```

### Wrong Image Displays
- Verify filename matches exactly (case-sensitive on Linux/Mac)
- Check seed database query
- Reseed database: `npm run db:seed`

### Images Too Large
- Use image compressor
- Resize to 400x400px
- Reduce quality to 80-85%
- Consider WebP format

---

## Next Steps

1. ✅ **Download logo** → `public/images/logo/naturalife-logo.png`
2. ✅ **Download product images** → `public/images/products/[category]/[sku].jpg`
3. ✅ **Optimize images** (optional)
4. ✅ **Run seed**: `npm run db:seed`
5. ✅ **Restart server**: `npm run dev`
6. ✅ **Test in browser**:
   - Login page: http://localhost:3005/login
   - Shop page: http://localhost:3005/shop
   - Product detail: Click any product

---

## Important Notes

- **Do NOT** use Unsplash/Pexels images (use real product photos from Naturalife)
- **Do** optimize images before use (keep < 200KB each)
- **Do** keep filenames consistent with seed (DM-001.jpg, etc.)
- **Do** test in browser after setup
- **Do** check browser DevTools → Network for 404 errors

---

## Support

If images still don't appear:
1. Check `public/images/README.md` for troubleshooting
2. Verify file paths in seed: `prisma/seed-comprehensive.ts`
3. Clear browser cache and dev server cache: `rm -rf .next && npm run dev`

Good luck! 🎨

