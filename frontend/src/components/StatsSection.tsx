import React from 'react'
import { motion } from 'framer-motion'
import { Users, Palette, TrendingUp, Globe } from 'lucide-react'
import { PlatformStats } from '../services/api'

interface StatsSectionProps {
  stats: PlatformStats
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const statsData = [
    {
      icon: Users,
      label: 'Active Designers',
      value: stats.total_designers.toLocaleString(),
      color: 'text-blue-600'
    },
    {
      icon: Palette,
      label: 'Collections Created',
      value: stats.total_collections.toLocaleString(),
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Total Users',
      value: stats.total_users.toLocaleString(),
      color: 'text-green-600'
    },
    {
      icon: Globe,
      label: 'Countries Reached',
      value: '50+',
      color: 'text-orange-600'
    }
  ]

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Trusted by Designers Worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Join thousands of designers who are already transforming the fashion industry
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4 ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-gray-300 text-sm md:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16 max-w-4xl mx-auto"
        >
          <blockquote className="text-xl md:text-2xl italic text-gray-300 mb-6">
            "This platform has revolutionized how I approach fashion design. 
            The AI suggestions are incredibly intuitive and have helped me create 
            designs I never thought possible."
          </blockquote>
          <div className="flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
              alt="Designer testimonial"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div className="text-left">
              <div className="font-semibold">Sarah Chen</div>
              <div className="text-gray-400 text-sm">Fashion Designer, Milan</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default StatsSection