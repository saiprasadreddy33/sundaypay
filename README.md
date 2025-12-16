# 🏏 SundayPay - Cricket Match Payment Tracker

A production-ready Progressive Web App (PWA) for tracking weekly cricket match payments. Built with Next.js 14, Supabase, and PWA capabilities.

## ✨ Features

### For Captains
- **Detailed Fee Breakdown**: Dynamic cost calculator with items (ground fee, ball, trophy, etc.)
- **Auto Per-Head Calculation**: Enter total costs and player count, fee auto-calculated
- **Dashboard**: View last 4 weeks of matches at a glance
- **Live Tracking**: Real-time player list and payment status
- **WhatsApp Ready**: Auto-generated share messages with fee breakdown
- **Manual Controls**: Mark players paid, close matches

### For Players
- **Zero Friction**: No login required, just name
- **Single-Page Flow**: Join → Pay → Confirm in one screen
- **UPI Deep Links**: Instant payment via any UPI app
- **Live Updates**: See who else has joined and paid
- **Fee Transparency**: See full cost breakdown

### Technical
- **Security**: Row Level Security, rate limiting, input sanitization
- **PWA**: Installable, offline-capable, native app experience
- **Auto Cleanup**: Matches older than 4 weeks automatically archived
- **Reminders**: Automated reminder system (extensible to WhatsApp)
- **Mobile-First**: Optimized for mobile, works great on desktop

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor → New Query
4. Copy contents of `supabase/schema.sql` and run
5. Go to Authentication → Providers → Enable Email
6. Go to Authentication → Users → Add User (create captain account)

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: Supabase Dashboard → Settings → API

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 How It Works

### Captain Flow

1. **Login** → `/login`
2. **Create Match** → `/create-match`
   - Choose "Detailed Breakdown" mode
   - Enter player count (e.g., 16 players)
   - Add cost items:
     - Ground fee: ₹3,250
     - Ball: ₹360
     - MVP Trophy: ₹150
   - Total: ₹3,760 → Per head: ₹235 (auto-calculated)
   - Enter UPI ID
3. **Share Link** → Copy WhatsApp message with breakdown
4. **Track Payments** → Real-time dashboard
5. **Close Match** → When all paid or match done

### Player Flow

1. **Open Link** → `/match/[id]`
2. **Enter Name** → "Rahul"
3. **See Breakdown** → Full cost breakdown displayed
4. **Pay** → UPI app opens automatically
5. **Confirm** → Mark as paid
6. **Done** → ✅ All set!

### WhatsApp Message Example

```
🏏 Cricket Match - Sun, 22 Dec 2024

Ground fee: ₹3,250
Ball: ₹360
MVP Trophy: ₹150

Match fee per head: ₹235

👉 Join and pay here:
https://sundaypay.app/match/abc123
```

## 🗂️ Project Structure

```
sundaypay/
├── app/
│   ├── actions/              # Server actions (secure)
│   │   ├── auth.ts          # Login/logout
│   │   ├── match.ts         # Create, close, manage
│   │   └── player.ts        # Join, pay (rate limited)
│   ├── dashboard/           # Captain dashboard
│   ├── create-match/        # Match creation with breakdown
│   ├── login/               # Captain login
│   ├── match/[id]/          # Player match page (public)
│   │   └── admin/          # Captain match admin
│   └── layout.tsx           # Root layout with PWA meta
├── components/ui/           # Reusable components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── toast.tsx
├── lib/
│   ├── supabase/           # DB clients
│   ├── auth.ts             # Auth helpers
│   ├── types.ts            # TypeScript types
│   ├── upi.ts              # UPI deep link generator
│   └── utils.ts            # Helpers (format, calculate)
├── public/
│   ├── manifest.json       # PWA config
│   └── offline.html        # Offline fallback
├── supabase/
│   ├── schema.sql          # Complete DB + RLS
│   ├── cron.sql            # Scheduled jobs
│   └── functions/
│       └── daily-tasks/    # Cleanup & reminders
└── DEPLOYMENT.md           # Deployment checklist
```

## 🔒 Security

### Database Level
- **Row Level Security (RLS)** enforced on all tables
- Captain can only see/edit their own matches
- Players can only update their own payment status
- No one can modify closed matches

### Application Level
- **Input Sanitization**: Player names cleaned, dangerous chars removed
- **Rate Limiting**: 10 joins per match per 30s, 3 payment updates per player per minute
- **Validation**: All inputs validated with Zod schemas
- **UPI ID Format**: Regex validated on both client and database

### Edge Cases Handled
- Duplicate names blocked
- Same player can't join twice
- Can't join/pay after match closed
- Captain verification for all admin actions

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add environment variables (see DEPLOYMENT.md)
4. Deploy

### Deploy Edge Functions

```bash
npm install -g supabase
supabase link --project-ref your-project-ref
supabase functions deploy daily-tasks
```

### Set Up Cron Jobs

1. Edit `supabase/cron.sql` with your function URL
2. Run in Supabase SQL Editor

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete checklist.

## 🧪 Testing

```bash
# Build for production
npm run build

# Run production build locally
npm start

# Test PWA
# 1. Open in Chrome
# 2. DevTools → Application → Manifest
# 3. Click "Add to Home Screen"
```

## 🎨 Customization

### App Name
```env
NEXT_PUBLIC_APP_NAME=YourAppName
```

### Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: "#10b981",  // Change to your color
  success: "#10b981",
  danger: "#ef4444",
  // ...
}
```

### Data Retention
Edit `supabase/schema.sql` line 159:
```sql
WHERE date < CURRENT_DATE - INTERVAL '28 days'
-- Change 28 to your preferred days
```

## 📊 Database Schema

### matches
```sql
id UUID
date DATE
fee_amount INTEGER
upi_id TEXT
status ENUM('open', 'closed')
fee_breakdown JSONB {
  player_count: number
  items: [{ title, amount }]
  is_detailed: boolean
}
share_message TEXT
reminder_after_days INTEGER
created_by UUID
created_at TIMESTAMP
```

### match_players
```sql
id UUID
match_id UUID
player_name TEXT
paid BOOLEAN
paid_at TIMESTAMP
joined_at TIMESTAMP
reminder_sent BOOLEAN
```

## 🐛 Troubleshooting

### "Players can't join"
- Check match status (must be "open")
- Verify Supabase RLS policies are active
- Check browser console for errors

### "UPI link not working"
- Ensure UPI ID format: `username@provider`
- Test on actual mobile device (UPI doesn't work on desktop)
- Verify a UPI app (PhonePe, GooglePay, Paytm) is installed

### "Build fails"
```bash
rm -rf .next node_modules
npm install
npm run build
```

### "Environment variables not working"
- Restart dev server after changing `.env.local`
- Ensure variables start with `NEXT_PUBLIC_` for client-side use
- Check Vercel deployment has all env vars set

## 🔧 Maintenance

### View Logs
```bash
# Supabase Edge Functions
supabase functions logs daily-tasks --follow

# Database queries (slow queries)
# Check Supabase Dashboard → Database → Query Performance
```

### Manual Tasks
```sql
-- Clean old matches
SELECT delete_old_matches();

-- View who needs reminders
SELECT * FROM get_reminder_candidates();

-- View match stats
SELECT 
  status,
  COUNT(*) as count,
  AVG(fee_amount) as avg_fee
FROM matches
GROUP BY status;
```

## 📈 Roadmap

- [ ] WhatsApp API integration for automated reminders
- [ ] Export match data to CSV
- [ ] Player profile (track multiple matches)
- [ ] Multiple teams per captain
- [ ] Custom branding per team
- [ ] SMS reminders fallback

## 📝 License

MIT License - feel free to use for your cricket team!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Make your changes
4. Add tests if applicable
5. Submit PR with description

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourrepo/issues)
- **Questions**: Open a discussion
- **Email**: your-email@example.com

## 📸 Screenshots

(Add screenshots here after deployment)

---

**Built with ❤️ for Sunday cricket teams**

Happy payments! 🏏💰
