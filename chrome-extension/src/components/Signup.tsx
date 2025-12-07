import { useState, FormEvent } from 'react';
import { trpc } from '../trpc-client';
import { Button } from '@pt-app/shared-ui';
import { Input } from '@pt-app/shared-ui';
import { Label } from '@pt-app/shared-ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@pt-app/shared-ui';

interface SignupProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onSuccess, onSwitchToLogin }: SignupProps) {
  const [clinicName, setClinicName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await trpc.auth.signup.mutate({
        clinicName,
        name,
        email,
        password,
      });

      setSuccess('Account created successfully! Redirecting...');

      // Store user data
      await chrome.storage.local.set({
        user: result.user,
        clinicId: result.clinicId,
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Signup error:', err);

      let errorMessage = 'Failed to create account. Please try again.';

      if (err.data?.code === 'CONFLICT') {
        errorMessage = 'An account with this email already exists.';
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
          <CardTitle>Create Clinic Account</CardTitle>
          <CardDescription>Set up your physical therapy clinic</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                required
                placeholder="Acme Physical Therapy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>

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
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm mt-4 text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
