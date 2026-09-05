from pydantic import BaseModel


class UserMeResponse(BaseModel):
    id: str
    name: str
    skill: str
    avatar_url: str | None = None
    is_premium: bool
    xp: int
    lives: int
    streak: int
    level: int


class UserUpdateRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
