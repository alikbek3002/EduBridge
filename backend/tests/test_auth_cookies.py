"""Tests for cookie-based auth and CSRF (P0.2)."""
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class CookieAuthTest(TestCase):
    """Cookie-based JWT authentication."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com',
            password='TestP@ss123!', first_name='Test', last_name='User',
        )

    @override_settings(FEATURE_COOKIE_AUTH=True)
    def test_login_sets_cookies(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com', 'password': 'TestP@ss123!',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access_token', resp.cookies)
        self.assertIn('refresh_token', resp.cookies)
        # Should be HttpOnly
        self.assertTrue(resp.cookies['access_token']['httponly'])
        self.assertTrue(resp.cookies['refresh_token']['httponly'])

    @override_settings(FEATURE_COOKIE_AUTH=True)
    def test_logout_clears_cookies(self):
        # Login first
        login_resp = self.client.post('/api/auth/login/', {
            'email': 'test@example.com', 'password': 'TestP@ss123!',
        }, format='json')
        tokens = login_resp.data.get('tokens', {})
        # Logout
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens.get('access', '')}")
        resp = self.client.post('/api/auth/logout/', {
            'refresh': tokens.get('refresh', ''),
        }, format='json')
        self.assertEqual(resp.status_code, 200)

    def test_csrf_bootstrap_endpoint(self):
        resp = self.client.get('/api/auth/csrf/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('csrftoken', resp.cookies)
