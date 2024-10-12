import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Takes in a link, studentID, title, thumbnail (base64)
export async function POST(request: NextRequest) {
    const { videoId, studentId, title, thumbnailBase64 } = await request.json()
    
    if (!videoId || !studentId || !title || !thumbnailBase64) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
        const { data, error } = await supabase
            .from('videos')
            .insert({
                link: videoId,
                student_id: studentId,
                title: title,
                image: thumbnailBase64
            })
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data }, { status: 201 })
    } catch (error) {
        console.error('Error adding video:', error)
        return NextResponse.json({ error: 'Failed to add video' }, { status: 500 })
    }
}
