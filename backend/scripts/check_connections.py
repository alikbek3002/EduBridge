import os
import sys
import json
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from supabase import create_client


BASE_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = BASE_DIR / ".env"


def mask_secret(value: str, keep: int = 4) -> str:
    if not value:
        return "<empty>"
    if len(value) <= keep * 2:
        return "*" * len(value)
    return f"{value[:keep]}...{value[-keep:]}"


def print_section(title: str) -> None:
    print()
    print(f"== {title} ==")


def print_result(name: str, ok: bool, details: str) -> None:
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name}: {details}")


def validate_database_url(raw_url: str) -> tuple[bool, str]:
    if not raw_url:
        return False, "DATABASE_URL is empty"

    try:
        parsed = urlparse(raw_url)
    except Exception as exc:
        return False, f"invalid URL: {exc}"

    if parsed.scheme not in {"postgres", "postgresql"}:
        return False, f"unexpected scheme '{parsed.scheme}'"
    if not parsed.hostname:
        return False, "hostname is missing"
    if not parsed.path or parsed.path == "/":
        return False, "database name is missing in path"

    db_name = parsed.path.lstrip("/")
    return True, f"scheme={parsed.scheme}, host={parsed.hostname}, db={db_name}"


def check_database_connection(raw_url: str) -> tuple[bool, str]:
    try:
        conn = psycopg2.connect(raw_url, connect_timeout=8, cursor_factory=RealDictCursor)
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "select current_database() as db, current_user as usr, version() as version"
                )
                row = cursor.fetchone() or {}
        finally:
            conn.close()
    except Exception as exc:
        return False, str(exc)

    version = str(row.get("version", "")).split(",")[0]
    return True, f"db={row.get('db')} user={row.get('usr')} version={version}"


def validate_supabase_url(raw_url: str) -> tuple[bool, str]:
    if not raw_url:
        return False, "SUPABASE_URL is empty"

    try:
        parsed = urlparse(raw_url)
    except Exception as exc:
        return False, f"invalid URL: {exc}"

    if parsed.scheme != "https":
        return False, f"expected https URL, got '{parsed.scheme}'"
    if not parsed.hostname:
        return False, "hostname is missing"

    return True, f"host={parsed.hostname}"


def inspect_service_role_key(raw_key: str) -> tuple[bool, str]:
    if not raw_key:
        return False, "SUPABASE_SERVICE_ROLE_KEY is empty"

    parts = raw_key.split(".")
    if len(parts) == 3:
        return True, f"jwt-looking key, masked={mask_secret(raw_key, keep=6)}"

    return True, f"non-JWT key format, masked={mask_secret(raw_key, keep=6)}"


def check_supabase_access(raw_url: str, raw_key: str) -> tuple[bool, str]:
    try:
        client = create_client(raw_url, raw_key)
        buckets = client.storage.list_buckets()
        bucket_names = [getattr(bucket, "name", "<unknown>") for bucket in buckets[:10]]
        count = len(buckets)
        sample = ", ".join(bucket_names) if bucket_names else "no buckets"
        return True, f"storage access ok, buckets={count} ({sample})"
    except Exception as exc:
        return False, str(exc)


def main() -> int:
    load_dotenv(dotenv_path=ENV_PATH)

    raw_database_url = os.getenv("DATABASE_URL", "").strip()
    raw_supabase_url = os.getenv("SUPABASE_URL", "").strip()
    raw_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    print("Env file:", ENV_PATH if ENV_PATH.exists() else "not found")

    print_section("DATABASE_URL")
    ok_db_url, db_url_details = validate_database_url(raw_database_url)
    print_result("DATABASE_URL format", ok_db_url, db_url_details)

    ok_db_conn = False
    if ok_db_url:
        ok_db_conn, db_conn_details = check_database_connection(raw_database_url)
        print_result("PostgreSQL connection", ok_db_conn, db_conn_details)

    print_section("SUPABASE")
    ok_supabase_url, supabase_url_details = validate_supabase_url(raw_supabase_url)
    print_result("SUPABASE_URL format", ok_supabase_url, supabase_url_details)

    ok_role_key, role_key_details = inspect_service_role_key(raw_service_role_key)
    print_result("SUPABASE_SERVICE_ROLE_KEY presence", ok_role_key, role_key_details)

    ok_supabase_access = False
    if ok_supabase_url and ok_role_key:
        ok_supabase_access, supabase_access_details = check_supabase_access(
            raw_supabase_url,
            raw_service_role_key,
        )
        print_result("Supabase service-role access", ok_supabase_access, supabase_access_details)

    all_ok = ok_db_url and ok_db_conn and ok_supabase_url and ok_role_key and ok_supabase_access

    print_section("SUMMARY")
    print(
        json.dumps(
            {
                "database_url_ok": ok_db_url,
                "database_connection_ok": ok_db_conn,
                "supabase_url_ok": ok_supabase_url,
                "service_role_key_ok": ok_role_key,
                "supabase_access_ok": ok_supabase_access,
                "all_ok": all_ok,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
