import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Function to get all students for a parent
export async function GET(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(students)
}

// Function to add a new student
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the parent exists, if not, create them
    const { data: existingParent, error: parentError } = await supabase
      .from('parents')
      .select('auth_id')
      .eq('auth_id', user.id)
      .single();

    if (parentError && parentError.code !== 'PGRST116') {
      console.error('Error checking parent:', parentError);
      return NextResponse.json({ error: 'Error checking parent' }, { status: 500 });
    }

    if (!existingParent) {
      const { error: insertError } = await supabase
        .from('parents')
        .insert({ auth_id: user.id, email: user.email });

      if (insertError) {
        console.error('Error inserting parent:', insertError);
        return NextResponse.json({ error: 'Error creating parent' }, { status: 500 });
      }
    }

    const { name } = await request.json();

    const { data, error } = await supabase
      .from('students')
      .insert({ name, parent_id: user.id })
      .select();

    if (error) {
      console.error('Error inserting student:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error in POST /api/students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to update a student's filters
export async function PATCH(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { student_id, filters } = await request.json()

  const { data, error } = await supabase
    .from('students')
    .update({ filters })
    .eq('student_id', student_id)
    .eq('parent_id', user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

// Function to delete a student
export async function DELETE(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { student_id } = await request.json()

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('student_id', student_id)
    .eq('parent_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Student deleted successfully' })
}
