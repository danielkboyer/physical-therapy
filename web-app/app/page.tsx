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
          <h1 className="text-2xl font-bold text-blue-600">Your App Name</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Build Something Amazing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Next.js + Neo4j + Chrome Extension + Vercel AI SDK
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Next.js 16</h3>
              <p className="text-gray-600">
                Modern React framework with App Router and Server Components
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Neo4j Database</h3>
              <p className="text-gray-600">
                Graph database for complex relationships and powerful queries
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🧩</div>
              <h3 className="text-xl font-semibold mb-2">Chrome Extension</h3>
              <p className="text-gray-600">
                Browser extension integrated with your web app backend
              </p>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Build?</h3>
            <p className="mb-6">
              Clean architecture ready for your next great idea
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 Your App Name. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
