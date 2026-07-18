
import { NextResponse } from 'next/server';
import { getRouteUser } from '@/lib/supabase-server';


export async function GET() {

  const user = await getRouteUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const networks = [
    { id: 'mtn', name: 'MTN', logo: 'M' },
    { id: 'airtel', name: 'Airtel', logo: 'A' },
    { id: 'glo', name: 'Glo', logo: 'G' },
    { id: '9mobile', name: '9mobile', logo: '9' },
  ];
  return NextResponse.json(networks);
}
