import { NextRequest, NextResponse } from 'next/server';
import { createClinic } from '@/lib/db/clinic';
import { createUser } from '@/lib/db/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clinicName, firstName, lastName, email, password } = body;

    if (!clinicName || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create the clinic
    const clinic = await createClinic(clinicName);

    // Create the admin user
    await createUser({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      clinicId: clinic.id,
    });

    return NextResponse.json(
      { message: 'Account created successfully', clinicId: clinic.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
