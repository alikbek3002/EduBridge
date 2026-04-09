import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aieducation.settings")

import django
django.setup()

from django.contrib.auth import authenticate, get_user_model  # noqa: E402

User = get_user_model()

email = 'test@example.com'
password = 'test123'

print('User exists:', User.objects.filter(email=email).exists())
u = User.objects.filter(email=email).first()
if u:
    print('Active:', u.is_active)
    print('Username field value:', getattr(u, u.USERNAME_FIELD))

print('Auth with username kw:', bool(authenticate(username=email, password=password)))
print('Auth with email kw:', bool(authenticate(email=email, password=password)))