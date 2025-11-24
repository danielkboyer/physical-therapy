'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Location {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface TeamMember {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'therapist';
  locationIds: number[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'locations' | 'team'>('locations');
  const [locations, setLocations] = useState<Location[]>([
    { name: '', address: '', city: '', state: '', zipCode: '' }
  ]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const addLocation = () => {
    setLocations([...locations, { name: '', address: '', city: '', state: '', zipCode: '' }]);
  };

  const updateLocation = (index: number, field: keyof Location, value: string) => {
    const updated = [...locations];
    updated[index][field] = value;
    setLocations(updated);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const addTeamMember = () => {
    setTeam([...team, { firstName: '', lastName: '', email: '', password: '', role: 'therapist', locationIds: [] }]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: any) => {
    const updated = [...team];
    updated[index][field] = value;
    setTeam(updated);
  };

  const removeTeamMember = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  const handleSubmitLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locations }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create locations');
      }

      setStep('team');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to create locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ team }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add team members');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to add team members');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'locations') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add Your Locations</CardTitle>
              <CardDescription>
                Add all the physical locations where your clinic operates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {locations.map((location, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Location {index + 1}</h3>
                      {locations.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLocation(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label>Location Name</Label>
                      <Input
                        value={location.name}
                        onChange={(e) => updateLocation(index, 'name', e.target.value)}
                        placeholder="Downtown Clinic"
                        required
                      />
                    </div>

                    <div>
                      <Label>Address</Label>
                      <Input
                        value={location.address}
                        onChange={(e) => updateLocation(index, 'address', e.target.value)}
                        placeholder="123 Main St"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label>City</Label>
                        <Input
                          value={location.city}
                          onChange={(e) => updateLocation(index, 'city', e.target.value)}
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={location.state}
                          onChange={(e) => updateLocation(index, 'state', e.target.value)}
                          placeholder="NY"
                          required
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Zip Code</Label>
                      <Input
                        value={location.zipCode}
                        onChange={(e) => updateLocation(index, 'zipCode', e.target.value)}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addLocation} className="w-full">
                + Add Another Location
              </Button>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep('team')}>
                  Skip for Now
                </Button>
                <Button onClick={handleSubmitLocations} disabled={loading}>
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add Team Members</CardTitle>
            <CardDescription>
              Invite therapists and staff to your clinic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {team.map((member, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Team Member {index + 1}</h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTeamMember(index)}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={member.firstName}
                        onChange={(e) => updateTeamMember(index, 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={member.lastName}
                        onChange={(e) => updateTeamMember(index, 'lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Temporary Password</Label>
                    <Input
                      type="password"
                      value={member.password}
                      onChange={(e) => updateTeamMember(index, 'password', e.target.value)}
                      placeholder="They can change this later"
                      required
                    />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Select
                      value={member.role}
                      onValueChange={(value) => updateTeamMember(index, 'role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="therapist">Therapist</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addTeamMember} className="w-full">
              + Add Team Member
            </Button>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                Skip for Now
              </Button>
              <Button onClick={handleSubmitTeam} disabled={loading || team.length === 0}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
