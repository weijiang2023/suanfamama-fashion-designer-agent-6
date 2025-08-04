import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../Navbar'

const NavbarWithRouter = () => (
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
)

describe('Navbar', () => {
  it('renders the logo and navigation links', () => {
    render(<NavbarWithRouter />)
    
    // Check if logo is present
    expect(screen.getByText('FashionAI')).toBeInTheDocument()
    
    // Check if navigation links are present
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
    expect(screen.getByText('News')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders sign up and login buttons', () => {
    render(<NavbarWithRouter />)
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<NavbarWithRouter />)
    
    // Find the mobile menu button (hamburger)
    const mobileMenuButton = screen.getByRole('button', { name: /toggle menu/i })
    
    // Initially, mobile menu should be closed
    const mobileMenu = screen.getByTestId('mobile-menu')
    expect(mobileMenu).toHaveClass('-translate-x-full')
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton)
    expect(mobileMenu).toHaveClass('translate-x-0')
    
    // Click to close mobile menu
    fireEvent.click(mobileMenuButton)
    expect(mobileMenu).toHaveClass('-translate-x-full')
  })

  it('has correct link destinations', () => {
    render(<NavbarWithRouter />)
    
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    const loginLink = screen.getByRole('link', { name: /login/i })
    
    expect(signUpLink).toHaveAttribute('href', '/signup')
    expect(loginLink).toHaveAttribute('href', '/login')
  })
})