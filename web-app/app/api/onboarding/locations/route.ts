import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createLocation } from '@/lib/db/location';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { locations } = body;

    if (!locations || !Array.isArray(locations)) {
      return NextResponse.json(
        { error: 'Invalid locations data' },
        { status: 400 }
      );
    }

    const createdLocations = [];
    for (const location of locations) {
      const created = await createLocation(user.clinicId, location);
      createdLocations.push(created);
    }

    return NextResponse.json({ locations: createdLocations }, { status: 201 });
  } catch (error) {
    console.error('Create locations error:', error);
    return NextResponse.json(
      { error: 'Failed to create locations' },
      { status: 500 }
    );
  }
}
