import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Status = 'verifying' | 'ready' | 'invalid';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>('verifying');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    // Surface errors that arrive in the URL hash (e.g. expired/invalid token).
    const hash = window.location.hash || '';
    if (hash.includes('error')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const desc = params.get('error_description') || params.get('error') || 'Reset link is invalid or expired.';
      setErrorDetail(decodeURIComponent(desc.replace(/\+/g, ' ')));
      setStatus('invalid');
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setStatus('ready');
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus('ready');
    });

    // If nothing has happened after a few seconds, treat the link as invalid
    // so the user isn't stuck on "Verifying...".
    const timeout = setTimeout(() => {
      setStatus((s) => (s === 'verifying' ? 'invalid' : s));
    }, 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated');
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Reset password</h1>
          <p className="mt-2 text-muted-foreground">
            {status === 'ready' && 'Enter your new password below'}
            {status === 'verifying' && 'Verifying reset link...'}
            {status === 'invalid' && 'This reset link is invalid or has expired.'}
          </p>
        </div>

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="rounded-xl bg-secondary border-0 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="rounded-xl bg-secondary border-0 h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              {submitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}

        {status === 'invalid' && (
          <div className="space-y-4">
            {errorDetail && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {errorDetail}
              </div>
            )}
            <Button
              onClick={() => navigate('/auth', { replace: true })}
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              Request a new reset link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
