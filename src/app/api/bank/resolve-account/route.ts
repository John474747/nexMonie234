
import { NextResponse } from 'next/server';
import { getRouteUser } from '@/lib/supabase-server';


export async function POST(request: Request) {

  const user = await getRouteUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { accountNumber, bankCode } = await request.json();

  // Simulate network delay
  await new Promise(r => setTimeout(r, 1000));

  if (accountNumber && accountNumber.length === 10) {
    return NextResponse.json({
      success: true,
      accountName: "CHUKWUMA OGBONNA"
    });
  }

  return NextResponse.json({
    success: false,
    error: "Could not resolve account name"
  }, { status: 400 });
}
