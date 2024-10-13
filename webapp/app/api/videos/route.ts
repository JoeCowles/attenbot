import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const student_id = searchParams.get('student_id')
  const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

  if (!student_id) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
  }

  // Calculate the start and end dates for the week
  const now = new Date()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - (7 * weekOffset))
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) // Set to tomorrow at 00:00

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('student_id', student_id)
      .gte('timestamp', startOfWeek.toISOString())
      .lte('timestamp', endOfWeek.toISOString())
      .order('timestamp', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'An error occurred while fetching videos' }, { status: 500 })
  }
}
