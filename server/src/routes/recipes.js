import { Router } from 'express'
import { z } from 'zod'
import { parseReel } from '../pipeline/parseReel.js'

export const recipes = Router()

const Body = z.object({
  url: z.string().url('Paste a full video or recipe URL'),
})

// POST /recipes/parse — video/recipe URL -> { recipe, ingredients[] }
recipes.post('/parse', async (req, res, next) => {
  try {
    const input = Body.parse(req.body || {})
    const result = await parseReel(input)
    req.session.lastParse = result // so /cart/build can run without re-parsing
    res.json(result)
  } catch (e) {
    if (e?.issues) e.status = 400
    if (e?.needsManualEntry) {
      return res.status(e.status || 422).json({ error: e.message, needsManualEntry: true })
    }
    next(e)
  }
})
