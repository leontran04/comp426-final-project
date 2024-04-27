from fastapi import APIRouter, Depends
from ..services.news import NewsService
from ..models.news import News
from ..api.authentication import registered_user
from ..models.user import User
from backend.models.pagination import NewsPaginationParams, Paginated


api = APIRouter(prefix="/api/news")
openapi_tags = {
    "name": "News",
    "description": "Create, update, delete, and retrieve News posts.",
}


@api.get("/paginate", tags=["News"])
def list_news(
    news_service: NewsService = Depends(),
    order_by: str = "time",
    ascending: str = "false",
    filter: str = "",
    range_start: str = "",
    range_end: str = "",
) -> Paginated[News]:
    """List news in time range via standard backend pagination query parameters."""

    pagination_params = NewsPaginationParams(
        order_by=order_by,
        ascending=ascending,
        filter=filter,
        range_start=range_start,
        range_end=range_end,
    )
    return news_service.get_paginated_news(pagination_params)


@api.get("", response_model=list[News], tags=["News"])
def get_all_news(
    news_service: NewsService = Depends(),
) -> list[News]:
    """
    Get all organizations

    Parameters:
        organization_service: a valid OrganizationService

    Returns:
        list[Organization]: All `Organization`s in the `Organization` database table
    """

    # Return all organizations
    return news_service.all()


@api.get("/{slug}", response_model=News, tags=["News"])
def get_news(
    slug: str,
    news_service: NewsService = Depends(),
) -> News:
    """
    Get all organizations

    Parameters:
        organization_service: a valid OrganizationService

    Returns:
        list[Organization]: All `Organization`s in the `Organization` database table
    """

    # Return all organizations
    return news_service.get(slug)


@api.post("", response_model=News, tags=["News"])
def new_news(
    news: News,
    subject: User = Depends(registered_user),
    news_service: NewsService = Depends(),
) -> News:
    """
    Create organization

    Parameters:
        organization: a valid Organization model
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService

    Returns:
        Organization: Created organization

    Raises:
        HTTPException 422 if create() raises an Exception
    """
    print("ID = " + str(news.id) + " ORGANIZATION ID: " + str(news.organization_id))
    return news_service.create(subject, news)


@api.put(
    "",
    responses={404: {"model": None}},
    response_model=News,
    tags=["News"],
)
def update_news(
    news: News,
    subject: User = Depends(registered_user),
    news_service: NewsService = Depends(),
) -> News:
    """
    Update organization

    Parameters:
        organization: a valid Organization model
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService

    Returns:
        Organization: Updated organization

    Raises:
        HTTPException 404 if update() raises an Exception
    """

    return news_service.update(subject, news)


@api.delete("/{slug}", response_model=None, tags=["News"])
def delete_news(
    slug: str,
    subject: User = Depends(registered_user),
    news_service: NewsService = Depends(),
):
    """
    Delete organization based on slug

    Parameters:
        slug: a string representing a unique identifier for an Organization
        subject: a valid User model representing the currently logged in User
        organization_service: a valid OrganizationService

    Raises:
        HTTPException 404 if delete() raises an Exception
    """

    news_service.delete(subject, slug)
