# SundayPay Development Server Starter
Write-Host "🏏 Starting SundayPay..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env.local and add your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

# Start the dev server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "📱 App will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
npm run dev
