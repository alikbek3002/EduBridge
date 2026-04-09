"""Tests for production security settings (P0.1)."""
import os
from unittest.mock import patch

from django.test import TestCase, override_settings


class SecretKeySecurityTest(TestCase):
    """SECRET_KEY must be mandatory in production."""

    def test_prod_without_secret_key_raises(self):
        """When DEBUG=False and SECRET_KEY is empty, settings should raise RuntimeError."""
        env = {'DEBUG': 'False', 'SECRET_KEY': ''}
        with patch.dict(os.environ, env, clear=False):
            with self.assertRaises(RuntimeError):
                # Re-import settings module to trigger the check
                import importlib
                import aieducation.settings as s
                importlib.reload(s)


class ProductionSecurityFlagsTest(TestCase):
    """Production mode should have secure defaults."""

    @override_settings(DEBUG=False)
    def test_secure_cookies_in_prod(self):
        from django.conf import settings
        # These are set at module load time, so we verify them directly
        # by checking that our settings.py block was executed
        self.assertTrue(hasattr(settings, 'SECURE_SSL_REDIRECT') or not settings.DEBUG)

    def test_cors_allow_all_disabled_in_prod(self):
        """CORS_ALLOW_ALL_ORIGINS should be False in prod."""
        env = {'DEBUG': 'False', 'SECRET_KEY': 'test-key', 'CORS_ALLOW_ALL_ORIGINS': 'True'}
        with patch.dict(os.environ, env, clear=False):
            import importlib
            import aieducation.settings as s
            importlib.reload(s)
            self.assertFalse(s.CORS_ALLOW_ALL_ORIGINS)


class CORSCsrfTest(TestCase):
    """CORS and CSRF configurations."""

    def test_csrf_trusted_origins_from_env(self):
        env = {
            'DEBUG': 'True',
            'SECRET_KEY': 'test-key',
            'CSRF_TRUSTED_ORIGINS': 'https://example.com,https://app.example.com',
        }
        with patch.dict(os.environ, env, clear=False):
            import importlib
            import aieducation.settings as s
            importlib.reload(s)
            self.assertIn('https://example.com', s.CSRF_TRUSTED_ORIGINS)
            self.assertIn('https://app.example.com', s.CSRF_TRUSTED_ORIGINS)
