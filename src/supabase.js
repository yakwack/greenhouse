import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// AUTH

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signInWithMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

// PROFILES

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

// PLANTS

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

// GREENHOUSE

export async function fetchGreenhouse(userId) {
  const { data, error } = await supabase
    .from('greenhouse')
    .select('plant_id')
    .eq('user_id', userId)
  if (error) throw error
  return new Set(data.map(r => r.plant_id))
}

export async function addToGreenhouse(userId, plantId) {
  const { error } = await supabase
    .from('greenhouse')
    .insert({ user_id: userId, plant_id: plantId })
  if (error && error.code !== '23505') throw error
}

export async function removeFromGreenhouse(userId, plantId) {
  const { error } = await supabase
    .from('greenhouse')
    .delete()
    .eq('user_id', userId)
    .eq('plant_id', plantId)
  if (error) throw error
}

const GH_KEY = 'glasshouse-greenhouse-v1'
export function loadGreenhouseLocal() {
  try {
    const raw = localStorage.getItem(GH_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}
export function saveGreenhouseLocal(set) {
  localStorage.setItem(GH_KEY, JSON.stringify([...set]))
}

// IMAGE UPLOAD

const MAX_WIDTH = 1200
const MAX_SIZE_KB = 400

async function resizeImage(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_WIDTH / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => {
        if (blob.size > MAX_SIZE_KB * 1024) {
          canvas.toBlob(blob2 => resolve(blob2), 'image/jpeg', 0.7)
        } else {
          resolve(blob)
        }
      }, 'image/jpeg', 0.85)
    }
    img.src = url
  })
}

export async function uploadPlantImage(file, plantId) {
  const resized = await resizeImage(file)
  const path = `${plantId}/${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from('plant-images')
    .upload(path, resized, { upsert: true, contentType: 'image/jpeg' })
  if (error) throw error
  const { data } = supabase.storage.from('plant-images').getPublicUrl(path)
  return data.publicUrl
}

export async function deletePlantImage(publicUrl) {
  const match = publicUrl.match(/plant-images\/(.+)$/)
  if (!match) return
  const { error } = await supabase.storage.from('plant-images').remove([match[1]])
  if (error) throw error
}
