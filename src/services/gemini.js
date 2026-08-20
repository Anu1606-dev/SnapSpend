import { GoogleGenAI } from '@google/genai'
import { CATEGORIES } from '../utils/categories'
import { getLocalDateString } from '../utils/date'

const MODEL = 'gemini-3.7-flash'
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

// Retries transient failures (503 = servers busy, 429 = rate limited).
// Any other error fails immediately since retrying won't help.
async function withRetry(callFn, maxRetries = 2) {
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callFn()
    } catch (err) {
      lastError = err
      const message = err?.message?.toLowerCase() || ''
      const isTransient =
        message.includes('503') ||
        message.includes('unavailable') ||
        message.includes('429') ||
        message.includes('resource_exhausted')

      if (!isTransient || attempt === maxRetries) throw err

      const delayMs = 1000 * (attempt + 1)
      console.warn(`Gemini call failed (attempt ${attempt + 1}), retrying in ${delayMs}ms...`, err)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw lastError
}

// ---------- Feature 3 & 4: receipt extraction + category suggestion ----------

export async function extractReceiptData(imageFile) {
  const base64Image = await fileToBase64(imageFile)

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
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
  )

  return JSON.parse(response.text)
}

export async function suggestCategory(merchant, note = '') {
  const response = await withRetry(() =>
    ai.models.generateContent({
      model: MODEL,
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
  )

  const parsed = JSON.parse(response.text)
  return parsed.category
}

// ---------- Feature 7: AI chat with function calling ----------

const getExpenseSummaryDeclaration = {
  name: 'getExpenseSummary',
  description:
    "Get the total amount spent, number of transactions, and a per-category breakdown for a date range and/or category. Use this for questions about totals or 'how much did I spend'.",
  parameters: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        description: 'Start of the date range, in YYYY-MM-DD format. Omit to include all history.',
      },
      endDate: {
        type: 'string',
        description: 'End of the date range, in YYYY-MM-DD format (inclusive). Omit to include up to today.',
      },
      category: {
        type: 'string',
        enum: CATEGORIES,
        description: 'Filter to a single category. Omit to include all categories.',
      },
    },
  },
}

const listExpensesDeclaration = {
  name: 'listExpenses',
  description:
    "Get a list of individual expense transactions matching filters. Use this when the user wants to see specific transactions, e.g. 'what did I buy at Amazon' or 'show my food purchases last week'.",
  parameters: {
    type: 'object',
    properties: {
      startDate: { type: 'string', description: 'Start of the date range, in YYYY-MM-DD format.' },
      endDate: { type: 'string', description: 'End of the date range, in YYYY-MM-DD format (inclusive).' },
      category: { type: 'string', enum: CATEGORIES, description: 'Filter to a single category.' },
      merchant: {
        type: 'string',
        description: 'Filter to expenses where the merchant name contains this text (case-insensitive).',
      },
      limit: { type: 'number', description: 'Maximum number of results to return. Defaults to 20.' },
    },
  },
}

// These run entirely on your machine against the expenses already loaded
// from Firestore — Gemini never sees or touches your raw data directly,
// it only ever receives the computed result.

function runGetExpenseSummary(args, expenses) {
  const { startDate, endDate, category } = args || {}
  let filtered = expenses
  if (startDate) filtered = filtered.filter((e) => e.date >= startDate)
  if (endDate) filtered = filtered.filter((e) => e.date <= endDate)
  if (category) filtered = filtered.filter((e) => e.category === category)

  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0)
  const categoryBreakdown = {}
  filtered.forEach((e) => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + Number(e.amount)
  })

  return {
    total: Number(total.toFixed(2)),
    transactionCount: filtered.length,
    categoryBreakdown,
  }
}

function runListExpenses(args, expenses) {
  const { startDate, endDate, category, merchant, limit } = args || {}
  let filtered = expenses
  if (startDate) filtered = filtered.filter((e) => e.date >= startDate)
  if (endDate) filtered = filtered.filter((e) => e.date <= endDate)
  if (category) filtered = filtered.filter((e) => e.category === category)
  if (merchant) {
    const needle = merchant.toLowerCase()
    filtered = filtered.filter((e) => e.merchant.toLowerCase().includes(needle))
  }

  const sorted = [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1))
  const capped = sorted.slice(0, limit || 20)

  return {
    matchCount: filtered.length,
    expenses: capped.map((e) => ({
      merchant: e.merchant,
      amount: Number(e.amount),
      category: e.category,
      date: e.date,
      note: e.note || '',
    })),
  }
}

function executeFunctionCall(name, args, expenses) {
  if (name === 'getExpenseSummary') return runGetExpenseSummary(args, expenses)
  if (name === 'listExpenses') return runListExpenses(args, expenses)
  return { error: `Unknown function: ${name}` }
}

// Creates one persistent chat session. The Chat object keeps its own
// conversation history internally, so calling sendChatMessage() repeatedly
// on the SAME session lets follow-up questions ("what about last month?")
// stay in context.
export function createExpenseChatSession() {
  const today = getLocalDateString()

  return ai.chats.create({
    model: MODEL,
    config: {
      systemInstruction: `You are a helpful personal finance assistant inside an expense tracking app called SnapSpend.
Today's date is ${today}.
You have two tools: getExpenseSummary (for totals and category breakdowns) and listExpenses (for individual transactions).
Always use a tool to look up real data before answering — never guess or make up numbers.
When the user mentions a relative time period ("last month", "this week", "in March"), compute the actual startDate and endDate yourself in YYYY-MM-DD format based on today's date, and pass them to the tool.
Keep answers short and conversational — a sentence or two, not a report. Use ₹ for currency. If a tool returns no matching expenses, say so plainly.`,
      tools: [{ functionDeclarations: [getExpenseSummaryDeclaration, listExpensesDeclaration] }],
    },
  })
}

export async function sendChatMessage(chatSession, userMessage, expenses) {
  let response = await withRetry(() => chatSession.sendMessage({ message: userMessage }))

  // Function-calling loop: resolve calls until Gemini gives a plain text
  // answer. Capped at 3 rounds as a safety net against unexpected looping.
  let rounds = 0
  while (response.functionCalls && response.functionCalls.length > 0 && rounds < 3) {
    const call = response.functionCalls[0]
    const result = executeFunctionCall(call.name, call.args, expenses)

    response = await withRetry(() =>
      chatSession.sendMessage({
        message: {
          functionResponse: {
            name: call.name,
            response: result,
          },
        },
      })
    )
    rounds++
  }

  return response.text || "I looked into that but couldn't come up with a clear answer — try rephrasing?"
}