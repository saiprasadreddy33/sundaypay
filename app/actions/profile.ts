'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  team_name: z.string().max(120).optional(),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

export async function updateProfileAction(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const raw = {
    display_name: formData.get('display_name') as string,
    team_name: (formData.get('team_name') as string) || undefined,
  };

  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    // For now, just stop if validation fails. In future you can wire this to UI error handling.
    return;
  }

  const { display_name, team_name } = parsed.data;

  const { error } = await supabase
    .from('captain_profiles')
    .upsert(
      {
        user_id: user.id,
        display_name,
        team_name: team_name ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    // Log or hook into error reporting; form action itself does not return a value
    console.error('Failed to update profile', error);
    return;
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile');

  redirect('/dashboard');
}

export async function updatePasswordAction(formData: FormData) {
  await requireAuth();
  const supabase = await createClient();

  const raw = {
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
  };

  const parsed = passwordSchema.safeParse(raw);

  if (!parsed.success) {
    // Invalid password; no return value needed for the form action
    return;
  }

  const { password } = parsed.data;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Failed to update password', error);
    return;
  }

  revalidatePath('/profile');
}



