-- One-time policy to allow captains to delete their own matches
-- Run this after you've applied schema.sql

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'matches' AND policyname = 'captains_delete_own_matches'
  ) THEN
    CREATE POLICY "captains_delete_own_matches" ON public.matches
      FOR DELETE
      USING (created_by = auth.uid());
  END IF;
END $$;
