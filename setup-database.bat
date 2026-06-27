@echo off
echo ============================================
echo Naturalife Database Setup
echo ============================================
echo.

REM Check if Node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
echo.

REM Create database
echo Creating PostgreSQL database 'naturalife'...
psql -U postgres -c "CREATE DATABASE naturalife;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database created (or already exists)
) else (
    echo ! Database creation skipped (may already exist)
)
echo.

REM Run migrations
echo Running Prisma migrations...
call npx prisma db push --skip-generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    echo Make sure PostgreSQL is running and DATABASE_URL is correct
    pause
    exit /b 1
)
echo ✓ Migrations completed
echo.

REM Run seed
echo Seeding database with products and admin user...
call ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed-comprehensive.ts
if %errorlevel% neq 0 (
    echo ERROR: Seed failed
    pause
    exit /b 1
)
echo ✓ Seed completed
echo.

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Admin Login:
echo   Email: admin@naturalife.in
echo   Password: admin123
echo.
echo Open browser to: http://localhost:3005/login
echo.
pause
