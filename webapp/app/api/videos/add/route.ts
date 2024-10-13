import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    const supabase = createClient()

    const { videoId, studentId, title, image, channel } = await request.json()
    
    if (!videoId || !studentId || !title || !image || !channel) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
        const { data, error } = await supabase
            .from('videos')
            .insert({
                link: videoId,
                student_id: studentId,
                title: title,
                image: image,
                channel: channel
            })
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data }, { status: 201 })
    } catch (error) {
        console.error('Error adding video:', error)
        return NextResponse.json({ error: 'Failed to add video' }, { status: 500 })
    }
}
