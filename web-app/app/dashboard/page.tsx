import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getSessionsByClinicId } from '@/lib/db/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const sessions = await getSessionsByClinicId(user.clinicId, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">PT Session Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name} ({user.role})
              </span>
              <a
                href="/api/auth/signout"
                className="text-sm text-blue-600 hover:underline"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Sessions</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{sessions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Recording</CardTitle>
              <CardDescription>Currently recording</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {sessions.filter(s => s.status === 'recording').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
              <CardDescription>Finished sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {sessions.filter(s => s.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest therapy sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No sessions recorded yet</p>
                <p className="text-sm">
                  Install the Chrome extension to start recording sessions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {session.customerName || 'Guest Customer'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.startedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'recording'
                            ? 'bg-red-100 text-red-700'
                            : session.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
