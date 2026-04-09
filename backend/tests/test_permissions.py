"""Tests for permissions and IDOR protection (P1.1)."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from education.models import Case

User = get_user_model()


class CasePermissionsTest(TestCase):
    """Users should only see their own cases (IDOR protection)."""

    def setUp(self):
        self.client_a = APIClient()
        self.client_b = APIClient()
        self.user_a = User.objects.create_user(
            username='alice', email='alice@test.com',
            password='TestP@ss123!', first_name='Alice', last_name='A',
        )
        self.user_b = User.objects.create_user(
            username='bob', email='bob@test.com',
            password='TestP@ss123!', first_name='Bob', last_name='B',
        )
        self.client_a.force_authenticate(user=self.user_a)
        self.client_b.force_authenticate(user=self.user_b)

    def test_user_only_sees_own_cases(self):
        case_a = Case.objects.create(student=self.user_a, stage='intake')
        Case.objects.create(student=self.user_b, stage='intake')

        resp = self.client_a.get('/api/education/cases/')
        self.assertEqual(resp.status_code, 200)
        ids = [c['id'] for c in resp.data['results']] if 'results' in resp.data else [c['id'] for c in resp.data]
        self.assertIn(str(case_a.id), ids)
        self.assertEqual(len(ids), 1)

    def test_user_cannot_access_other_user_case(self):
        case_b = Case.objects.create(student=self.user_b, stage='intake')
        resp = self.client_a.get(f'/api/education/cases/{case_b.id}/')
        self.assertEqual(resp.status_code, 404)


class ConsentTest(TestCase):
    """Consent creation and idempotency."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='consentuser', email='consent@test.com',
            password='TestP@ss123!', first_name='Con', last_name='Sent',
        )
        self.client.force_authenticate(user=self.user)

    def test_create_consent(self):
        resp = self.client.post('/api/auth/consents/', {
            'consent_type': 'terms', 'version': 'v1.0',
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['consent_type'], 'terms')

    def test_duplicate_consent_is_idempotent(self):
        self.client.post('/api/auth/consents/', {
            'consent_type': 'terms', 'version': 'v1.0',
        }, format='json')
        resp = self.client.post('/api/auth/consents/', {
            'consent_type': 'terms', 'version': 'v1.0',
        }, format='json')
        self.assertEqual(resp.status_code, 200)  # Not 201

    def test_list_consents(self):
        self.client.post('/api/auth/consents/', {
            'consent_type': 'privacy', 'version': 'v2.0',
        }, format='json')
        resp = self.client.get('/api/auth/consents/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.data) >= 1)
