import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createUser } from '@/lib/db/user';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { team } = body;

    if (!team || !Array.isArray(team)) {
      return NextResponse.json(
        { error: 'Invalid team data' },
        { status: 400 }
      );
    }

    const createdUsers = [];
    for (const member of team) {
      const created = await createUser({
        email: member.email,
        password: member.password,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        clinicId: user.clinicId,
        locationIds: member.locationIds || [],
      });
      createdUsers.push(created);
    }

    return NextResponse.json({ users: createdUsers }, { status: 201 });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: 'Failed to create team members' },
      { status: 500 }
    );
  }
}
