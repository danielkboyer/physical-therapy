import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getLocationsByClinicId } from '@/lib/db/location';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const locations = await getLocationsByClinicId(user.clinicId);

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
