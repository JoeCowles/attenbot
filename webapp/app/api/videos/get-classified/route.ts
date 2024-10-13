import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { OpenAI } from "openai"
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

const videoSchema = z.object({
  classifications: z.array(z.object({
    link: z.string(),
    category: z.enum(["educational", "entertainment", "unknown"])
  }))
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  console.log('Query parameters:', { studentId, dateFrom, dateTo })

  if (!studentId || !dateFrom || !dateTo) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select('link, title, timestamp, student_id, channel')
      .eq('student_id', studentId)
      .gte('timestamp', dateFrom)
      .lte('timestamp', dateTo)

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    console.log('Fetched videos:', videos)

    if (!videos || videos.length === 0) {
      console.log('No videos found for the given criteria')
      return NextResponse.json({ message: 'No videos found for the given criteria' }, { status: 204 })
    }

    // Log some details about the found videos
    videos.forEach((video, index) => {
      console.log(`Video ${index + 1}:`, {
        title: video.title,
        timestamp: video.timestamp,
        student_id: video.student_id
      })
    })

    const jsonSchema = zodToJsonSchema(videoSchema) as { properties: Record<string, unknown>, required?: string[] }

    const prompt = `Classify the following YouTube videos as "educational", "entertainment", or "unknown" based on their titles and channel names:
    ${videos.map(v => `${v.link}: Title: "${v.title}", Channel: "${v.channel}"`).join('\n')}
    
    Respond with a JSON object containing an array of classification objects, each with link and category.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a video classification assistant. your job is to classify the videos provided to you into three categories: educational, entertainment, or unknown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      functions: [
        {
          name: "classify_videos",
          description: "Classifies videos into categories",
          parameters: {
            type: "object",
            properties: jsonSchema.properties,
            required: jsonSchema.required ?? [],
          },
        },
      ],
      function_call: { name: "classify_videos" },
    })

    const functionCall = response.choices[0].message.function_call

    if (functionCall && functionCall.arguments) {
      const args = JSON.parse(functionCall.arguments)
      const parsedData = videoSchema.safeParse(args)

      if (parsedData.success) {
        // Combine the classifications with the original video data
        const classifiedVideos = videos.map(video => {
          const classification = parsedData.data.classifications.find(c => c.link === video.link)
          return {
            ...video,
            category: classification ? classification.category : "unknown"
          }
        })

        return NextResponse.json({ videos: classifiedVideos })
      } else {
        return NextResponse.json(
          { error: "Invalid response format", details: parsedData.error },
          { status: 400 }
        )
      }
    } else {
      throw new Error("No function call in response")
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 })
  }
}
