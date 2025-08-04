import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)

class TestAPI:
    def test_health_check(self):
        """Test the health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_cors_headers(self):
        """Test that CORS headers are properly set"""
        response = client.get("/health")
        assert "access-control-allow-origin" in response.headers
        assert response.headers["access-control-allow-origin"] == "*"

    @patch('main.supabase')
    def test_get_featured_collections_success(self, mock_supabase):
        """Test successful retrieval of featured collections"""
        # Mock Supabase response
        mock_response = MagicMock()
        mock_response.data = [
            {
                "id": 1,
                "title": "Test Collection",
                "description": "Test Description",
                "image_url": "test-image.jpg",
                "designer": "Test Designer"
            }
        ]
        mock_supabase.table().select().eq().execute.return_value = mock_response

        response = client.get("/api/collections/featured")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["title"] == "Test Collection"

    @patch('main.supabase')
    def test_get_featured_collections_empty(self, mock_supabase):
        """Test retrieval when no featured collections exist"""
        mock_response = MagicMock()
        mock_response.data = []
        mock_supabase.table().select().eq().execute.return_value = mock_response

        response = client.get("/api/collections/featured")
        assert response.status_code == 200
        assert response.json() == []

    @patch('main.supabase')
    def test_get_featured_collections_error(self, mock_supabase):
        """Test error handling for featured collections endpoint"""
        mock_supabase.table().select().eq().execute.side_effect = Exception("Database error")

        response = client.get("/api/collections/featured")
        assert response.status_code == 500
        assert "error" in response.json()

    @patch('main.supabase')
    def test_get_news_success(self, mock_supabase):
        """Test successful retrieval of news items"""
        mock_response = MagicMock()
        mock_response.data = [
            {
                "id": 1,
                "title": "Test News",
                "content": "Test Content",
                "image_url": "test-image.jpg",
                "published_at": "2024-01-01T00:00:00Z"
            }
        ]
        mock_supabase.table().select().eq().order().limit().execute.return_value = mock_response

        response = client.get("/api/news")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["title"] == "Test News"

    @patch('main.supabase')
    def test_get_news_with_limit(self, mock_supabase):
        """Test news retrieval with custom limit"""
        mock_response = MagicMock()
        mock_response.data = []
        mock_supabase.table().select().eq().order().limit().execute.return_value = mock_response

        response = client.get("/api/news?limit=5")
        assert response.status_code == 200
        # Verify that limit was passed correctly to the query
        mock_supabase.table().select().eq().order().limit.assert_called_with(5)

    @patch('main.supabase')
    def test_get_platform_stats_success(self, mock_supabase):
        """Test successful retrieval of platform statistics"""
        mock_response = MagicMock()
        mock_response.data = [
            {
                "total_designers": 15420,
                "total_collections": 8750,
                "total_users": 45680
            }
        ]
        mock_supabase.rpc().execute.return_value = mock_response

        response = client.get("/api/stats")
        assert response.status_code == 200
        stats = response.json()
        assert stats["total_designers"] == 15420
        assert stats["total_collections"] == 8750
        assert stats["total_users"] == 45680

    @patch('main.supabase')
    def test_get_platform_stats_error(self, mock_supabase):
        """Test error handling for platform stats endpoint"""
        mock_supabase.rpc().execute.side_effect = Exception("Database error")

        response = client.get("/api/stats")
        assert response.status_code == 500
        assert "error" in response.json()

    def test_invalid_endpoint(self):
        """Test that invalid endpoints return 404"""
        response = client.get("/api/invalid")
        assert response.status_code == 404

    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert "Fashion Designer Agent API" in response.json()["message"]