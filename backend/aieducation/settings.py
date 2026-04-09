import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging

# Base dir and dotenv
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / '.env', override=True)

# SECURITY: secret from env; in production SECRET_KEY is mandatory
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
IS_TEST = 'test' in sys.argv

SECRET_KEY = os.getenv('SECRET_KEY', '')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'unsafe-secret-for-dev'
    else:
        raise RuntimeError('SECRET_KEY must be set in production')

JWT_SIGNING_KEY = SECRET_KEY
if IS_TEST and len(JWT_SIGNING_KEY.encode('utf-8')) < 32:
    JWT_SIGNING_KEY = f'{JWT_SIGNING_KEY}-test-signing-key-padding'

# ALLOWED_HOSTS: env-driven plus safe defaults; strip ports and ignore numeric entries
_raw_hosts = os.getenv('ALLOWED_HOSTS', '').strip()

def _normalize_host(h: str) -> str | None:
    h = h.strip()
    if not h:
        return None
    # Split out accidental port entries like "example.com:8000" or bare "8000"
    if ':' in h:
        h = h.split(':', 1)[0].strip()
    # Ignore pure numeric leftovers
    if h.isdigit():
        return None
    return h

env_hosts = []
if _raw_hosts:
    env_hosts = [x for x in (_normalize_host(h) for h in _raw_hosts.split(',')) if x]

base_hosts = ['.up.railway.app', 'localhost', '127.0.0.1', '0.0.0.0']

# Merge env + base (preserve order, remove duplicates)
ALLOWED_HOSTS = list(dict.fromkeys([*env_hosts, *base_hosts])) or ['localhost', '127.0.0.1']

# Consolidated CORS/CSRF configuration (env-driven)
# CORS_ALLOW_ALL_ORIGINS can be enabled in development via env; forced off in production
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False').lower() == 'true'
if not DEBUG:
    CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'True').lower() == 'true'

# Build CORS_ALLOWED_ORIGINS from env or FRONTEND_URL; allow common local dev origins when DEBUG
_raw_cors = os.getenv('CORS_ALLOWED_ORIGINS', '').strip()
if _raw_cors:
    CORS_ALLOWED_ORIGINS = [x.strip().rstrip('/') for x in _raw_cors.split(',') if x.strip()]
else:
    _frontend = os.getenv('FRONTEND_URL', '').strip().rstrip('/')
    local_origins = [
        'http://localhost:3000', 'http://127.0.0.1:3000',
        'http://localhost:5173', 'http://127.0.0.1:5173',
    ]
    CORS_ALLOWED_ORIGINS = [*(local_origins if DEBUG and not _frontend else []), *([_frontend] if _frontend else [])]

# Allowed methods & headers
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF trusted origins: prefer explicit env, fall back to CORS allowed origins
_raw_csrf = os.getenv('CSRF_TRUSTED_ORIGINS', '').strip()
if _raw_csrf:
    CSRF_TRUSTED_ORIGINS = [x.strip().rstrip('/') for x in _raw_csrf.split(',') if x.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [u.rstrip('/') for u in CORS_ALLOWED_ORIGINS if u]

# If no explicit CORS_ALLOWED_ORIGINS are configured, allow common Railway subdomains
# and local dev hosts via regex. This helps when env vars are not set in the deployment.
_raw_cors_regex = os.getenv('CORS_ALLOWED_ORIGIN_REGEXES', '').strip()
if _raw_cors_regex:
    # support comma-separated regex list from env
    CORS_ALLOWED_ORIGIN_REGEXES = [r.strip() for r in _raw_cors_regex.split(',') if r.strip()]
elif DEBUG:
    # Default regexes for common dev and deployment hosts, including local LAN ranges
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https?://.*\.up\.railway\.app(:\d+)?$",
        r"^https?://localhost(:\d+)?$",
        r"^https?://127\.0\.0\.1(:\d+)?$",
        # Private LAN ranges to support dev from another device on the network
        r"^https?://10(?:\.\d+){3}(:\d+)?$",
        r"^https?://192\.168(?:\.\d+){2}(:\d+)?$",
        r"^https?://172\.(1[6-9]|2\d|3[0-1])(?:\.\d+){2}(:\d+)?$",
    ]
else:
    # In production, only explicit CORS_ALLOWED_ORIGINS are used; no regex fallback
    CORS_ALLOWED_ORIGIN_REGEXES = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'django_extensions',
    'accounts',
    'education',
    'payments',
    'notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Static files via WhiteNoise in production
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ---------- Production security hardening ----------
if not DEBUG:
    SECURE_SSL_REDIRECT = (not IS_TEST) and (os.getenv('SECURE_SSL_REDIRECT', 'True').lower() == 'true')
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_SECURE = True
    # For SPA on a separate domain: SameSite=None + Secure
    SESSION_COOKIE_SAMESITE = os.getenv('COOKIE_SAMESITE', 'None')
    CSRF_COOKIE_SAMESITE = os.getenv('CSRF_SAMESITE', 'None')
    # HSTS: enable gradually via env
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '0'))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'False').lower() == 'true'
    SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', 'False').lower() == 'true'

# Feature flags for gradual rollout
FEATURE_COOKIE_AUTH = os.getenv('FEATURE_COOKIE_AUTH', 'True').lower() == 'true'
FEATURE_CASES = os.getenv('FEATURE_CASES', 'True').lower() == 'true'
FEATURE_RAG = os.getenv('FEATURE_RAG', 'False').lower() == 'true'
FEATURE_SIGNED_URLS = os.getenv('FEATURE_SIGNED_URLS', 'False').lower() == 'true'

ROOT_URLCONF = 'aieducation.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'aieducation.wsgi.application'

# Database configuration
# - USE_SQLITE=True in .env to force local SQLite for development
# - Otherwise, use Postgres from env (Railway PG* or Supabase-style env names)
def _env(name: str, default: str | None = None) -> str | None:
    # support both UPPER and lower case keys present in some env templates
    return os.getenv(name) or os.getenv(name.lower(), default)

USE_SQLITE = (_env('USE_SQLITE', 'False').lower() == 'true') or False

pg_name = _env('PGDATABASE', _env('dbname'))
pg_user = _env('PGUSER', _env('user'))
pg_password = _env('PGPASSWORD', _env('password'))
pg_host = _env('PGHOST', _env('host'))
pg_port = _env('PGPORT', _env('port', '5432'))

DATABASES = {}

if USE_SQLITE or not (pg_name and pg_user and pg_host):
    # Local development default when env is incomplete or forced
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
else:
    # Remote/local Postgres with optional SSL
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': pg_name or 'postgres',
        'USER': pg_user or 'postgres',
        'PASSWORD': pg_password or '',
        'HOST': pg_host or 'localhost',
        'PORT': pg_port or '5432',
        'OPTIONS': {},
    }

    # Enable SSL by default for non-local hosts (e.g., Supabase pooler)
    host_norm = (pg_host or '').strip().lower()
    is_local_host = host_norm in ('localhost', '127.0.0.1', '') or host_norm.endswith('.local')
    sslmode = _env('DB_SSLMODE') or (_env('PGSSLMODE')) or (None if is_local_host else 'require')
    if sslmode:
        DATABASES['default']['OPTIONS']['sslmode'] = sslmode

    # Prefer DATABASE_URL if provided (e.g., from Railway/Supabase console)
    _db_url = _env('DATABASE_URL')
    if _db_url:
        try:
            import dj_database_url  # type: ignore
            parsed = dj_database_url.parse(_db_url, conn_max_age=600, ssl_require=True)
            # Keep explicit OPTIONS.sslmode if already set, otherwise use parsed
            existing_opts = DATABASES['default'].get('OPTIONS', {})
            parsed_opts = parsed.get('OPTIONS', {})
            merged_opts = {**parsed_opts, **existing_opts}
            parsed['OPTIONS'] = merged_opts
            DATABASES['default'] = parsed
        except Exception as e:
            # Don't crash on bad URLs; fall back to explicit settings
            logging.getLogger(__name__).warning(f"DATABASE_URL parse failed: {e}")

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
# Optionally serve MEDIA via Django in production (for small deployments)
SERVE_MEDIA = os.getenv('SERVE_MEDIA', 'False').lower() == 'true'

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.CookieJWTAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': os.getenv('THROTTLE_USER', '60/min'),
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

TEST_RUNNER = 'aieducation.test_runner.ProjectDiscoverRunner'

# AI settings
AI_DAILY_TOKEN_BUDGET = int(os.getenv('AI_DAILY_TOKEN_BUDGET', '50000'))
AI_ALLOWED_MODELS = os.getenv('AI_ALLOWED_MODELS', 'gpt-4o-mini').split(',')

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': JWT_SIGNING_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Celery/Redis удалены по требованиям проекта

# Email settings
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)

# If SSL is enabled, prefer SMTPS default port 465 unless overridden
if EMAIL_USE_SSL and os.getenv('EMAIL_PORT') is None:
    EMAIL_PORT = 465

# Frontend URL
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# OpenAI
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

# Logging
LOG_TO_FILE = os.getenv('LOG_TO_FILE', 'True' if DEBUG else 'False').lower() == 'true'

_logging_handlers = {
    'console': {
        'level': 'INFO',
        'class': 'logging.StreamHandler',
    },
}

_django_handlers = ['console']
if LOG_TO_FILE:
    _logging_handlers['file'] = {
        'level': 'INFO',
        'class': 'logging.FileHandler',
        'filename': 'django.log',
    }
    _django_handlers.append('file')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': _logging_handlers,
    'loggers': {
        'django': {
            'handlers': _django_handlers,
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Helpful startup hint in development: log selected DB engine/host (no secrets)
if DEBUG:
    try:
        _db = DATABASES.get('default', {})
        _engine = _db.get('ENGINE', '')
        _host = _db.get('HOST', '') if isinstance(_db, dict) else ''
        logging.getLogger(__name__).info(f"DB engine: {_engine} host: {_host or 'local/sqlite'}")
    except Exception:
        pass
