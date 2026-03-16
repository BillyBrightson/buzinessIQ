import { NextRequest } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" })

function buildSystemPrompt(context: Record<string, unknown>): string {
  const today = context.today as string

  // General mode: unauthenticated visitors on the homepage
  if (context.mode === "general") {
    return `You are BuzinessIQ AI, a smart business assistant for BuzinessIQ — a Ghanaian business management platform.

Today's date: ${today}

You are speaking to a visitor who is NOT logged in. Your job:
- Answer general questions about business management, how BuzinessIQ works, its features, and how it can help Ghanaian businesses
- You can explain features like POS, payroll, invoicing, attendance, multi-branch management, RBAC, and AI search
- Do NOT ask about or reference any specific company's private data — you have none
- Keep answers concise (2–5 sentences) and friendly
- You are aware this platform is built for Ghanaian businesses; currency is GHS (Ghana Cedis)
- If someone asks you something totally unrelated to business (e.g. coding, sports, etc.), politely redirect them to business topics`
  }

  // App mode: authenticated users inside the application
  const { role, accessiblePages, stats } = context as {
    role: string
    accessiblePages: string[]
    stats: Record<string, unknown>
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
  if (!process.env.GROQ_API_KEY) {
    console.error("[AI Search] GROQ_API_KEY is not set")
    return new Response("AI service not configured", { status: 503 })
  }

  let body: { query: string; context: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid JSON body", { status: 400 })
  }

  const { query, context } = body

  if (!query?.trim()) {
    return new Response("Query is required", { status: 400 })
  }

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        { role: "user", content: query },
      ],
      stream: true,
      max_tokens: 512,
      temperature: 0.5,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ""
            if (text) controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (streamErr) {
          console.error("[AI Search] Stream error:", streamErr)
          controller.enqueue(encoder.encode("Sorry, the response was interrupted. Please try again."))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[AI Search] Error:", message)

    const encoder = new TextEncoder()
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`I ran into an issue: ${message}. Please try again.`))
          controller.close()
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )
  }
}
