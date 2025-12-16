# Quick Start Guide

Get SundayPay running in 10 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Set Up Supabase (3 min)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Name it "sundaypay" (or anything)
4. Choose region closest to you
5. Set a strong database password
6. Wait for project to initialize (~2 min)

## Step 3: Run Database Schema (2 min)

1. In Supabase dashboard, click "SQL Editor" in left sidebar
2. Click "New Query"
3. Open `supabase/schema.sql` from this project
4. Copy entire contents
5. Paste into Supabase SQL Editor
6. Click "Run" (bottom right)
7. Should see "Success. No rows returned"

## Step 4: Enable Email Auth (1 min)

1. In Supabase, click "Authentication" → "Providers"
2. Find "Email" in the list
3. Toggle it ON
4. Click "Save"

## Step 5: Create Captain Account (1 min)

1. Click "Authentication" → "Users"
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `captain@test.com` (or your email)
   - Password: `test123456` (or your password)
   - Auto Confirm User: **ON** ✓
4. Click "Create User"

## Step 6: Get API Keys (1 min)

1. Click "Settings" (⚙️) → "API"
2. Copy these values:
   - Project URL
   - anon public key
   - service_role key (click "Reveal" first)

## Step 7: Configure Environment (1 min)

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and paste your values:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=<paste Project URL here>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon public key here>
SUPABASE_SERVICE_ROLE_KEY=<paste service_role key here>
```

## Step 8: Run the App! (1 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 9: Test It Out

### Login as Captain
1. Go to http://localhost:3000/login
2. Email: `captain@test.com`
3. Password: `test123456`
4. Click "Login"

### Create Your First Match
1. Click "+ Create New Match"
2. Choose "Detailed Breakdown"
3. Enter:
   - Number of Players: `10`
   - Cost Items:
     - Ground fee: `2000`
     - Ball: `300`
4. Click "+ Add Item" if you want more
5. Your UPI ID: `captain@paytm` (use your real UPI ID)
6. Click "Create Match Link"

### Share the Match
1. You'll see the match admin page
2. Scroll to "Share Match Link"
3. Click "Copy WhatsApp Message"
4. Share with players (or test yourself)

### Test as Player
1. Open match link in new incognito window
2. Enter your name
3. Click "Join Match"
4. Click "Pay Now via UPI" (on mobile it will open UPI app)
5. Click "Yes, I've Paid"
6. Done!

### Check Dashboard
1. Go back to captain window
2. Click "← Back" to dashboard
3. See your match with payment status

## Done! 🎉

You now have a working cricket payment tracker!

## Next Steps

- **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to put it online
- **Customize**: Change colors, app name, etc.
- **Share**: Give login credentials to your team captains

## Troubleshooting

### "Invalid email or password" when logging in
- Make sure you created the user in Supabase
- Check you toggled "Auto Confirm User" ON
- Try resetting password in Supabase dashboard

### "Failed to create match"
- Check your `.env.local` has all variables
- Restart dev server: `Ctrl+C` then `npm run dev`
- Check Supabase dashboard → Table Editor → matches (should exist)

### "Match not found" when opening player link
- Make sure you're using the exact link from the admin page
- Check match status is "open"
- Try creating a new match

### Page shows "Please fill all required fields"
- All fields are required when creating a match
- UPI ID must be in format: `something@provider`
- Date must be selected

## Need Help?

- Check [README.md](./README.md) for full documentation
- Open an issue on GitHub
- Join our Discord (link in README)

---

**Happy Cricket! 🏏**
