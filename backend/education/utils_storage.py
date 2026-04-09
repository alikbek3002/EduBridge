import os
import uuid
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """Returns an authenticated Supabase client."""
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise ValueError("Supabase credentials not configured properly.")
    return create_client(url, key)

def upload_document_to_supabase(file_obj, user_id, document_type):
    """
    Uploads a file to Supabase storage.
    Returns (path, size_bytes).
    """
    supabase = get_supabase_client()
    
    # Генерация уникального пути
    file_ext = os.path.splitext(file_obj.name)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    storage_path = f"documents/{user_id}/{document_type}/{unique_filename}"
    
    # Чтение данных
    file_bytes = file_obj.read()
    size_bytes = len(file_bytes)
    file_obj.seek(0)
    
    # Загрузка в bucket 'secure-documents' (убедитесь, что он создан в Supabase)
    bucket_name = 'secure-documents'
    
    # Вызов API загрузки
    supabase.storage.from_(bucket_name).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": getattr(file_obj, 'content_type', 'application/octet-stream')}
    )
    
    return storage_path, size_bytes

def get_signed_url(storage_path, expires_in=3600):
    """
    Generates a signed URL for a file in Supabase storage.
    """
    supabase = get_supabase_client()
    bucket_name = 'secure-documents'
    
    # Supabase Python client signature format for create_signed_url
    res = supabase.storage.from_(bucket_name).create_signed_url(storage_path, expires_in)
    return res.get('signedURL', None) or res.get('signedUrl', None)
