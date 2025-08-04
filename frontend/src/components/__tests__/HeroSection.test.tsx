import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HeroSection from '../HeroSection'

const HeroSectionWithRouter = () => (
  <BrowserRouter>
    <HeroSection />
  </BrowserRouter>
)

describe('HeroSection', () => {
  it('renders the main heading and description', () => {
    render(<HeroSectionWithRouter />)
    
    expect(screen.getByText('Transform Your Fashion Ideas with AI')).toBeInTheDocument()
    expect(screen.getByText(/Create stunning fashion designs with our AI-powered platform/)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<HeroSectionWithRouter />)
    
    const startCreatingButton = screen.getByRole('link', { name: /start creating for free/i })
    const watchDemoButton = screen.getByRole('button', { name: /watch demo/i })
    
    expect(startCreatingButton).toBeInTheDocument()
    expect(watchDemoButton).toBeInTheDocument()
    expect(startCreatingButton).toHaveAttribute('href', '/signup')
  })

  it('displays trust indicators', () => {
    render(<HeroSectionWithRouter />)
    
    expect(screen.getByText('15,000+ Designers')).toBeInTheDocument()
    expect(screen.getByText('50+ Countries')).toBeInTheDocument()
    expect(screen.getByText('99% Satisfaction')).toBeInTheDocument()
  })

  it('renders hero image', () => {
    render(<HeroSectionWithRouter />)
    
    const heroImage = screen.getByAltText('Fashion Design Platform')
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('src', expect.stringContaining('unsplash.com'))
  })
})