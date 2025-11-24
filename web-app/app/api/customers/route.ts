import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createCustomer, getCustomersByClinicId, searchCustomers } from '@/lib/db/customer';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let customers;
    if (query) {
      customers = await searchCustomers(user.clinicId, query);
    } else {
      customers = await getCustomersByClinicId(user.clinicId);
    }

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const customer = await createCustomer(user.clinicId, body);

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
