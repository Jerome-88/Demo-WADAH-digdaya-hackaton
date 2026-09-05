from pydantic import BaseModel


class MatchedTalent(BaseModel):
    name: str
    skill: str
    score: float | None = None
    verified_portfolio: bool


class MatchingResponse(BaseModel):
    talents: list[MatchedTalent]
