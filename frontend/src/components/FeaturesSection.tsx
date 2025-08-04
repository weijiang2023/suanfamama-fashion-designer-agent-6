import React from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Zap, 
  Shield,
  Globe,
  Heart
} from 'lucide-react'

const features = [
  {
    icon: Palette,
    title: 'AI-Powered Design',
    description: 'Create stunning fashion designs with our advanced AI algorithms that understand style, color, and trends.',
    color: 'text-primary-600'
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Get personalized suggestions based on current trends, your style preferences, and market demands.',
    color: 'text-purple-600'
  },
  {
    icon: Users,
    title: 'Collaborative Platform',
    description: 'Work together with other designers, share ideas, and get feedback from the fashion community.',
    color: 'text-blue-600'
  },
  {
    icon: TrendingUp,
    title: 'Market Analytics',
    description: 'Access real-time fashion trends and market data to make informed design decisions.',
    color: 'text-green-600'
  },
  {
    icon: Zap,
    title: 'Rapid Prototyping',
    description: 'Transform your ideas into visual prototypes in minutes, not hours or days.',
    color: 'text-yellow-600'
  },
  {
    icon: Shield,
    title: 'IP Protection',
    description: 'Secure your designs with blockchain-based intellectual property protection.',
    color: 'text-red-600'
  },
  {
    icon: Globe,
    title: 'Global Marketplace',
    description: 'Showcase and sell your designs to a worldwide audience of fashion enthusiasts.',
    color: 'text-indigo-600'
  },
  {
    icon: Heart,
    title: 'Sustainable Focus',
    description: 'Design with sustainability in mind using our eco-friendly material recommendations.',
    color: 'text-pink-600'
  }
]

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Powerful Features for Modern Designers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Everything you need to create, collaborate, and commercialize your fashion designs
            in one comprehensive platform.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">
            Ready to revolutionize your design process?
          </p>
          <button className="btn-primary">
            Explore All Features
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection