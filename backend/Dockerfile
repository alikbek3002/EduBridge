FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY . /app

RUN set -e; \
    if [ -f /app/requirements.txt ] && [ -f /app/manage.py ]; then \
        pip install --no-cache-dir -r /app/requirements.txt; \
    elif [ -f /app/backend/requirements.txt ] && [ -f /app/backend/manage.py ]; then \
        pip install --no-cache-dir -r /app/backend/requirements.txt; \
    else \
        echo "Could not locate backend requirements/manage.py in build context"; \
        exit 1; \
    fi

RUN set -e; \
    if [ -f /app/manage.py ]; then \
        cd /app && python manage.py collectstatic --noinput || true; \
    elif [ -f /app/backend/manage.py ]; then \
        cd /app/backend && python manage.py collectstatic --noinput || true; \
    fi

CMD ["sh", "-c", "if [ -f /app/manage.py ]; then exec gunicorn aieducation.wsgi:application --chdir /app --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 60; else exec gunicorn aieducation.wsgi:application --chdir /app/backend --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 60; fi"]
