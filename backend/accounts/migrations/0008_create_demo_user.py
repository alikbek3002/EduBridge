from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_demo_user(apps, schema_editor):
    """Idempotently create a demo account so testers can sign in.

    Credentials: demo@example.com / Demo12345!
    Safe to re-run: uses get_or_create on User and UserProfile.
    """
    User = apps.get_model('accounts', 'User')
    UserProfile = apps.get_model('accounts', 'UserProfile')

    user, created = User.objects.get_or_create(
        email='demo@example.com',
        defaults={
            'username': 'demo',
            'first_name': 'Demo',
            'last_name': 'User',
            'is_active': True,
            'is_verified': True,
        },
    )

    # Always reset the password so the documented credentials work
    user.password = make_password('Demo12345!')
    user.is_active = True
    if hasattr(user, 'is_verified'):
        user.is_verified = True
    user.save()

    UserProfile.objects.get_or_create(
        user=user,
        defaults={'onboarding_completed': True},
    )


def remove_demo_user(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(email='demo@example.com').delete()


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0007_userprofile_codice_step_1_completed_and_more'),
    ]

    operations = [
        migrations.RunPython(create_demo_user, remove_demo_user),
    ]
