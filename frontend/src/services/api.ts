import { supabase, User, Collection, NewsItem, PlatformStats } from './supabase'

export interface SignUpData {
    email: string
    password: string
    confirm_password: string
    role: 'designer' | 'buyer' | 'customer'
}

export interface LoginData {
    email: string
    password: string
    remember_me?: boolean
}

export interface AuthResponse {
    token: string
    user: User
}

export interface EmailValidationResponse {
    available: boolean
}

// Extended Collection interface for API responses
export interface FeaturedCollection extends Collection {
    designer?: string
}

// Export types for compatibility
export type { User, Collection, NewsItem, PlatformStats }

export const apiService = {
    // Health check
    async healthCheck() {
        try {
            const { error } = await supabase.from('users').select('count').limit(1)
            if (error) throw error
            return { status: 'ok', message: 'Supabase connection successful' }
        } catch (error) {
            console.error('Health check failed:', error)
            throw new Error('Database connection failed')
        }
    },

    // Authentication
    async signUp(userData: SignUpData): Promise<AuthResponse> {
        console.log('🚀 Starting signup process for:', userData.email)
        console.log('📝 Signup data:', { ...userData, password: '[HIDDEN]', confirm_password: '[HIDDEN]' })

        try {
            // Check if passwords match
            if (userData.password !== userData.confirm_password) {
                console.error('❌ Password mismatch error')
                throw new Error('Passwords do not match')
            }
            console.log('✅ Password validation passed')

            // Check Supabase configuration
            console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'NOT SET')
            console.log('🔧 Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')

            // Sign up with Supabase Auth using metadata approach to avoid FK constraint issues
            console.log('🔐 Attempting Supabase Auth signup with metadata...')
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        role: userData.role,
                        created_at: new Date().toISOString()
                    }
                }
            })

            console.log('🔐 Auth response:', {
                user: authData.user ? 'Created' : 'Not created',
                session: authData.session ? 'Created' : 'Not created',
                error: authError
            })

            if (authError) {
                console.error('❌ Supabase Auth error:', authError)
                throw authError
            }
            if (!authData.user) {
                console.error('❌ No user returned from auth')
                throw new Error('Failed to create user')
            }

            console.log('✅ Supabase Auth successful, user ID:', authData.user.id)
            console.log('✅ User metadata:', authData.user.user_metadata)

            // Create user object from auth data and metadata
            const user: User = {
                id: authData.user.id,
                email: userData.email,
                role: userData.role,
                created_at: authData.user.created_at || new Date().toISOString(),
            }

            console.log('👤 User profile created from auth metadata:', user)

            // Optionally, try to sync to users table but don't fail if it doesn't work
            try {
                console.log('🔄 Attempting to sync profile to users table (optional)...')
                const { error: syncError } = await supabase
                    .from('users')
                    .upsert([user], { onConflict: 'id' })

                if (syncError) {
                    console.warn('⚠️ Profile sync to users table failed (continuing anyway):', syncError)
                } else {
                    console.log('✅ Profile synced to users table successfully')
                }
            } catch (syncError) {
                console.warn('⚠️ Profile sync error (continuing anyway):', syncError)
            }

            const response = {
                token: authData.session?.access_token || '',
                user
            }

            console.log('🎉 Signup completed successfully:', {
                token: response.token ? 'Generated' : 'Not generated',
                user: response.user
            })

            return response
        } catch (error: any) {
            console.error('💥 Signup error:', error)
            console.error('💥 Error stack:', error.stack)
            throw new Error(error.message || 'Failed to create account')
        }
    },

    async login(loginData: LoginData): Promise<AuthResponse> {
        try {
            // Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: loginData.email,
                password: loginData.password,
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('Invalid credentials')

            // Get user profile
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single()

            if (profileError) {
                console.error('Profile fetch error:', profileError)
                // Create a basic user object if profile doesn't exist
                const user: User = {
                    id: authData.user.id,
                    email: authData.user.email || loginData.email,
                    role: 'customer',
                    created_at: authData.user.created_at || new Date().toISOString(),
                }
                return {
                    token: authData.session?.access_token || '',
                    user
                }
            }

            return {
                token: authData.session?.access_token || '',
                user: profileData
            }
        } catch (error: any) {
            console.error('Login error:', error)
            throw new Error(error.message || 'Invalid email or password')
        }
    },

    async validateEmail(email: string): Promise<EmailValidationResponse> {
        try {
            console.log('📧 Validating email:', email)
            // Check if email exists in our users table
            // Use .maybeSingle() instead of .single() to handle no results gracefully
            const { data, error } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .maybeSingle()

            console.log('📧 Email validation response:', { data, error })

            if (error) {
                console.error('❌ Email validation error:', error)
                // If there's a real error, log it but don't block signup
                console.log('📧 Assuming email is available due to error')
                return { available: true }
            }

            const available = !data
            console.log('📧 Email validation result:', { email, available })
            return { available }
        } catch (error: any) {
            console.error('💥 Email validation error:', error)
            // If there's an error, assume email is available to not block signup
            return { available: true }
        }
    },

    // Get featured collections
    async getFeaturedCollections(): Promise<FeaturedCollection[]> {
        try {
            const { data, error } = await supabase
                .from('collections')
                .select(`
          *,
          users!collections_designer_id_fkey(email)
        `)
                .eq('is_featured', true)
                .order('created_at', { ascending: false })
                .limit(6)

            if (error) throw error

            // Transform data to include designer email
            return (data || []).map(item => ({
                ...item,
                designer: item.users?.email || 'Unknown Designer'
            }))
        } catch (error) {
            console.error('Error fetching collections:', error)
            // Return mock data if database query fails
            return [
                {
                    id: 1,
                    title: "Summer Elegance Collection",
                    description: "Lightweight fabrics meet sophisticated design",
                    image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400",
                    designer_id: "mock",
                    created_at: new Date().toISOString(),
                    is_featured: true,
                    designer: "Sarah Chen"
                },
                {
                    id: 2,
                    title: "Urban Streetwear",
                    description: "Bold statements for the modern city dweller",
                    image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
                    designer_id: "mock",
                    created_at: new Date().toISOString(),
                    is_featured: true,
                    designer: "Marcus Johnson"
                }
            ]
        }
    },

    // Get latest news
    async getLatestNews(): Promise<NewsItem[]> {
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('is_published', true)
                .order('published_at', { ascending: false })
                .limit(3)

            if (error) throw error

            return data || []
        } catch (error) {
            console.error('Error fetching news:', error)
            // Return mock data if database query fails
            return [
                {
                    id: 1,
                    title: "Fashion Week 2024 Highlights",
                    content: "Discover the most stunning collections from this year's fashion week...",
                    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400",
                    published_at: new Date().toISOString(),
                    is_published: true
                }
            ]
        }
    },

    // Get platform statistics
    async getPlatformStats(): Promise<PlatformStats> {
        try {
            // Get counts from different tables
            const [usersResult, collectionsResult, designersResult] = await Promise.all([
                supabase.from('users').select('id', { count: 'exact', head: true }),
                supabase.from('collections').select('id', { count: 'exact', head: true }),
                supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'designer')
            ])

            return {
                total_users: usersResult.count || 0,
                total_collections: collectionsResult.count || 0,
                total_designers: designersResult.count || 0
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
            // Return mock data if database query fails
            return {
                total_users: 1250,
                total_collections: 340,
                total_designers: 89
            }
        }
    },

    // Logout
    async logout() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    },

    // Get current user session
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            return user
        } catch (error) {
            console.error('Get current user error:', error)
            return null
        }
    },

    // Forgot password
    async forgotPassword(email: string) {
        try {
            console.log('🔐 Requesting password reset for:', email)
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) {
                console.error('❌ Forgot password error:', error)
                throw error
            }

            console.log('✅ Password reset email sent')
            return { message: 'Reset email sent if account exists' }
        } catch (error: any) {
            console.error('💥 Forgot password error:', error)
            throw new Error(error.message || 'Failed to send reset email')
        }
    },

    // Reset password
    async resetPassword(token: string, newPassword: string) {
        try {
            console.log('🔐 Resetting password with token')

            // First, verify the session with the token
            const { data: { user }, error: sessionError } = await supabase.auth.getUser(token)

            if (sessionError || !user) {
                console.error('❌ Invalid or expired token:', sessionError)
                throw new Error('Invalid or expired reset token')
            }

            // Update the password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                console.error('❌ Password update error:', updateError)
                throw updateError
            }

            console.log('✅ Password reset successful')
            return { message: 'Password reset successful' }
        } catch (error: any) {
            console.error('💥 Reset password error:', error)
            throw new Error(error.message || 'Failed to reset password')
        }
    }
}

export default apiService
