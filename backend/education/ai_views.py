import logging
import os
import time

from django.conf import settings
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import AIUsage

logger = logging.getLogger(__name__)

ALLOWED_MODELS = getattr(settings, "AI_ALLOWED_MODELS", ["claude-haiku-4-5-20251001"])
DEFAULT_MODEL = ALLOWED_MODELS[0] if ALLOWED_MODELS else "claude-haiku-4-5-20251001"
DAILY_BUDGET = getattr(settings, "AI_DAILY_TOKEN_BUDGET", 50000)
MAX_MESSAGE_LENGTH = 4000
MAX_HISTORY = 20
MAX_TOKENS_CAP = 1024

SYSTEM_PROMPT = (
    "Ты дружелюбный ассистент для подготовки к поступлению в итальянские "
    "университеты и сдаче IELTS. Отвечай кратко и по делу на русском языке."
)


def _get_tokens_today(user):
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return AIUsage.objects.filter(
        user=user, created_at__gte=today_start
    ).values_list("total_tokens", flat=True)


def _validate_request_payload(data):
    messages = data.get("messages", [])
    if not isinstance(messages, list) or not messages:
        return None, Response(
            {"error": "messages is required and must be a non-empty list"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for message in messages:
        content = message.get("content", "")
        if len(content) > MAX_MESSAGE_LENGTH:
            return None, Response(
                {
                    "error": (
                        f"Message content exceeds maximum length of "
                        f"{MAX_MESSAGE_LENGTH} characters"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    model = data.get("model", DEFAULT_MODEL)
    if model not in ALLOWED_MODELS:
        return None, Response(
            {"error": f'Model not allowed. Choose from: {", ".join(ALLOWED_MODELS)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return {"messages": messages, "model": model}, None


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def chat(request):
    """
    Простой проксі к Anthropic Claude.
    Принимает: { messages: [{role, content}], model?, temperature?, max_tokens? }
    Возвращает: { role: 'assistant', content: string }
    """
    user = request.user
    data = request.data or {}
    validated, error_response = _validate_request_payload(data)
    if error_response is not None:
        return error_response

    messages = validated["messages"]
    model = validated["model"]
    api_key = os.getenv("ANTHROPIC_API_KEY") or getattr(settings, "ANTHROPIC_API_KEY", "")

    if not api_key:
        last_user = ""
        for message in reversed(messages):
            if message.get("role") == "user":
                last_user = message.get("content", "")
                break
        demo = (
            f"DEMO: получено сообщение «{last_user[:100]}». "
            "Установите ANTHROPIC_API_KEY в .env для реальных ответов."
        )
        return Response({"role": "assistant", "content": demo})

    try:
        tokens_today = sum(_get_tokens_today(user))
        if tokens_today >= DAILY_BUDGET:
            return Response(
                {"error": "Daily AI usage limit exceeded. Try again tomorrow."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        max_messages = min(int(data.get("max_history", MAX_HISTORY)), MAX_HISTORY)
        msgs = messages[-max_messages:]

        formatted = []
        for message in msgs:
            role = message.get("role", "user")
            if role not in ("user", "assistant"):
                continue
            content = message.get("content", "")
            if not content:
                continue
            formatted.append({"role": role, "content": str(content)})

        if not formatted:
            return Response(
                {"error": "No valid user/assistant messages provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        temperature = float(data.get("temperature", 0.7))
        max_tokens = min(int(data.get("max_tokens", 600)), MAX_TOKENS_CAP)

        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        t0 = time.time()
        completion = client.messages.create(
            model=model,
            system=SYSTEM_PROMPT,
            messages=formatted,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        latency_ms = int((time.time() - t0) * 1000)

        # Anthropic returns content as a list of blocks
        content_parts = []
        for block in getattr(completion, "content", []):
            text = getattr(block, "text", None)
            if text:
                content_parts.append(text)
        content = "".join(content_parts) or "Не удалось получить ответ."

        usage = getattr(completion, "usage", None)
        prompt_tokens = getattr(usage, "input_tokens", 0) if usage else 0
        completion_tokens = getattr(usage, "output_tokens", 0) if usage else 0
        total_tokens = prompt_tokens + completion_tokens

        try:
            AIUsage.objects.create(
                user=user,
                model=model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                request_id=str(getattr(completion, "id", "") or ""),
                latency_ms=latency_ms,
            )
        except Exception as log_err:
            logger.warning("Failed to log AI usage: %s", log_err)

        logger.info(
            "ai_chat user_id=%s model=%s tokens=%s latency_ms=%s",
            user.id,
            model,
            total_tokens,
            latency_ms,
        )

        return Response({"role": "assistant", "content": content})

    except Exception as exc:
        logger.error("AI Chat error: %s", exc, exc_info=True)
        return Response({"error": "AI service error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
