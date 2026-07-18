
import { NextResponse } from 'next/server';
import { getRouteUser } from '@/lib/supabase-server';


export async function POST(request: Request) {

  const user = await getRouteUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { accountNumber } = body;

  // Simulate network delay
  await new Promise(r => setTimeout(r, 1000));

  if (accountNumber && accountNumber.length >= 8) {
    return NextResponse.json({
      success: true,
      customerName: "SARAH NICHOLAS",
      address: "12, Elite Command Center, Lagos",
    });
  }

  return NextResponse.json({
    success: false,
    error: "Invalid account or meter number"
  }, { status: 400 });
}
