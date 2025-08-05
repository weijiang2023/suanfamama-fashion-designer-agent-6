import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
    id: string
    email: string
    role: 'designer' | 'buyer' | 'customer'
    created_at: string
    updated_at?: string
}

export interface Collection {
    id: number
    title: string
    description: string
    image_url: string
    designer_id: string
    created_at: string
    is_featured: boolean
}

export interface NewsItem {
    id: number
    title: string
    content: string
    image_url?: string
    published_at: string
    is_published: boolean
}

export interface PlatformStats {
    total_designers: number
    total_collections: number
    total_users: number
}