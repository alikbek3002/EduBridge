from django.urls import path
from django.views.decorators.csrf import ensure_csrf_cookie
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('token/refresh/', views.refresh_token, name='refresh_token'),
    path('token/refresh-cookie/', views.refresh_cookie_token, name='refresh_cookie_token'),
    path('csrf/', ensure_csrf_cookie(views.csrf_bootstrap), name='csrf_bootstrap'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/update-complete/', views.update_user_profile, name='update_user_profile'),
    path('user-profile/', views.user_profile, name='user_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('confirm-password-reset/', views.confirm_password_reset, name='confirm_password_reset'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('email/verify/request/', views.request_email_verification, name='request_email_verification'),
    # Consent (P0.4)
    path('consents/', views.consents_view, name='consents'),
    path('delete-account/', views.delete_account, name='delete_account'),
    # devices / sessions
    path('devices/', views.list_devices, name='list_devices'),
    path('devices/revoke-all/', views.revoke_all_devices, name='revoke_all_devices'),
    path('devices/<uuid:device_id>/revoke/', views.revoke_device, name='revoke_device'),
    # 2FA
    path('2fa/setup/', views.twofa_setup, name='twofa_setup'),
    path('2fa/enable/', views.twofa_enable, name='twofa_enable'),
    path('2fa/disable/', views.twofa_disable, name='twofa_disable'),
]
