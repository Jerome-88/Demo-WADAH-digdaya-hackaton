from pydantic import BaseModel


class SubmissionResponse(BaseModel):
    id: str
    unit_id: str
    content_url: str | None = None
    content_text: str | None = None
    status: str
    reviewer_notes: str | None = None
    revision_count: int
    xp_earned: int | None = None
    submitted_at: str
    reviewed_at: str | None = None
