from pydantic import BaseModel


class UnitOpenRequest(BaseModel):
    unit_id: str


class UnitOpenResponse(BaseModel):
    lives_deducted: bool
    lives_remaining: int
    already_opened: bool


class QuizAttempt(BaseModel):
    concept_tag: str | None = None  # null for skills not yet concept-tagged
    correct: bool


class UnitCompleteRequest(BaseModel):
    unit_id: str
    quiz_score: int | None = None
    quiz_attempts: list[QuizAttempt] | None = None


class UnitCompleteResponse(BaseModel):
    status: str
    xp_earned: int
    xp_total: int
    streak: int
    next_unit_id: str | None = None


class ProgressItem(BaseModel):
    unit_id: str
    status: str
    score: int | None = None
    opened_at: str | None = None
    completed_at: str | None = None
