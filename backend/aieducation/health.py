import os

from django.db import connections
from django.http import JsonResponse


def healthcheck(_request):
    strict_database = os.getenv("HEALTHCHECK_STRICT_DATABASE", "False").lower() == "true"

    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        if strict_database:
            return JsonResponse({"status": "error", "database": "unavailable"}, status=503)
        return JsonResponse({"status": "degraded", "database": "unavailable"}, status=200)

    return JsonResponse({"status": "ok", "database": "ok"})
