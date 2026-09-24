from pydantic import BaseModel


class TalentSummary(BaseModel):
    id: str
    name: str
    skill: str
    avatar_url: str | None = None
    certified_at: str


class TalentsResponse(BaseModel):
    talents: list[TalentSummary]
