from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Read JWT access token from HttpOnly cookie instead of Authorization header.

    Falls back to the standard header-based auth, so both mechanisms work
    simultaneously during the transition period.
    """

    def authenticate(self, request):
        raw = request.COOKIES.get('access_token')
        if raw:
            # Inject the token into the META so the parent class picks it up
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {raw}'
        return super().authenticate(request)
