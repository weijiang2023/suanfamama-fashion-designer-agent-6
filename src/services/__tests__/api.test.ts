import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { apiService } from '../api'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock axios.create to return a mocked instance
const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
    }
}

mockedAxios.create = vi.fn(() => mockAxiosInstance)

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getFeaturedCollections', () => {
        it('should fetch featured collections successfully', async () => {
            const mockCollections = [
                {
                    id: 1,
                    title: 'Test Collection',
                    description: 'Test Description',
                    image_url: 'test-image.jpg',
                    designer: 'Test Designer',
                    created_at: '2024-01-01T00:00:00Z',
                    is_featured: true
                }
            ]

            mockAxiosInstance.get.mockResolvedValueOnce({ data: mockCollections })

            const result = await apiService.getFeaturedCollections()

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/featured-collections')
            expect(result).toEqual(mockCollections)
        })

        it('should handle API errors gracefully', async () => {
            mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'))

            await expect(apiService.getFeaturedCollections()).rejects.toThrow('API Error')
        })
    })

    describe('getLatestNews', () => {
        it('should fetch news items successfully', async () => {
            const mockNews = [
                {
                    id: 1,
                    title: 'Test News',
                    content: 'Test Content',
                    image_url: 'test-image.jpg',
                    published_at: '2024-01-01T00:00:00Z',
                    is_published: true
                }
            ]

            mockAxiosInstance.get.mockResolvedValueOnce({ data: mockNews })

            const result = await apiService.getLatestNews()

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/news')
            expect(result).toEqual(mockNews)
        })
    })

    describe('getPlatformStats', () => {
        it('should fetch platform statistics successfully', async () => {
            const mockStats = {
                total_designers: 15420,
                total_collections: 8750,
                total_users: 45680
            }

            mockAxiosInstance.get.mockResolvedValueOnce({ data: mockStats })

            const result = await apiService.getPlatformStats()

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/platform-stats')
            expect(result).toEqual(mockStats)
        })
    })

    describe('healthCheck', () => {
        it('should perform health check successfully', async () => {
            const mockResponse = { status: 'ok' }

            mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse })

            const result = await apiService.healthCheck()

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health')
            expect(result).toEqual(mockResponse)
        })
    })
})