import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const url = `${supabaseUrl}/storage/v1/object/public/echos/${filename}`
  return NextResponse.redirect(url)
}
