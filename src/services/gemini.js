import { GoogleGenAI } from '@google/genai'
import { CATEGORIES } from '../utils/categories'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Wraps a Gemini call with automatic retries for TRANSIENT failures only —
// 503 (server temporarily overloaded) and 429 (rate limited). Any other
// error (bad request, invalid key, etc.) fails immediately since retrying
// won't help.
async function generateWithRetry(request, maxRetries = 2) {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(request)
    } catch (err) {
      lastError = err
      const message = err?.message?.toLowerCase() || ''
      const isTransient =
        message.includes('503') ||
        message.includes('unavailable') ||
        message.includes('429') ||
        message.includes('resource_exhausted')

      if (!isTransient || attempt === maxRetries) {
        throw err
      }

      // Wait a bit longer each retry: 1s, then 2s
      const delayMs = 1000 * (attempt + 1)
      console.warn(`Gemini call failed (attempt ${attempt + 1}), retrying in ${delayMs}ms...`, err)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

export async function extractReceiptData(imageFile) {
  const base64Image = await fileToBase64(imageFile)

  const response = await generateWithRetry({
    model: 'gemini-3.7-flash',
    contents: [
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
      {
        text: `You are looking at a photo of a shopping receipt or invoice.
Extract these details and respond with ONLY the requested JSON:
- merchant: the store or business name
- amount: the final total amount paid, as a plain number (no currency symbol, no commas)
- date: the transaction date in YYYY-MM-DD format. If the year is missing, assume the current year.
- category: the single best-fitting category for this expense, chosen from the allowed list.

If a field isn't clearly visible, make your best reasonable guess rather than leaving it blank.`,
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          merchant: { type: 'string' },
          amount: { type: 'number' },
          date: { type: 'string' },
          category: { type: 'string', enum: CATEGORIES },
        },
        required: ['merchant', 'amount', 'date', 'category'],
      },
    },
  })

  return JSON.parse(response.text)
}

export async function suggestCategory(merchant, note = '') {
  const response = await generateWithRetry({
    model: 'gemini-3.7-flash',
    contents: `Classify this expense into the single best-fitting category.
Merchant: ${merchant}
Note: ${note || '(none)'}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: CATEGORIES },
        },
        required: ['category'],
      },
    },
  })

  const parsed = JSON.parse(response.text)
  return parsed.category
}