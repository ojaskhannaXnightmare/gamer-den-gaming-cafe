import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    upiId: process.env.UPI_ID || 'arpitrao2529-1@okhdfcbank',
    businessName: process.env.BUSINESS_NAME || "Gamer's Den",
  });
}
