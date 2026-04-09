import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aieducation.settings")

import django
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

User = get_user_model()

def ensure_user(email: str, password: str, is_superuser=False):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email.split('@')[0],
            'first_name': 'Dev',
            'last_name': 'User',
            'is_active': True,
            'is_staff': is_superuser,
            'is_superuser': is_superuser,
        }
    )
    if created:
        user.set_password(password)
        user.save()
        print(f"Created {'superuser' if is_superuser else 'user'} {email}")
    else:
        print(f"User {email} already exists")

if __name__ == '__main__':
    ensure_user('admin@example.com', 'admin123', is_superuser=True)
    ensure_user('test@example.com', 'test123', is_superuser=False)
    print('Done')