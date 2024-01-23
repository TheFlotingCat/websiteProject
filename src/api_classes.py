from pydantic import BaseModel


class TestAnswers(BaseModel):
    values: list[str]


class User(BaseModel):
    name: str
    score: int
