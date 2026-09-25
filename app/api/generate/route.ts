import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { MODEL_ID, type Generation } from '@/lib/types'

const MAX_PROMPT_LENGTH = 8000

export async function POST(request: Request) {
  let prompt: unknown
  try {
    ;({ prompt } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }
  const cleanPrompt = prompt.trim()
  if (cleanPrompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt must be under ${MAX_PROMPT_LENGTH} characters.` },
      { status: 400 },
    )
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not configured. Add it in the Vars section of project settings.' },
      { status: 503 },
    )
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  let responseText: string
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: 'You are a helpful, concise assistant.' },
        { role: 'user', content: cleanPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })
    responseText = completion.choices[0]?.message?.content?.trim() ?? ''
  } catch (error) {
    console.error('Groq request failed:', error)
    return NextResponse.json({ error: 'The AI model request failed. Please try again.' }, { status: 502 })
  }

  const fallback: Generation = {
    id: crypto.randomUUID(),
    prompt: cleanPrompt,
    response: responseText,
    model: MODEL_ID,
    created_at: new Date().toISOString(),
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ generation: fallback, saved: false })
  }

  const { data, error } = await supabase
    .from('generations')
    .insert({ prompt: cleanPrompt, response: responseText, model: MODEL_ID })
    .select('id, prompt, response, model, created_at')
    .single()

  if (error) {
    console.error('Failed to save generation:', error.message)
    return NextResponse.json({ generation: fallback, saved: false })
  }

  return NextResponse.json({ generation: data as Generation, saved: true })
}
