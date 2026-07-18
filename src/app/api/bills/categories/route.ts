
import { NextResponse } from 'next/server';
import { getRouteUser } from '@/lib/supabase-server';


export async function GET() {

  const user = await getRouteUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const categories = [
    { id: 'electricity', name: 'Electricity', icon: 'Zap' },
    { id: 'cable', name: 'Cable TV', icon: 'Tv' },
    { id: 'internet', name: 'Internet', icon: 'Wifi' },
    { id: 'betting', name: 'Betting', icon: 'Target' },
    { id: 'education', name: 'Education', icon: 'GraduationCap' },
  ];
  return NextResponse.json(categories);
}
