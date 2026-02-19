import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Plants ───────────────────────────────────────────────────────────────────

export async function fetchPlants() {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function upsertPlant(plant) {
  const { data, error } = await supabase
    .from('plants')
    .upsert(plant, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlant(id) {
  const { error } = await supabase
    .from('plants')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Greenhouse (per-user, stored in localStorage keyed by a session ID) ─────
// For a single-user or small-team setup, greenhouse state lives in localStorage.
// When you add Supabase Auth later, replace the key with the user's UUID.

const GH_KEY = 'glasshouse-greenhouse-v1'

export function loadGreenhouseLocal() {
  try {
    const raw = localStorage.getItem(GH_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function saveGreenhouseLocal(set) {
  localStorage.setItem(GH_KEY, JSON.stringify([...set]))
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

/**
 * Upload an image file to the 'plant-images' Supabase Storage bucket.
 * Returns the public URL of the uploaded image.
 *
 * @param {File} file - The image File object from an <input type="file">
 * @param {string} plantId - Used to namespace the file path
 */
export async function uploadPlantImage(file, plantId) {
  const ext = file.name.split('.').pop()
  const path = `${plantId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('plant-images')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('plant-images')
    .getPublicUrl(path)

  return data.publicUrl
}
