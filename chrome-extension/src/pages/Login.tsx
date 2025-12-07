import { useState, FormEvent } from 'react';
import { trpc } from '../trpc-client';
import { Button } from '@pt-app/shared-ui';
import { Input } from '@pt-app/shared-ui';
import { Label } from '@pt-app/shared-ui';

interface LoginProps {
  onSuccess: (user: any) => void;
  onSwitchToSignup: () => void;
}

export default function Login({ onSuccess, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await trpc.auth.login.mutate({
        email,
        password,
      });

      // Store user data and login state
      await chrome.storage.local.set({
        user: result.user,
        isLoggedIn: true,
      });

      onSuccess(result.user);
    } catch (err: any) {
      console.error('Login error:', err);

      let errorMessage = 'Failed to login. Please try again.';

      if (err.data?.code === 'UNAUTHORIZED') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign In
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your clinic account
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
