import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ generations: [], configured: false })
  }

  const { data, error } = await supabase
    .from('generations')
    .select('id, prompt, response, model, created_at')
    .order('created_at', { ascending: false })
    .limit(25)

  if (error) {
    console.error('Failed to load generations:', error.message)
    return NextResponse.json({ generations: [], configured: true, error: 'Could not load history.' })
  }

  return NextResponse.json({ generations: data, configured: true })
}
