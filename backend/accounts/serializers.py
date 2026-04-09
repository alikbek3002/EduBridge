from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import User, UserProfile, Consent
try:
    from payments.models import UserSubscription
except Exception:  # payments app might be unavailable in some contexts
    UserSubscription = None  # type: ignore


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        # Normalize inputs
        email = (attrs.get('email') or '').strip().lower()
        password = (attrs.get('password') or '')

        if email and password:
            # Try authenticate using USERNAME_FIELD-aware kwargs
            user = authenticate(email=email, password=password) or authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Неверные учетные данные')
            if not user.is_active:
                raise serializers.ValidationError('Аккаунт деактивирован')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Необходимо указать email и пароль')


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    # Совместимость с фронтендом
    is_email_verified = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name', 'phone',
            'date_of_birth', 'country', 'city', 'avatar', 'is_verified',
            'two_factor_enabled',
            'created_at', 'updated_at', 'profile',
            # Дополнительные удобные поля
            'is_email_verified', 'email_verified', 'subscription'
        )
        read_only_fields = ('id', 'is_verified', 'created_at', 'updated_at')
        
    def validate_phone(self, value):
        if value and not value.startswith('+'):
            value = '+' + value
        return value

    def get_is_email_verified(self, obj: User) -> bool:
        # Дзеркалим is_verified в поле, которого ждёт фронт
        return bool(getattr(obj, 'is_verified', False))

    def get_email_verified(self, obj: User) -> bool:
        return bool(getattr(obj, 'is_verified', False))

    def get_subscription(self, obj: User):
        """Возвращает компактную информацию о подписке, ожидаемую фронтом.
        Формат:
        {
          plan: str,
          is_active: bool,
          starts_at: iso,
          expires_at: iso,
          days_left: int
        }
        """
        try:
            if UserSubscription is None:
                return None
            qs = UserSubscription.objects.filter(user=obj, is_active=True, end_date__gt=timezone.now())
            sub = qs.order_by('-start_date').first()
            if not sub:
                return None
            starts_at = getattr(sub, 'start_date', None)
            expires_at = getattr(sub, 'end_date', None)
            now = timezone.now()
            days_left = None
            if expires_at:
                delta = expires_at - now
                days_left = max(0, delta.days)
            plan_name = getattr(getattr(sub, 'plan', None), 'name', '') or ''
            return {
                'plan': plan_name,
                'is_active': bool(getattr(sub, 'is_active', False) and (expires_at is None or expires_at > now)),
                'starts_at': starts_at.isoformat() if starts_at else None,
                'expires_at': expires_at.isoformat() if expires_at else None,
                'days_left': days_left,
            }
        except Exception:
            return None


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Новые пароли не совпадают")
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Неверный текущий пароль")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField()


class ConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = ('id', 'consent_type', 'version', 'granted_at', 'revoked_at', 'ip_address', 'user_agent')
        read_only_fields = ('id', 'granted_at', 'revoked_at', 'ip_address', 'user_agent')
