import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { apiService } from '../api'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

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
                    designer: 'Test Designer'
                }
            ]

            mockedAxios.get.mockResolvedValueOnce({ data: mockCollections })

            const result = await apiService.getFeaturedCollections()

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/collections/featured')
            expect(result).toEqual(mockCollections)
        })

        it('should handle API errors gracefully', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

            await expect(apiService.getFeaturedCollections()).rejects.toThrow('API Error')
        })
    })

    describe('getNews', () => {
        it('should fetch news items successfully', async () => {
            const mockNews = [
                {
                    id: 1,
                    title: 'Test News',
                    content: 'Test Content',
                    image_url: 'test-image.jpg',
                    published_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockedAxios.get.mockResolvedValueOnce({ data: mockNews })

            const result = await apiService.getNews()

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/news')
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

            mockedAxios.get.mockResolvedValueOnce({ data: mockStats })

            const result = await apiService.getPlatformStats()

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/stats')
            expect(result).toEqual(mockStats)
        })
    })
})