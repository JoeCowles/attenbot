import { OpenAI } from "openai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { zodToJsonSchema } from "zod-to-json-schema";

export const vidSchema = z.object({
  ids: z.array(z.string()),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    // Convert Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(vidSchema) as { properties: Record<string, unknown>, required?: string[] };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Your job is to create a JSON object that contains a list of ids for YouTube videos. You work as a filter for YouTube videos. You will be given a list of things that the user doesn't want to see; you will need to filter out anything that doesn't fit the criteria. Make sure to return only JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      functions: [
        {
          name: "get_video_ids",
          description:
            "Returns a list of YouTube video IDs that meet the criteria.",
          parameters: {
            type: "object",
            properties: jsonSchema.properties,
            required: jsonSchema.required ?? [],
          },
        },
      ],
      function_call: { name: "get_video_ids" },
    });

    const functionCall = response.choices[0].message.function_call;

    if (functionCall && functionCall.arguments) {
      const args = JSON.parse(functionCall.arguments);
      const parsedData = vidSchema.safeParse(args);

      if (parsedData.success) {
        return NextResponse.json(parsedData.data);
      } else {
        return NextResponse.json(
          { error: "Invalid response format", details: parsedData.error },
          { status: 400 }
        );
      }
    } else {
      throw new Error("No function call in response");
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
