import { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

function buildSystemPrompt(context: Record<string, unknown>): string {
  const { role, accessiblePages, stats, today } = context as {
    role: string
    accessiblePages: string[]
    stats: Record<string, unknown>
    today: string
  }

  return `You are BuzinessIQ AI, a smart business assistant embedded inside a Ghanaian business management platform.

The user's role is: **${role}**
Today's date: ${today}
Pages they can access: ${accessiblePages.join(", ")}

Current business snapshot:
${JSON.stringify(stats, null, 2)}

Your job:
- Answer natural language questions about the business using the snapshot above
- Be concise and direct — 2-5 sentences max unless listing items
- Always quote specific numbers when they appear in the snapshot
- When you mention a page or section the user can navigate to, format it as a markdown link: [Page Name](/path)
  Example: [View Expenses](/accounting/expenses) or [Payroll](/payroll)
- If the user asks about something outside their role's access, politely say it's restricted
- Speak in plain English — no jargon, no markdown headers, no bullet walls
- If data is missing or zero, say so honestly
- You are aware this is a Ghanaian business; currency is GHS (Ghana Cedis)`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, context } = body as { query: string; context: Record<string, unknown> }

    if (!query?.trim()) {
      return new Response("Query is required", { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: buildSystemPrompt(context),
    })

    const result = await model.generateContentStream(query)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (err) {
    console.error("[AI Search] Error:", err)
    return new Response("Failed to process query", { status: 500 })
  }
}
