from pydantic import BaseModel


class ConceptScore(BaseModel):
    concept: str
    score: int  # 0-100, average correctness across all attempts for this concept


class ResourceSuggestion(BaseModel):
    weakness: str
    search_query: str


class InsightSkillResponse(BaseModel):
    strengths: list[ConceptScore]
    weaknesses: list[ConceptScore]
    resources: list[ResourceSuggestion]
    is_premium: bool
    has_data: bool  # false if the user hasn't completed any tagged quiz yet


class InsightAnalyzeResponse(BaseModel):
    analysis: str
    generated_at: str
