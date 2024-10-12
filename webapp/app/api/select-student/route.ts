import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// Helper function to handle CORS
function corsHandler(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin') || '*'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Function to get all students for a parent
export async function GET(request: NextRequest) {
  const supabase = createClient()

  console.log('Request headers:', Object.fromEntries(request.headers))

  // Get the authorization header
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    console.log('No authorization header')
    return corsHandler(request, NextResponse.json({ error: 'No authorization header' }, { status: 401 }))
  }

  // Extract the token
  const token = authHeader.split(' ')[1]
  if (!token) {
    console.log('No token provided')
    return corsHandler(request, NextResponse.json({ error: 'No token provided' }, { status: 401 }))
  }

  console.log('Token:', token)

  // Verify the token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    console.log('Auth error:', authError)
    console.log('User:', user)
    return corsHandler(request, NextResponse.json({ error: 'Invalid token' }, { status: 401 }))
  }

  console.log('Authenticated user:', user)

  // Test query to check if we can access the students table
  const { data: testData, error: testError } = await supabase
    .from('students')
    .select('count')

  console.log('Test query result:', testData)
  console.log('Test query error:', testError)

  // Fetch students
  const { data: students, error } = await supabase
    .from('students')
    .select('*')

  console.log('Students query:', `SELECT * FROM students`)
  console.log('Students:', students)
  console.log('Query error:', error)

  if (error) {
    return corsHandler(request, NextResponse.json({ error: error.message }, { status: 500 }))
  }

  return corsHandler(request, NextResponse.json(students || []))
}

// Function to select a student
export async function POST(request: NextRequest) {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return corsHandler(request, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const { student_id } = await request.json()

  if (!student_id) {
    return corsHandler(request, NextResponse.json({ error: 'Student ID is required' }, { status: 400 }))
  }

  // Verify that the student belongs to the authenticated parent
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('student_id', student_id)
    .eq('parent_id', user.id)
    .single()
  if (error || !student) {
    return corsHandler(request, NextResponse.json({ error: 'Student not found or not authorized' }, { status: 404 }))
  }

  // Here you can add any additional logic for selecting a student
  // For example, you might want to update a 'selected' field in the database
  // or handle the selection in your application state

  return corsHandler(request, NextResponse.json({ message: 'Student selected successfully', student }))
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return corsHandler(request, new NextResponse(null, { status: 204 }))
}
