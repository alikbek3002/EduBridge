import logging
import os
import time

from django.conf import settings
from django.utils import timezone
from openai import OpenAI
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import AIUsage
from .rag import build_rag_prompt, retrieve_chunks

logger = logging.getLogger(__name__)

ALLOWED_MODELS = getattr(settings, "AI_ALLOWED_MODELS", ["gpt-4o-mini"])
DAILY_BUDGET = getattr(settings, "AI_DAILY_TOKEN_BUDGET", 50000)
MAX_MESSAGE_LENGTH = 4000
MAX_HISTORY = 20
MAX_TOKENS_CAP = 600


def _normalize_request_id(completion):
    request_id = getattr(completion, "id", "")
    if isinstance(request_id, (str, int, float)):
        return str(request_id)
    return ""


def _get_tokens_today(user):
    """Return today's token usage values for a user."""
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

    model = data.get("model", "gpt-4o-mini")
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
    Secure AI chat proxy.
    Expects JSON: { messages: [{role, content}], model?, temperature?, max_tokens? }
    Returns: { role: 'assistant', content: string }
    """
    user = request.user
    data = request.data or {}
    validated, error_response = _validate_request_payload(data)
    if error_response is not None:
        return error_response

    messages = validated["messages"]
    model = validated["model"]
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY_SECRET") or settings.OPENAI_API_KEY

    # Keep request validation identical in demo and live modes.
    if not api_key:
        last_user = ""
        for message in reversed(messages):
            if message.get("role") == "user":
                last_user = message.get("content", "")
                break
        demo = (
            f"DEMO: I received your message: '{last_user[:100]}'. "
            "Configure OPENAI_API_KEY in .env to enable live responses."
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
        last_user_msg = ""
        for message in msgs:
            role = message.get("role", "user")
            if role not in ("user", "assistant", "system"):
                role = "user"
            content = message.get("content", "")
            if role == "user":
                last_user_msg = str(content)
            formatted.append({"role": role, "content": content})

        use_rag = str(data.get("use_rag", "true")).lower() in ("true", "1", "yes")
        if use_rag and last_user_msg:
            chunks = retrieve_chunks(last_user_msg, top_k=3)
            system_prompt = build_rag_prompt(chunks)
        else:
            from .prompts import SYSTEM_BASE

            system_prompt = SYSTEM_BASE

        formatted = [message for message in formatted if message["role"] != "system"]
        formatted.insert(0, {"role": "system", "content": system_prompt})

        temperature = float(data.get("temperature", 0.6))
        max_tokens = min(int(data.get("max_tokens", 300)), MAX_TOKENS_CAP)

        client = OpenAI(api_key=api_key)
        t0 = time.time()
        completion = client.chat.completions.create(
            model=model,
            messages=formatted,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        latency_ms = int((time.time() - t0) * 1000)
        content = completion.choices[0].message.content

        usage = getattr(completion, "usage", None)
        try:
            AIUsage.objects.create(
                user=user,
                model=model,
                prompt_tokens=getattr(usage, "prompt_tokens", 0) if usage else 0,
                completion_tokens=getattr(usage, "completion_tokens", 0) if usage else 0,
                total_tokens=getattr(usage, "total_tokens", 0) if usage else 0,
                request_id=_normalize_request_id(completion),
                latency_ms=latency_ms,
            )
        except Exception as log_err:
            logger.warning("Failed to log AI usage: %s", log_err)

        logger.info(
            "ai_chat user_id=%s model=%s tokens=%s latency_ms=%s",
            user.id,
            model,
            getattr(usage, "total_tokens", "?") if usage else "?",
            latency_ms,
        )

        return Response({"role": "assistant", "content": content})

    except Exception as exc:
        logger.error("AI Chat error: %s", exc, exc_info=True)
        return Response({"error": "AI service error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
