from django.db import migrations


def forwards(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor == 'sqlite':
        with schema_editor.connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info('education_university')")
            cols = [row[1] for row in cursor.fetchall()]
        if 'deadline' not in cols:
            schema_editor.execute(
                "ALTER TABLE education_university ADD COLUMN deadline date NULL;"
            )
        if 'founded_year' in cols:
            try:
                schema_editor.execute(
                    "ALTER TABLE education_university DROP COLUMN founded_year;"
                )
            except Exception:
                # Older SQLite without DROP COLUMN support: ignore quietly
                pass
    else:
        # Postgres or others
        schema_editor.execute(
            "ALTER TABLE education_university ADD COLUMN IF NOT EXISTS deadline date NULL;"
        )
        schema_editor.execute(
            "ALTER TABLE education_university DROP COLUMN IF EXISTS founded_year;"
        )


def backwards(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor == 'sqlite':
        with schema_editor.connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info('education_university')")
            cols = [row[1] for row in cursor.fetchall()]
        if 'founded_year' not in cols:
            schema_editor.execute(
                "ALTER TABLE education_university ADD COLUMN founded_year integer NULL;"
            )
        if 'deadline' in cols:
            try:
                schema_editor.execute(
                    "ALTER TABLE education_university DROP COLUMN deadline;"
                )
            except Exception:
                pass
    else:
        schema_editor.execute(
            "ALTER TABLE education_university ADD COLUMN IF NOT EXISTS founded_year integer NULL;"
        )
        schema_editor.execute(
            "ALTER TABLE education_university DROP COLUMN IF EXISTS deadline;"
        )


class Migration(migrations.Migration):

    dependencies = [
        ("education", "0004_fix_university_founded_year"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
