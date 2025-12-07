import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// GET /api/example
export async function GET(request: NextRequest) {
  try {
    // Example: Require authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Implement your logic here
    return NextResponse.json({
      message: 'Hello from the API!',
      user: session.user
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/example
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Implement your logic here
    return NextResponse.json(
      { message: 'Created successfully', data: body },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
