from django.db import migrations


def forwards(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor == 'sqlite':
        with schema_editor.connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info('education_university')")
            cols = [row[1] for row in cursor.fetchall()]
        if 'founded_year' not in cols:
            schema_editor.execute(
                "ALTER TABLE education_university ADD COLUMN founded_year integer NULL;"
            )
    else:
        schema_editor.execute(
            "ALTER TABLE education_university ADD COLUMN IF NOT EXISTS founded_year integer NULL;"
        )


class Migration(migrations.Migration):
    dependencies = [
        ('education', '0003_merge_20250909_1819'),
    ]

    operations = [
        # Database-only migration to ensure founded_year column exists
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
