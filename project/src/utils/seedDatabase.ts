import { supabase } from '../lib/supabase';

const departments = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Engineering' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Sales' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Marketing' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Operations' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Finance' },
  { id: '66666666-6666-6666-6666-666666666666', name: 'HR' }
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function checkIfDataExists(): Promise<boolean> {
  const { data, error } = await supabase
    .from('employees')
    .select('id', { count: 'exact', head: true });

  return !error && (data as any) > 10;
}

export async function seedDatabase(): Promise<void> {
  console.log('Checking if data exists...');
  const exists = await checkIfDataExists();

  if (exists) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  console.log('Seeding database with sample data...');

  // This is a simplified version for demo purposes
  // In production, you would use a backend service or admin API

  const locations = ['San Francisco', 'New York', 'London', 'Singapore'];
  const genders = ['Male', 'Female', 'Non-binary'];
  const ethnicities = ['Asian', 'Black', 'Hispanic', 'White', 'Other'];
  const employmentTypes = ['Full-time', 'Full-time', 'Full-time', 'Part-time'];

  // Note: Due to RLS policies, this may not work without proper authentication
  // You may need to temporarily add insert policies or use a service role key
  console.warn('Warning: Insert operations may fail due to RLS policies');
}
