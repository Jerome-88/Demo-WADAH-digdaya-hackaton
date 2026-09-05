from pydantic import BaseModel


class PortfolioItem(BaseModel):
    title: str
    skill: str
    verified: bool
    created_at: str


class PortfolioUser(BaseModel):
    name: str
    skill: str


class PortfolioResponse(BaseModel):
    user: PortfolioUser
    portfolio: list[PortfolioItem]
