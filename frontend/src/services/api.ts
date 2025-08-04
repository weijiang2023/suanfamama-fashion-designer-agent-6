import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        console.error('API Error:', error)
        return Promise.reject(error)
    }
)

export interface FeaturedCollection {
    id: number
    title: string
    description: string
    image_url: string
    designer: string
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

// API functions
export const apiService = {
    // Health check
    async healthCheck() {
        const response = await api.get('/api/health')
        return response.data
    },

    // Get featured collections
    async getFeaturedCollections(): Promise<FeaturedCollection[]> {
        const response = await api.get('/api/featured-collections')
        return response.data
    },

    // Get latest news
    async getLatestNews(): Promise<NewsItem[]> {
        const response = await api.get('/api/news')
        return response.data
    },

    // Get platform statistics
    async getPlatformStats(): Promise<PlatformStats> {
        const response = await api.get('/api/platform-stats')
        return response.data
    },
}

export default api