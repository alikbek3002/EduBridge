from django.db import migrations, models


def forwards(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    # Ensure 'level' column exists; remove 'currency' where supported
    if vendor == 'sqlite':
        # Inspect columns
        with schema_editor.connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info('education_university')")
            cols = [row[1] for row in cursor.fetchall()]
        if 'level' not in cols:
            schema_editor.execute("ALTER TABLE education_university ADD COLUMN level varchar(50)")
        if 'currency' in cols:
            # DROP COLUMN is supported on SQLite >= 3.35, but not IF EXISTS; guard with try
            try:
                schema_editor.execute("ALTER TABLE education_university DROP COLUMN currency")
            except Exception:
                # On older SQLite versions, safely ignore; the extra column won't affect ORM
                pass
    else:
        # Postgres (and others supporting IF [NOT] EXISTS)
        schema_editor.execute(
            "ALTER TABLE education_university ADD COLUMN IF NOT EXISTS level varchar(50);"
        )
        schema_editor.execute(
            "ALTER TABLE education_university DROP COLUMN IF EXISTS currency;"
        )


def backwards(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor == 'sqlite':
        with schema_editor.connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info('education_university')")
            cols = [row[1] for row in cursor.fetchall()]
        # Recreate currency if missing
        if 'currency' not in cols:
            schema_editor.execute(
                "ALTER TABLE education_university ADD COLUMN currency varchar(3) DEFAULT 'EUR'"
            )
        # Drop level if present
        if 'level' in cols:
            try:
                schema_editor.execute("ALTER TABLE education_university DROP COLUMN level")
            except Exception:
                pass
    else:
        schema_editor.execute(
            "ALTER TABLE education_university ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'EUR';"
        )
        schema_editor.execute(
            "ALTER TABLE education_university DROP COLUMN IF EXISTS level;"
        )


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(forwards, backwards),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='university',
                    name='level',
                    field=models.CharField(blank=True, max_length=50),
                ),
                migrations.RemoveField(
                    model_name='university',
                    name='currency',
                ),
            ],
        ),
    ]
