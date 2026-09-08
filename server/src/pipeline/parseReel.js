// Video URL -> { recipe, ingredients[] }. Orchestrates:
//   1. resolve the source (yt-dlp for YouTube, fetch for any other URL)  [VIDEO_RESOLVE_ENABLED]
//   2. extract a structured ingredient list with Claude                  [LLM_ENABLED]
//
// Both steps are independently flagged:
//   - neither  -> pure fixture (Paneer Butter Masala), unchanged demo flow
//   - resolve only -> real title / thumbnail / embed, fixture ingredient list
//   - resolve + llm -> the real thing

import { config } from '../config.js'
import { RECIPES, PBM_INGREDIENTS } from '../fixtures/data.js'
import { resolveSource } from './sources/index.js'
import { extractIngredients } from './extract.js'

const FIXTURE_INGREDIENTS = PBM_INGREDIENTS.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit }))

function fixtureRecipe(url) {
  const r = RECIPES.pbm
  return {
    id: r.id,
    title: r.title,
    chef: r.chef,
    chefName: r.chefName,
    time: r.time,
    serves: r.serves,
    reelHandle: r.reelHandle,
    reelDuration: r.reelDuration,
    platform: null,
    videoId: null,
    embedUrl: null,
    thumbnailUrl: null,
    sourceUrl: url || null,
  }
}

function recipeFromContext(ctx, title, serves) {
  return {
    id: `src-${Date.now().toString(36)}`,
    title: title || ctx.title || 'Recipe',
    chef: null,
    chefName: ctx.author || '',
    serves: serves || 4,
    platform: ctx.platform,
    videoId: ctx.videoId,
    embedUrl: ctx.embedUrl,
    thumbnailUrl: ctx.thumbnailUrl,
    sourceUrl: ctx.url,
  }
}

function toBuildIngredient(i) {
  return {
    name: i.name,
    qty: [i.quantity, i.unit].filter(Boolean).join(' ') || i.note || '',
    unit: i.unit || '',
  }
}

/**
 * @param {{ url: string }} input
 * @returns {Promise<{ recipe: object, ingredients: Array<{name:string, qty:string, unit:string}> }>}
 */
export async function parseReel({ url }) {
  if (!config.videoResolve.enabled && !config.llm.enabled) {
    return { recipe: fixtureRecipe(url), ingredients: FIXTURE_INGREDIENTS }
  }

  const ctx = await resolveSource(url)

  if (!config.llm.enabled) {
    // Real video, fixture list — lets the player/thumbnail be demoed without an API key.
    return { recipe: recipeFromContext(ctx, ctx.title, RECIPES.pbm.serves), ingredients: FIXTURE_INGREDIENTS }
  }

  const { title, serves, ingredients } = await extractIngredients(ctx)
  return {
    recipe: recipeFromContext(ctx, title, serves),
    ingredients: ingredients.map(toBuildIngredient),
  }
}
