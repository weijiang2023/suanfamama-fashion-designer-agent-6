import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SignUpPage from '../SignUpPage'
import { apiService } from '../../services/api'

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    signUp: vi.fn(),
    validateEmail: vi.fn()
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

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })
  })

  const renderSignUpPage = () => {
    return render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    )
  }

  test('renders sign up form correctly', () => {
    renderSignUpPage()
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
  })

  test('validates form fields on submit', async () => {
    renderSignUpPage()
    
    // Submit form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument()
    })
  })

  test('validates password strength', async () => {
    renderSignUpPage()
    
    // Fill email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    
    // Fill weak password
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'weak' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
    
    // Update with password missing uppercase
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'weakpassword123' }
    })
    
    // Submit form again
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
    })
  })

  test('validates passwords match', async () => {
    renderSignUpPage()
    
    // Fill email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    
    // Fill password
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPassword123' }
    })
    
    // Fill different confirm password
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'DifferentPassword123' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  test('submits form with valid data', async () => {
    // Mock successful API responses
    vi.mocked(apiService.validateEmail).mockResolvedValue({ available: true })
    
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'designer' as 'designer' | 'buyer' | 'customer',
      created_at: '2023-01-01T00:00:00Z'
    }
    
    const mockToken = 'mock-jwt-token'
    
    vi.mocked(apiService.signUp).mockResolvedValue({
      token: mockToken,
      user: mockUser
    })
    
    renderSignUpPage()
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPassword123' }
    })
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPassword123' }
    })
    
    fireEvent.change(screen.getByLabelText(/i am a/i), {
      target: { value: 'designer' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      // Check if API was called with correct data
      expect(apiService.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'StrongPassword123',
        confirm_password: 'StrongPassword123',
        role: 'designer'
      })
      
      // Check if token and user were stored in localStorage
      expect(window.localStorage.setItem).toHaveBeenCalledWith('token', mockToken)
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
      
      // Check if user was redirected to login
      expect(mockNavigate).toHaveBeenCalledWith('/login', { 
        state: { 
          message: 'Account created successfully! Please log in to continue.',
          email: 'test@example.com' 
        } 
      })
    })
  })

  test('shows error when email is already registered', async () => {
    // Mock API response for email validation
    vi.mocked(apiService.validateEmail).mockResolvedValue({ available: false })
    
    renderSignUpPage()
    
    // Fill email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@example.com' }
    })
    
    // Fill valid password
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'StrongPassword123' }
    })
    
    // Fill matching confirm password
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongPassword123' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email is already registered/i)).toBeInTheDocument()
    })
  })

  test('toggles password visibility', () => {
    renderSignUpPage()
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    // Initially passwords should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    
    // Toggle password visibility
    fireEvent.click(screen.getAllByText(/show/i)[0])
    
    // Password should now be visible
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Toggle confirm password visibility
    fireEvent.click(screen.getAllByText(/show/i)[1])
    
    // Confirm password should now be visible
    expect(confirmPasswordInput).toHaveAttribute('type', 'text')
    
    // Toggle back
    fireEvent.click(screen.getAllByText(/hide/i)[0])
    fireEvent.click(screen.getAllByText(/hide/i)[0])
    
    // Both should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
  })
})