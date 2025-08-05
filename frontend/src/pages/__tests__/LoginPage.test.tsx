import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginPage from '../LoginPage'
import { apiService } from '../../services/api'

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    login: vi.fn()
  }
}))

// Mock navigate function
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    })
  })

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })

  test('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    fireEvent.click(toggleButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('submits form with correct data', async () => {
    // Mock successful login
    const mockResponse = {
      token: 'test-token',
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'designer' as 'designer' | 'buyer' | 'customer',
        created_at: '2023-01-01T00:00:00Z'
      }
    }
    
    vi.mocked(apiService.login).mockResolvedValueOnce(mockResponse)
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123' }
    })
    
    fireEvent.click(screen.getByLabelText(/remember me/i))
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    
    // Check if API was called with correct data
    expect(apiService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123',
      remember_me: true
    })
    
    // Wait for navigation to happen
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('shows error message on login failure', async () => {
    // Mock login failure
    const errorMessage = 'Invalid email or password'
    vi.mocked(apiService.login).mockRejectedValueOnce({
      response: {
        data: {
          detail: errorMessage
        }
      }
    })
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'WrongPassword' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
    
    // Check that navigation didn't happen
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('redirects to dashboard if already logged in', () => {
    // Mock localStorage to return a token
    vi.mocked(window.localStorage.getItem).mockReturnValueOnce('existing-token')
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    // Check if navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})