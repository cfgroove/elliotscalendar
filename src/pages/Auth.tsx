import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getResetPasswordRedirect } from '@/lib/authUrl';
import { toast } from 'sonner';

type Mode = 'signin' | 'signup' | 'forgot';

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Account created! Check your email if confirmation is required.');
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getResetPasswordRedirect(),
        });
        if (error) throw error;
        toast.success('Check your email for a reset link');
        setMode('signin');
      }
    } catch (err: any) {
      console.error('[Auth] error:', err);
      const raw = err?.message || err?.error_description || err?.error || '';
      const isTrueNetworkError =
        raw === 'Failed to fetch' ||
        raw === 'NetworkError when attempting to fetch resource.' ||
        raw.toLowerCase().includes('networkerror');
      let friendly = raw || 'Authentication failed';
      if (/invalid login credentials/i.test(raw)) {
        friendly = 'Email or password is incorrect.';
      } else if (/email not confirmed/i.test(raw)) {
        friendly =
          'Please confirm your email address first — check your inbox for the verification link.';
      } else if (/user already registered/i.test(raw)) {
        friendly = 'An account with this email already exists. Try signing in instead.';
      } else if (/over.*rate limit/i.test(raw) || /too many/i.test(raw)) {
        friendly = 'Too many attempts. Please wait a minute and try again.';
      } else if (isTrueNetworkError) {
        friendly =
          "Couldn't reach the auth server. Check your internet connection and try again.";
      }
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === 'signup' ? 'Create your account'
    : mode === 'forgot' ? 'Reset your password'
    : 'Welcome back';

  const submitLabel =
    mode === 'signup' ? 'Create Account'
    : mode === 'forgot' ? 'Send reset link'
    : 'Sign In';

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">LeadPilot</h1>
          <p className="mt-2 text-muted-foreground">{title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex"
                required
                maxLength={100}
                className="rounded-xl bg-secondary border-0 h-12"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              maxLength={255}
              className="rounded-xl bg-secondary border-0 h-12"
            />
          </div>
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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
          )}
          {errorMsg && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            {submitting ? 'Loading...' : submitLabel}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'forgot' ? (
            <>
              Remembered it?{' '}
              <button
                onClick={() => setMode('signin')}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          ) : mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
