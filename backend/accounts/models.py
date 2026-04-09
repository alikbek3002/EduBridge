from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid


class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # 2FA (TOTP) поля
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=64, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    interests = models.JSONField(default=list, blank=True)
    goals = models.JSONField(default=list, blank=True)
    language_levels = models.JSONField(default=dict, blank=True)
    education_background = models.TextField(blank=True)
    work_experience = models.TextField(blank=True)
    preferred_countries = models.JSONField(default=list, blank=True)
    budget_range = models.CharField(max_length=50, blank=True)
    study_duration = models.CharField(max_length=50, blank=True)
    onboarding_completed = models.BooleanField(default=False)
    # Дата экзамена/сертификата IELTS
    ielts_exam_date = models.DateField(null=True, blank=True)
    # Баллы и цели по экзаменам
    ielts_current_score = models.FloatField(null=True, blank=True)
    ielts_target_score = models.FloatField(null=True, blank=True)
    tolc_current_score = models.FloatField(null=True, blank=True)
    tolc_target_score = models.FloatField(null=True, blank=True)
    # Дата экзамена TOLC (если планируется/сдан)
    tolc_exam_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"


class UserDevice(models.Model):
    """Устройство/сессия пользователя (в связке с refresh JTI).

    Храним минимальную информацию, чтобы уметь:
    - показывать список активных устройств
    - завершать конкретную сессию (блокировать refresh по jti)
    - завершать все сессии
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='devices')
    user_agent = models.TextField(blank=True)
    ip_address = models.CharField(max_length=64, blank=True)
    refresh_jti = models.CharField(max_length=255, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_seen']

    def __str__(self) -> str:
        agent = (self.user_agent or '')[:32]
        return f"{self.user.email} • {agent} • {self.ip_address}"


class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Verification for {self.user.email}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Password reset for {self.user.email}"


class ConsultantProfile(models.Model):
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='consultant_profile')
    bio = models.TextField(blank=True)
    languages = models.JSONField(default=list, blank=True)
    specialties = models.JSONField(default=list, blank=True)
    timezone = models.CharField(max_length=64, default='Europe/Moscow')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['is_active'])]

    def __str__(self):
        return f"Consultant: {self.user.email}"


class Consent(models.Model):
    CONSENT_TYPES = [
        ('terms', 'Terms'),
        ('privacy', 'Privacy'),
        ('ai_processing', 'AI Processing'),
        ('marketing', 'Marketing'),
        ('data_transfer', 'Data Transfer'),
    ]
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='consents')
    consent_type = models.CharField(max_length=32, choices=CONSENT_TYPES)
    version = models.CharField(max_length=64)
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.CharField(max_length=64, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        unique_together = [('user', 'consent_type', 'version')]
        indexes = [
            models.Index(fields=['user', 'consent_type']),
            models.Index(fields=['granted_at']),
        ]

    def __str__(self):
        return f"Consent({self.consent_type} v{self.version}) for {self.user.email}"
