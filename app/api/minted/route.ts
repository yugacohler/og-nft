import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  // TODO: Get right token ID.
  return NextResponse.redirect(
    'https://testnets.opensea.io/assets/base-sepolia/0x92dffae5776b8b6fd076e9166b3e5736f4408f84/1',
    { status: 302 },
  );
}

export const dynamic = 'force-dynamic';
