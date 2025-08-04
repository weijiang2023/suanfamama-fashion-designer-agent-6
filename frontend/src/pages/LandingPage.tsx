import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Palette, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Star,
  ChevronDown,
  Play
} from 'lucide-react'
import { apiService, FeaturedCollection, NewsItem, PlatformStats } from '../services/api'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import CollectionsSection from '../components/CollectionsSection'
import StatsSection from '../components/StatsSection'
import NewsSection from '../components/NewsSection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

const LandingPage: React.FC = () => {
  const [collections, setCollections] = useState<FeaturedCollection[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [collectionsData, newsData, statsData] = await Promise.all([
          apiService.getFeaturedCollections(),
          apiService.getLatestNews(),
          apiService.getPlatformStats()
        ])
        
        setCollections(collectionsData)
        setNews(newsData)
        setStats(statsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load content. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading amazing content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-secondary-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      {collections.length > 0 && <CollectionsSection collections={collections} />}
      {stats && <StatsSection stats={stats} />}
      {news.length > 0 && <NewsSection news={news} />}
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage