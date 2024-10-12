import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const student_id = searchParams.get('student_id')
  const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

  if (!student_id) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Calculate the start and end dates for the week
  const now = new Date()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - (7 * weekOffset))
  const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)

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
