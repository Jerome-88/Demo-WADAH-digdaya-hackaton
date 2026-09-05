from typing import Literal

from pydantic import BaseModel


class MentorChatRequest(BaseModel):
    message: str
    unit_id: str
    unit_stage: Literal["materi", "quiz", "checkpoint"]


class MentorChatResponse(BaseModel):
    response: str
    messages_used_today: int
    messages_limit: int | None = None  # null = unlimited (premium)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class MentorChatDemoRequest(BaseModel):
    message: str
    unit_id: str
    unit_stage: Literal["materi", "quiz", "checkpoint"]
    # Client-held rolling context — this endpoint has no Supabase to persist
    # to, so the frontend resends recent turns itself instead.
    history: list[ChatMessage] = []


class MentorChatDemoResponse(BaseModel):
    response: str
