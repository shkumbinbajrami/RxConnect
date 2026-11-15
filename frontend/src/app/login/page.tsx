'use client';

import { useEffect, useState } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { PasswordSetupForm } from '@/features/auth/components/password-setup-form';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [invited, setInvited] = useState(false);
  useEffect(() => {
    if (!window.location.hash) return;
    void supabase.auth.getSession().then(({ data }) => setInvited(Boolean(data.session)));
  }, []);
  return invited ? <PasswordSetupForm onComplete={() => setInvited(false)} /> : <LoginForm />;
}
