export type Generation = {
  id: string
  prompt: string
  response: string
  model: string
  created_at: string
}

export type GenerateResult = {
  generation: Generation
  saved: boolean
}

export const MODEL_ID = 'llama-3.3-70b-versatile'
