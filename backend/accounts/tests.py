from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch
import pyotp

from .models import UserProfile, EmailVerification, PasswordResetToken

User = get_user_model()


def make_user(email='test@example.com', password='TestPass123!', **kwargs):
    user = User.objects.create_user(
        username=email.split('@')[0],
        email=email,
        password=password,
        first_name=kwargs.get('first_name', 'Test'),
        last_name=kwargs.get('last_name', 'User'),
    )
    UserProfile.objects.get_or_create(user=user)
    return user


# --------------- Registration ---------------

class RegistrationTests(APITestCase):
    URL = '/api/auth/register/'

    def _payload(self, **overrides):
        data = {
            'email': 'newuser@example.com',
            'first_name': 'Иван',
            'last_name': 'Иванов',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
        }
        data.update(overrides)
        return data

    def test_register_success(self):
        resp = self.client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', resp.data)
        self.assertIn('tokens', resp.data)
        self.assertIn('access', resp.data['tokens'])
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_register_duplicate_email(self):
        make_user(email='newuser@example.com')
        resp = self.client.post(self.URL, self._payload(), format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', resp.data)

    def test_register_password_mismatch(self):
        resp = self.client.post(self.URL, self._payload(password_confirm='WrongPass999!'), format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        resp = self.client.post(self.URL, self._payload(password='abc', password_confirm='abc'), format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_email(self):
        payload = self._payload()
        del payload['email']
        resp = self.client.post(self.URL, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_creates_user_profile(self):
        self.client.post(self.URL, self._payload(), format='json')
        user = User.objects.get(email='newuser@example.com')
        self.assertTrue(UserProfile.objects.filter(user=user).exists())


# --------------- Login ---------------

class LoginTests(APITestCase):
    URL = '/api/auth/login/'

    def setUp(self):
        self.user = make_user(email='login@example.com', password='TestPass123!')

    def test_login_success(self):
        resp = self.client.post(self.URL, {'email': 'login@example.com', 'password': 'TestPass123!'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', resp.data)
        self.assertIn('user', resp.data)

    def test_login_wrong_password(self):
        resp = self.client.post(self.URL, {'email': 'login@example.com', 'password': 'WrongPass!'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self):
        resp = self.client.post(self.URL, {'email': 'nobody@example.com', 'password': 'TestPass123!'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_inactive_user(self):
        self.user.is_active = False
        self.user.save()
        resp = self.client.post(self.URL, {'email': 'login@example.com', 'password': 'TestPass123!'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# --------------- Profile ---------------

class ProfileTests(APITestCase):
    def setUp(self):
        self.user = make_user(email='profile@example.com')
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        resp = self.client.get('/api/auth/profile/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], 'profile@example.com')

    def test_update_profile_city(self):
        resp = self.client.patch('/api/auth/profile/update-complete/', {'city': 'Rome'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.city, 'Rome')

    def test_unauthenticated_profile_returns_401(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get('/api/auth/profile/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# --------------- Password ---------------

class PasswordTests(APITestCase):
    def setUp(self):
        self.user = make_user(email='pwd@example.com', password='OldPass123!')
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        resp = self.client.post('/api/auth/change-password/', {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456!'))

    def test_change_password_wrong_old(self):
        resp = self.client.post('/api/auth/change-password/', {
            'old_password': 'Wrong!',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('django.core.mail.send_mail')
    def test_request_password_reset_creates_token(self, mock_mail):
        self.client.force_authenticate(user=None)
        resp = self.client.post('/api/auth/request-password-reset/', {'email': 'pwd@example.com'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(PasswordResetToken.objects.filter(user=self.user).exists())

    def test_confirm_password_reset_valid_token(self):
        PasswordResetToken.objects.create(
            user=self.user,
            token='validtoken123',
            expires_at=timezone.now() + timezone.timedelta(hours=1),
        )
        self.client.force_authenticate(user=None)
        resp = self.client.post('/api/auth/confirm-password-reset/', {
            'token': 'validtoken123',
            'new_password': 'ResetPass789!',
            'new_password_confirm': 'ResetPass789!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('ResetPass789!'))

    def test_confirm_password_reset_expired_token(self):
        PasswordResetToken.objects.create(
            user=self.user,
            token='expiredtoken',
            expires_at=timezone.now() - timezone.timedelta(hours=1),
        )
        self.client.force_authenticate(user=None)
        resp = self.client.post('/api/auth/confirm-password-reset/', {
            'token': 'expiredtoken',
            'new_password': 'ResetPass789!',
            'new_password_confirm': 'ResetPass789!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# --------------- 2FA ---------------

class TwoFATests(APITestCase):
    def setUp(self):
        self.user = make_user(email='twofa@example.com', password='Pass123!')
        self.client.force_authenticate(user=self.user)

    def test_setup_2fa_returns_secret(self):
        resp = self.client.post('/api/auth/2fa/setup/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('secret', resp.data)
        self.assertTrue(len(resp.data['secret']) > 10)

    def test_enable_2fa_with_valid_code(self):
        setup_resp = self.client.post('/api/auth/2fa/setup/')
        secret = setup_resp.data['secret']
        totp = pyotp.TOTP(secret)
        code = totp.now()
        resp = self.client.post('/api/auth/2fa/enable/', {'code': code}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.two_factor_enabled)

    def test_enable_2fa_with_invalid_code(self):
        self.client.post('/api/auth/2fa/setup/')
        resp = self.client.post('/api/auth/2fa/enable/', {'code': '000000'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_disable_2fa(self):
        setup_resp = self.client.post('/api/auth/2fa/setup/')
        secret = setup_resp.data['secret']
        code = pyotp.TOTP(secret).now()
        self.client.post('/api/auth/2fa/enable/', {'code': code}, format='json')
        resp = self.client.post('/api/auth/2fa/disable/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.two_factor_enabled)


# --------------- Email Verification ---------------

class EmailVerificationTests(APITestCase):
    def setUp(self):
        self.user = make_user(email='verify@example.com')
        self.client.force_authenticate(user=self.user)

    @patch('django.core.mail.send_mail')
    def test_request_email_verification_creates_token(self, mock_mail):
        resp = self.client.post('/api/auth/email/verify/request/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(EmailVerification.objects.filter(user=self.user).exists())

    def test_verify_email_valid_token(self):
        EmailVerification.objects.create(
            user=self.user,
            token='validverify',
            expires_at=timezone.now() + timezone.timedelta(hours=24),
        )
        self.client.force_authenticate(user=None)
        resp = self.client.post('/api/auth/verify-email/', {'token': 'validverify'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)

    def test_verify_email_expired_token(self):
        EmailVerification.objects.create(
            user=self.user,
            token='expiredverify',
            expires_at=timezone.now() - timezone.timedelta(hours=1),
        )
        self.client.force_authenticate(user=None)
        resp = self.client.post('/api/auth/verify-email/', {'token': 'expiredverify'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
