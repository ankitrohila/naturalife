# 🚀 Quick Setup Guide - Naturalife Admin

## The Issue
You saw "Invalid email or password" because the admin user hasn't been created in the database yet.

## Solution - 3 Simple Steps

### Step 1: Create PostgreSQL Database (If Not Already Done)
```bash
# Open PostgreSQL command line or use pgAdmin
createdb naturalife

# Or in pgAdmin:
# Right-click "Databases" → Create → Database
# Name: naturalife
# Click Save
```

### Step 2: Run Database Migrations & Seed
```bash
cd D:\naturalife\naturalife-store

# Push schema to database
npx prisma db push

# Seed admin user and 25+ products
ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-comprehensive.ts
```

### Step 3: Test Login
1. Go to `http://localhost:3005/login`
2. Click "Admin" tab
3. Email: `admin@naturalife.in`
4. Password: `admin123`
5. Click "Sign In"

---

## If You See Any Errors

### Error: "Can't connect to database"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# If fails, start PostgreSQL:
# Windows: Services → PostgreSQL → Start
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Error: "database 'naturalife' does not exist"
```bash
# Create database manually
createdb naturalife
```

### Error: "relation 'User' does not exist"
```bash
# Run migrations
npx prisma db push
```

### Error: "Seed script failed"
```bash
# Check the error message carefully
# Most likely: database connection issue
# Run this to verify connection:
psql -U postgres -d naturalife -c "SELECT COUNT(*) FROM \"User\";"
```

---

## Verify Setup is Complete

Run these checks:

```bash
# 1. Check database exists
psql -U postgres -l | grep naturalife

# 2. Check admin user exists
psql -U postgres -d naturalife -c "SELECT * FROM \"User\" WHERE role = 'ADMIN';"

# 3. Check products seeded
psql -U postgres -d naturalife -c "SELECT COUNT(*) FROM \"Product\";"
# Should return 25+
```

---

## You'll Know It's Working When:

✅ Login page shows "Demo Admin Account:" box  
✅ Database commands return results (no "does not exist" errors)  
✅ You can log in with `admin@naturalife.in` / `admin123`  
✅ Admin dashboard loads at `/admin`  
✅ Shop page shows 25+ products at `/shop`

---

## Quick Command Summary

```bash
cd D:\naturalife\naturalife-store

# All-in-one setup:
npx prisma db push && ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-comprehensive.ts
```

Then test at: `http://localhost:3005/login`

---

## Next Steps After Login Works

1. ✅ Admin login succeeds
2. Go to `/admin` dashboard
3. View products, orders, customers
4. Test full shop flow at `/shop`
5. Follow TESTING_GUIDE.md for complete testing

