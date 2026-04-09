from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0006_remove_university_founded_year_university_deadline_and_more'),
    ]

    # No-op: deadline addition and founded_year removal handled idempotently in 0005.
    # Altering auto_now_add doesn't change DB schema; skipping to avoid conflicts.
    operations = []
