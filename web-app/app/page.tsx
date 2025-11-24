import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">PT Session Recorder</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Physical Therapy Session Recording
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Record every word of your therapy sessions with precision.
            Streamline documentation and focus on your patients.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="text-xl font-semibold mb-2">High-Quality Recording</h3>
              <p className="text-gray-600">
                Capture every detail with professional audio recording directly from your browser
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Session Management</h3>
              <p className="text-gray-600">
                Organize sessions by location, therapist, and customer for easy retrieval
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Location Support</h3>
              <p className="text-gray-600">
                Manage multiple clinic locations and team members from one dashboard
              </p>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="mb-6">
              Set up your clinic in minutes and start recording sessions today
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Create Your Clinic Account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 PT Session Recorder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
