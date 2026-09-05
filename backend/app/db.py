from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache
def get_supabase() -> Client:
    """One cached client per process, using the service-role key — this
    backend always talks to Supabase as an admin and enforces access rules
    itself (see dependencies.get_current_user), rather than relying on the
    caller's own RLS-scoped session.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
