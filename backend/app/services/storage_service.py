import uuid

from supabase import Client

# Private bucket per PRD section 6 — create this in Supabase Storage
# (see backend/README.md) before submissions can upload.
BUCKET = "submissions"


def upload_submission_file(
    supabase: Client, user_id: str, unit_id: str, filename: str, file_bytes: bytes, content_type: str,
) -> str:
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    path = f"{user_id}/{unit_id}/{uuid.uuid4()}.{ext}"
    supabase.storage.from_(BUCKET).upload(path, file_bytes, {"content-type": content_type})
    return path


def get_signed_url(supabase: Client, path: str, expires_in: int = 3600) -> str:
    result = supabase.storage.from_(BUCKET).create_signed_url(path, expires_in)
    return result.get("signedURL") or result.get("signed_url", "")
