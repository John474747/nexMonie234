
import { NextResponse } from 'next/server';
import { getRouteUser } from '@/lib/supabase-server';


export async function GET() {

  const user = await getRouteUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const banks = [
    { id: '044', name: 'Access Bank' },
    { id: '058', name: 'GTBank' },
    { id: '057', name: 'Zenith Bank' },
    { id: '033', name: 'UBA' },
    { id: '011', name: 'First Bank' },
    { id: '070', name: 'Fidelity Bank' },
    { id: '214', name: 'FCMB' },
    { id: '221', name: 'Stanbic IBTC' },
    { id: '030', name: 'Sterling Bank' },
    { id: '035', name: 'Wema Bank' },
    { id: '50515', name: 'Moniepoint MFB' },
    { id: '999992', name: 'Opay' },
    { id: '999991', name: 'PalmPay' },
    { id: '50211', name: 'Kuda' },
  ];
  return NextResponse.json(banks);
}
