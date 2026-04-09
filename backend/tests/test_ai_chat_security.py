"""Tests for AI chat security (P0.3)."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class AIAuthTest(TestCase):
    """AI chat endpoint requires authentication."""

    def test_unauthenticated_returns_401(self):
        client = APIClient()
        resp = client.post('/api/education/ai/chat/', {
            'messages': [{'role': 'user', 'content': 'Hello'}],
        }, format='json')
        self.assertEqual(resp.status_code, 401)


class AIInputValidationTest(TestCase):
    """AI chat validates input constraints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='aiuser', email='ai@test.com',
            password='TestP@ss123!', first_name='AI', last_name='User',
        )
        self.client.force_authenticate(user=self.user)

    def test_empty_messages_returns_400(self):
        resp = self.client.post('/api/education/ai/chat/', {
            'messages': [],
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_too_long_message_returns_400(self):
        resp = self.client.post('/api/education/ai/chat/', {
            'messages': [{'role': 'user', 'content': 'x' * 5000}],
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_invalid_model_returns_400(self):
        resp = self.client.post('/api/education/ai/chat/', {
            'messages': [{'role': 'user', 'content': 'Hello'}],
            'model': 'gpt-4-turbo',
        }, format='json')
        self.assertEqual(resp.status_code, 400)
