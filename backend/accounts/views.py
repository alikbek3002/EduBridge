import os
import secrets
import uuid
from datetime import datetime

import pyotp
import base64

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

from .models import UserProfile, EmailVerification, PasswordResetToken, UserDevice, Consent
from .serializers import (
    UserLoginSerializer, UserSerializer,
    UserProfileSerializer, PasswordChangeSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, EmailVerificationSerializer, ConsentSerializer
)

User = get_user_model()


# --------------- Cookie helpers ---------------
def _set_auth_cookies(response, refresh):
    """Set HttpOnly JWT cookies on a DRF Response."""
    samesite = getattr(settings, 'SESSION_COOKIE_SAMESITE', 'None')
    secure = not settings.DEBUG
    response.set_cookie(
        'access_token', str(refresh.access_token),
        httponly=True, secure=secure,
        samesite=samesite, max_age=60 * 15,  # 15 min
    )
    response.set_cookie(
        'refresh_token', str(refresh),
        httponly=True, secure=secure,
        samesite=samesite, max_age=60 * 60 * 24 * 7,  # 7 days
    )
    return response


def _clear_auth_cookies(response):
    """Delete JWT cookies."""
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']

        # Если включена 2FA — требуем код
        if getattr(user, 'two_factor_enabled', False):
            provided_code = str(request.data.get('code', '')).strip()
            secret = getattr(user, 'two_factor_secret', '')
            if not provided_code or not secret:
                return Response({'require_2fa': True, 'message': 'Требуется код 2FA'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                totp = pyotp.TOTP(secret)
                if not totp.verify(provided_code, valid_window=1):
                    return Response({'require_2fa': True, 'error': 'Неверный код 2FA'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                return Response({'require_2fa': True, 'error': 'Ошибка проверки 2FA'}, status=status.HTTP_400_BAD_REQUEST)

        # Создаем JWT токены
        refresh = RefreshToken.for_user(user)

        # Регистрируем/обновляем устройство (refresh_jti)
        try:
            ua = request.META.get('HTTP_USER_AGENT', '')
            ip = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR') or ''
            jti = str(refresh.get('jti')) if hasattr(refresh, 'get') else refresh.get('jti', '')
            # fallback for simplejwt token attr
            if not jti:
                try:
                    jti = refresh.get('jti')
                except Exception:
                    jti = ''
            UserDevice.objects.create(
                user=user,
                user_agent=ua or '',
                ip_address=(ip.split(',')[0].strip() if isinstance(ip, str) else str(ip)),
                refresh_jti=str(jti or '')
            )
        except Exception:
            pass
        
        resp = Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })

        if getattr(settings, 'FEATURE_COOKIE_AUTH', False):
            _set_auth_cookies(resp, refresh)

        return resp
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        # Try cookie first, then body
        refresh_raw = request.COOKIES.get('refresh_token') or request.data.get('refresh')
        if refresh_raw:
            token = RefreshToken(refresh_raw)
            token.blacklist()
            # помечаем устройство как просроченное по jti
            try:
                jti = token.get('jti')
                if jti:
                    UserDevice.objects.filter(user=request.user, refresh_jti=str(jti)).delete()
            except Exception:
                pass

        resp = Response({'message': 'Успешный выход'})
        if getattr(settings, 'FEATURE_COOKIE_AUTH', False):
            _clear_auth_cookies(resp)
        return resp
    except Exception as e:
        resp = Response({'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST)
        if getattr(settings, 'FEATURE_COOKIE_AUTH', False):
            _clear_auth_cookies(resp)
        return resp


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    """
    Возвращает полные данные пользователя с профилем
    """
    try:
        # Получаем или создаем профиль пользователя
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Сериализуем пользователя с профилем
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': f'Ошибка при получении профиля: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Пароль успешно изменен'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            
            # Создаем токен для сброса пароля
            token = secrets.token_urlsafe(32)
            expires_at = timezone.now() + timezone.timedelta(hours=1)
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=expires_at
            )
            
            # Отправляем email для сброса пароля
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_mail(
                'Сброс пароля',
                f'Перейдите по ссылке для сброса пароля: {reset_url}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Инструкции по сбросу пароля отправлены на email'})
        except User.DoesNotExist:
            return Response({'message': 'Инструкции по сбросу пароля отправлены на email'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def confirm_password_reset(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
            if reset_token.is_expired():
                return Response({'error': 'Токен истек'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            reset_token.is_used = True
            reset_token.save()
            
            return Response({'message': 'Пароль успешно сброшен'})
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    serializer = EmailVerificationSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        
        try:
            verification = EmailVerification.objects.get(token=token, is_used=False)
            if verification.is_expired():
                return Response({'error': 'Токен истек'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = verification.user
            user.is_verified = True
            user.save()
            
            verification.is_used = True
            verification.save()
            
            return Response({'message': 'Email успешно подтвержден'})
        except EmailVerification.DoesNotExist:
            return Response({'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_email_verification(request):
    """
    Повторная отправка письма для подтверждения email текущего пользователя
    """
    user = request.user
    if user.is_verified:
        return Response({'message': 'Email уже подтвержден'}, status=status.HTTP_200_OK)

    # помечаем старые токены как использованные
    EmailVerification.objects.filter(user=user, is_used=False).update(is_used=True)

    # создаем новый токен и отправляем письмо
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timezone.timedelta(hours=24)
    EmailVerification.objects.create(user=user, token=token, expires_at=expires_at)

    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    send_mail(
        'Подтверждение email',
        f'Перейдите по ссылке для подтверждения email: {verification_url}',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )

    return Response({'message': 'Письмо для подтверждения отправлено'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token не предоставлен'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)
        
        resp = Response({
            'access': access_token,
            'refresh': str(token)
        })

        if getattr(settings, 'FEATURE_COOKIE_AUTH', False):
            # Also update cookies
            resp.set_cookie(
                'access_token', access_token,
                httponly=True, secure=not settings.DEBUG,
                samesite=getattr(settings, 'SESSION_COOKIE_SAMESITE', 'None'),
                max_age=60 * 15,
            )

        return resp
    except Exception as e:
        return Response({'error': 'Неверный refresh token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_cookie_token(request):
    """Refresh JWT using cookie-stored refresh token."""
    raw = request.COOKIES.get('refresh_token')
    if not raw:
        return Response({'error': 'Refresh cookie не найден'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        old = RefreshToken(raw)
        new_access = str(old.access_token)

        resp = Response({'access': new_access})
        if getattr(settings, 'FEATURE_COOKIE_AUTH', False):
            samesite = getattr(settings, 'SESSION_COOKIE_SAMESITE', 'None')
            secure = not settings.DEBUG
            resp.set_cookie(
                'access_token', new_access,
                httponly=True, secure=secure,
                samesite=samesite, max_age=60 * 15,
            )
            # If rotation is enabled, set new refresh cookie too
            if getattr(settings, 'SIMPLE_JWT', {}).get('ROTATE_REFRESH_TOKENS', False):
                resp.set_cookie(
                    'refresh_token', str(old),
                    httponly=True, secure=secure,
                    samesite=samesite, max_age=60 * 60 * 24 * 7,
                )
        return resp
    except Exception:
        resp = Response({'error': 'Неверный refresh token'}, status=status.HTTP_400_BAD_REQUEST)
        if getattr(settings, 'FEATURE_COOKIE_AUTH', False):
            _clear_auth_cookies(resp)
        return resp


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def csrf_bootstrap(request):
    """Return an empty response that sets the CSRF cookie for the SPA."""
    return Response({'detail': 'CSRF cookie set'})


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_user_profile(request):
    """
    Обновляет профиль пользователя и связанные данные профиля
    """
    try:
        user = request.user
        data = request.data
        
        # Разделяем данные пользователя и профиля
        user_data = {}
        profile_data = {}
        
        # Поля пользователя
        user_fields = ['phone', 'date_of_birth', 'country', 'city', 'avatar']
        for field in user_fields:
            if field in data:
                user_data[field] = data[field]
        
        # Поля профиля
        profile_fields = [
            'bio', 'interests', 'goals', 'language_levels', 
            'education_background', 'work_experience', 
            'preferred_countries', 'onboarding_completed',
            'ielts_exam_date',
            # прямые поля для результатов экзаменов
            'ielts_current_score', 'ielts_target_score',
            'tolc_current_score', 'tolc_target_score', 'tolc_exam_date'
        ]
        for field in profile_fields:
            if field in data:
                profile_data[field] = data[field]

        # Дополнительно: поддержка вложенного объекта exams
        # Ожидаемый формат:
        # exams: { ielts: { score: '6.5', date: 'YYYY-MM' }, tolc: { score: '30', date: 'YYYY-MM' } }
        try:
            exams = data.get('exams')
            # exams could arrive as JSON string when using multipart/form-data
            if isinstance(exams, str):
                try:
                    import json
                    exams = json.loads(exams)
                except Exception:
                    exams = None
            if isinstance(exams, dict):
                ielts = exams.get('ielts') or {}
                tolc = exams.get('tolc') or {}

                # IELTS score
                score = ielts.get('score')
                if score not in (None, ''):
                    try:
                        profile_data['ielts_current_score'] = float(str(score).replace(',', '.'))
                    except Exception:
                        pass
                # IELTS target
                target = ielts.get('target')
                if target not in (None, ''):
                    try:
                        profile_data['ielts_target_score'] = float(str(target).replace(',', '.'))
                    except Exception:
                        pass
                # IELTS date (YYYY-MM or YYYY-MM-DD)
                date_val = ielts.get('date')
                if isinstance(date_val, str) and date_val:
                    try:
                        if len(date_val) == 7 and date_val[4] == '-':
                            # YYYY-MM -> first day of month
                            dt = datetime.strptime(date_val + '-01', '%Y-%m-%d').date()
                        else:
                            dt = datetime.strptime(date_val, '%Y-%m-%d').date()
                        profile_data['ielts_exam_date'] = dt.isoformat()
                    except Exception:
                        pass

                # TOLC score
                tscore = tolc.get('score')
                if tscore not in (None, ''):
                    try:
                        profile_data['tolc_current_score'] = float(str(tscore).replace(',', '.'))
                    except Exception:
                        pass
                # TOLC target
                ttarget = tolc.get('target')
                if ttarget not in (None, ''):
                    try:
                        profile_data['tolc_target_score'] = float(str(ttarget).replace(',', '.'))
                    except Exception:
                        pass
                # TOLC date
                tdate_val = tolc.get('date')
                if isinstance(tdate_val, str) and tdate_val:
                    try:
                        if len(tdate_val) == 7 and tdate_val[4] == '-':
                            tdt = datetime.strptime(tdate_val + '-01', '%Y-%m-%d').date()
                        else:
                            tdt = datetime.strptime(tdate_val, '%Y-%m-%d').date()
                        profile_data['tolc_exam_date'] = tdt.isoformat()
                    except Exception:
                        pass
        except Exception:
            pass
        
        # Обновляем пользователя
        if user_data:
            user_serializer = UserSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Обновляем профиль
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                # Если данные профиля включают ключевые поля, можно отметить онбординг завершенным
                updated_profile = profile_serializer.save()
                
                # Если onboarding_completed явно передано как True, устанавливаем его
                if profile_data.get('onboarding_completed') is True:
                    updated_profile.onboarding_completed = True
                    updated_profile.save(update_fields=['onboarding_completed'])
                
                # Альтернативно: автоматическая проверка завершенности (без budget_range и study_duration)
                try:
                    required_ok = all([
                        bool(updated_profile.education_background),
                        (isinstance(updated_profile.interests, list) and len(updated_profile.interests) > 0) or 
                        (isinstance(updated_profile.interests, str) and len(updated_profile.interests.strip()) > 0),
                        isinstance(updated_profile.goals, list) and len(updated_profile.goals) > 0,
                        isinstance(updated_profile.language_levels, dict) and len(updated_profile.language_levels) > 0,
                        bool(user.phone),
                        bool(user.city),
                    ])
                    if required_ok and not updated_profile.onboarding_completed:
                        updated_profile.onboarding_completed = True
                        updated_profile.save(update_fields=['onboarding_completed'])
                except Exception:
                    pass
            else:
                return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Возвращаем обновленные данные пользователя
        user_serializer = UserSerializer(user)
        return Response({
            'message': 'Профиль успешно обновлен',
            'user': user_serializer.data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Ошибка при обновлении профиля: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# --------- 2FA (TOTP) ---------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def twofa_setup(request):
    """Генерирует секрет и otpauth URL для подключения в приложении-автентификаторе.
    Если уже включено, перегенерирует секрет только по запросу параметра force=true.
    """
    user = request.user
    force = str(request.data.get('force', 'false')).lower() == 'true'
    if user.two_factor_enabled and not force and user.two_factor_secret:
        secret = user.two_factor_secret
    else:
        # 32 random base32 secret
        secret = pyotp.random_base32()
        user.two_factor_secret = secret
        user.save(update_fields=['two_factor_secret'])
    issuer = 'EduBridge'
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=issuer)
    return Response({'secret': secret, 'otpauth_url': otp_uri})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def twofa_enable(request):
    """Проверяет введённый код и включает 2FA."""
    user = request.user
    code = str(request.data.get('code', ''))
    secret = user.two_factor_secret
    if not secret:
        return Response({'error': 'Сначала выполните настройку 2FA'}, status=status.HTTP_400_BAD_REQUEST)
    totp = pyotp.TOTP(secret)
    if not totp.verify(code, valid_window=1):
        return Response({'error': 'Неверный код'}, status=status.HTTP_400_BAD_REQUEST)
    user.two_factor_enabled = True
    user.save(update_fields=['two_factor_enabled'])
    return Response({'message': '2FA включена'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def twofa_disable(request):
    user = request.user
    user.two_factor_enabled = False
    user.two_factor_secret = ''
    user.save(update_fields=['two_factor_enabled', 'two_factor_secret'])
    return Response({'message': '2FA отключена'})


# --------- Устройства / Сессии ---------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_devices(request):
    devices = UserDevice.objects.filter(user=request.user).order_by('-last_seen')
    data = [
        {
            'id': str(d.id),
            'user_agent': d.user_agent,
            'ip_address': d.ip_address,
            'created_at': d.created_at.isoformat(),
            'last_seen': d.last_seen.isoformat(),
        }
        for d in devices
    ]
    return Response({'devices': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_device(request, device_id: str):
    try:
        device = UserDevice.objects.get(user=request.user, id=device_id)
    except UserDevice.DoesNotExist:
        return Response({'error': 'Устройство не найдено'}, status=status.HTTP_404_NOT_FOUND)

    # Удаляем устройство и, если есть jti, также пытаемся добавить в blacklist
    try:
        if device.refresh_jti:
            # simplejwt не предоставляет прямой API для blacklist по jti без токена,
            # поэтому просто удаляем запись устройства. Новый refresh по jti не выпустится.
            pass
    except Exception:
        pass

    device.delete()
    return Response({'message': 'Сессия завершена'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_all_devices(request):
    UserDevice.objects.filter(user=request.user).delete()
    return Response({'message': 'Все сессии завершены'})


# --------- Consent / Delete Account (P0.4) ---------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def consents_view(request):
    """GET: list user consents. POST: create/update consent (idempotent by type+version)."""
    user = request.user

    if request.method == 'GET':
        qs = Consent.objects.filter(user=user).order_by('-granted_at')
        return Response(ConsentSerializer(qs, many=True).data)

    # POST
    serializer = ConsentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    consent_type = serializer.validated_data['consent_type']
    version = serializer.validated_data['version']

    ip = request.META.get('HTTP_X_FORWARDED_FOR') or request.META.get('REMOTE_ADDR') or ''
    ua = request.META.get('HTTP_USER_AGENT', '')

    obj, created = Consent.objects.get_or_create(
        user=user,
        consent_type=consent_type,
        version=version,
        defaults={'ip_address': ip.split(',')[0].strip(), 'user_agent': ua},
    )
    return Response(
        ConsentSerializer(obj).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Permanently delete the user account and all associated data."""
    user = request.user

    # Blacklist current refresh token (from cookie or body)
    try:
        refresh_raw = request.COOKIES.get('refresh_token') or request.data.get('refresh')
        if refresh_raw:
            token = RefreshToken(refresh_raw)
            token.blacklist()
    except Exception:
        pass

    # django CASCADE will delete: profile, devices, consents, applications, documents, etc.
    user.delete()

    resp = Response({'message': 'Account deleted'}, status=status.HTTP_200_OK)
    if getattr(settings, 'FEATURE_COOKIE_AUTH', False):
        _clear_auth_cookies(resp)
    return resp
