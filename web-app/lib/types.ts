export interface Clinic {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  clinicId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'therapist';
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  clinicId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  clinicId: string;
  locationId: string;
  therapistId: string;
  customerId?: string;
  customerName?: string;
  isGuestCustomer: boolean;
  audioUrl?: string;
  audioBlob?: string;
  transcript?: string;
  duration: number;
  status: 'recording' | 'completed' | 'processing';
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLocation {
  userId: string;
  locationId: string;
}
