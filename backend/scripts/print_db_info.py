import os
import django
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
# Ensure the backend base directory (containing the 'aieducation' package) is on sys.path
if str(BASE_DIR) not in sys.path:
	sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aieducation.settings")

django.setup()

from django.conf import settings  # noqa: E402

db = settings.DATABASES.get('default', {})
print("DEBUG=", settings.DEBUG)
print("USE_SQLITE env=", os.getenv('USE_SQLITE'))
print("DB ENGINE=", db.get('ENGINE'))
print("DB NAME=", db.get('NAME'))
print("DB HOST=", db.get('HOST'))
print("DB OPTIONS=", db.get('OPTIONS'))