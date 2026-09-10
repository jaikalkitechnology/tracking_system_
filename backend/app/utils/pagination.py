from typing import Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

T = TypeVar("T")


class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        limit: int = Query(20, ge=1, le=100, description="Items per page"),
    ):
        self.page = page
        self.limit = limit
        self.offset = (page - 1) * limit


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int


def paginate(db: Session, query, pagination: PaginationParams, schema):
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    rows = db.execute(query.offset(pagination.offset).limit(pagination.limit)).scalars().all()
    pages = (total + pagination.limit - 1) // pagination.limit if total else 0
    return PaginatedResponse(
        items=[schema.model_validate(row) for row in rows],
        total=total,
        page=pagination.page,
        limit=pagination.limit,
        pages=pages,
    )
