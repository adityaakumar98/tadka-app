// VideoContext -> { title, serves, ingredients: [{name, quantity, unit, note}] } via Claude.
// See the claude-api skill: @anthropic-ai/sdk, messages.create, model from config,
// low effort (this is a simple extraction), defensive JSON parse.

import { config } from '../config.js'

const SYSTEM = `You turn a cooking video's text into a grocery shopping list.
Return ONLY minified JSON:
{"title": string, "serves": number, "ingredients": [{"name": string, "quantity": string, "unit": string, "note": string}]}
Rules:
- "name" = the item as you'd search a quick-commerce grocery app ("Paneer", "Kashmiri chilli powder", "Amul butter").
- "quantity" + "unit" = what the recipe uses ("400","g" / "2","tbsp" / "1","pc"). Empty strings if unknown.
- "note" = short prep note or "" ("finely chopped", "for garnish").
- Merge duplicates. Drop water and plain salt. 4-20 items.
- If the text has no real recipe, return {"title":"","serves":0,"ingredients":[]}.`

function buildUserContent(ctx) {
  const parts = [`Title: ${ctx.title || ''}`]
  if (ctx.author) parts.push(`Creator: ${ctx.author}`)
  if (ctx.recipeYield) parts.push(`Yield: ${ctx.recipeYield}`)
  if (ctx.recipeIngredient?.length) parts.push(`Listed ingredients:\n- ${ctx.recipeIngredient.join('\n- ')}`)
  if (ctx.description) parts.push(`Description:\n${ctx.description.slice(0, 4000)}`)
  if (ctx.transcript) parts.push(`Transcript:\n${ctx.transcript.slice(0, 12000)}`)
  return parts.join('\n\n')
}

/** @returns {Promise<{title:string, serves:number, ingredients:Array}>} */
export async function extractIngredients(ctx) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: config.llm.apiKey || undefined })

  const res = await client.messages.create({
    model: config.llm.model,
    max_tokens: 2000,
    output_config: { effort: 'low' },
    system: SYSTEM,
    messages: [{ role: 'user', content: buildUserContent(ctx) }],
  })

  const text = (res.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')

  let parsed
  try {
    parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
  } catch {
    const err = new Error('Could not read a recipe out of that video')
    err.status = 422
    err.needsManualEntry = true
    throw err
  }

  const ingredients = (parsed.ingredients || [])
    .map((i) => ({
      name: String(i.name || '').trim(),
      quantity: String(i.quantity ?? '').trim(),
      unit: String(i.unit ?? '').trim(),
      note: String(i.note ?? '').trim(),
    }))
    .filter((i) => i.name)

  if (!ingredients.length) {
    const err = new Error('That video does not look like a recipe')
    err.status = 422
    err.needsManualEntry = true
    throw err
  }

  return { title: parsed.title || ctx.title, serves: Number(parsed.serves) || 4, ingredients }
}
