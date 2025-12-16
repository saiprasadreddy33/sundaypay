# Deployment Checklist

## Pre-Deployment

- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Enable Email Auth in Supabase
- [ ] Create captain user account
- [ ] Generate app icons (192x192, 512x512)
- [ ] Test locally with production build

## Vercel Deployment

- [ ] Push code to GitHub
- [ ] Import project to Vercel
- [ ] Add environment variables:
  - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.vercel.app`
  - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon key
  - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key
- [ ] Deploy and verify build succeeds
- [ ] Test login page
- [ ] Test creating a match
- [ ] Test player flow (join, pay, confirm)

## Supabase Edge Functions

- [ ] Install Supabase CLI
- [ ] Link project: `supabase link --project-ref YOUR_REF`
- [ ] Deploy function: `supabase functions deploy daily-tasks`
- [ ] Set function env vars in dashboard
- [ ] Test function manually
- [ ] Set up cron job (edit and run `supabase/cron.sql`)

## Post-Deployment Verification

- [ ] Test PWA install on mobile
- [ ] Test UPI payment on actual device
- [ ] Verify match creation
- [ ] Verify player can join
- [ ] Verify WhatsApp message format
- [ ] Test captain can mark paid
- [ ] Test closing match
- [ ] Verify dashboard shows matches
- [ ] Test logout/login flow

## Security Checks

- [ ] Verify RLS is enabled on both tables
- [ ] Test: Player can't access captain dashboard
- [ ] Test: Player can't mark others as paid
- [ ] Test: Can't join closed match
- [ ] Test: Duplicate name rejection
- [ ] Test: Rate limiting works

## Performance Checks

- [ ] Run Lighthouse audit (should be 90+ for PWA)
- [ ] Test on 3G network
- [ ] Verify offline fallback works
- [ ] Check bundle size is reasonable

## Monitoring Setup

- [ ] Add Vercel Analytics (optional)
- [ ] Set up error tracking (Sentry, etc.) (optional)
- [ ] Monitor Edge Function logs
- [ ] Set up alerts for cron failures (optional)

## Documentation

- [ ] Update README with production URL
- [ ] Document captain onboarding process
- [ ] Share player guide with team

## Launch

- [ ] Share app URL with first captain
- [ ] Monitor first few matches
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Announce to more users

## Maintenance

- [ ] Schedule weekly check of logs
- [ ] Monitor database size
- [ ] Check cron job is running daily
- [ ] Update dependencies monthly
