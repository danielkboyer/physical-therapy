import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSession, getSessionsByClinicId, getSessionsByTherapistId } from '@/lib/db/session';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get('therapistId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sessions;
    if (therapistId) {
      sessions = await getSessionsByTherapistId(therapistId, limit, offset);
    } else {
      sessions = await getSessionsByClinicId(user.clinicId, limit, offset);
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { locationId, therapistId, customerId, customerName } = body;

    if (!locationId || !therapistId) {
      return NextResponse.json(
        { error: 'Location ID and Therapist ID are required' },
        { status: 400 }
      );
    }

    const session = await createSession(
      user.clinicId,
      locationId,
      therapistId,
      customerId,
      customerName
    );

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
