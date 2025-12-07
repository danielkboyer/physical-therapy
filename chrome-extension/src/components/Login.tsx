import { useState, FormEvent } from 'react';
import { trpc } from '../trpc-client';
import { Button } from '@pt-app/shared-ui';
import { Input } from '@pt-app/shared-ui';
import { Label } from '@pt-app/shared-ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@pt-app/shared-ui';

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
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your clinic account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4 text-sm">
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

          <div className="text-center text-sm mt-4 text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
