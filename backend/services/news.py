from fastapi import Depends
from sqlalchemy import select, func, and_, exists, or_
from sqlalchemy.orm import Session

from ..database import db_session
from ..models.news import News
from ..entities.news_entity import NewsEntity
from ..entities.organization_entity import OrganizationEntity
from ..models import User
from .permission import PermissionService
from backend.models.pagination import NewsPaginationParams, Paginated
from datetime import datetime

from .exceptions import ResourceNotFoundException


class NewsService:
    def __init__(
        self,
        session: Session = Depends(db_session),
        permission: PermissionService = Depends(),
    ):
        """Initializes the `NewsService` session"""
        self._session = session
        self._permission = permission

    def all(self) -> list[News]:
        """
        Retrieves all organizations from the table

        Returns:
            list[Organization]: List of all `Organization`
        """
        # Select all entries in `Organization` table
        query = select(NewsEntity)
        entities = self._session.scalars(query).all()

        # Convert entries to a model and return
        return [entity.to_model() for entity in entities]

    def get(self, slug: str) -> News:

        # Find object to get
        obj = (
            self._session.query(NewsEntity)
            .filter(NewsEntity.slug == slug)
            .one_or_none()
        )

        # Ensure object exists
        if obj is None:
            raise ResourceNotFoundException(
                f"No news post found with matching slug: {slug}"
            )

        return obj.to_model()

    def create(self, subject: User, news: News) -> News:
        """Stores a timer in the database.

        Args:
            subject: User that is calling this method
            timer: Timer to store.
        Returns:
            PomodoroTimer: Created timer.
        """
        # Check if user has admin permissions
        self._permission.enforce(subject, "news.create", f"news")
        # Set timer id to none if an id was passed in
        if news.id:
            news.id = None

        # TODO: Create a new timer entity for the table.
        news_entity = NewsEntity.from_model(news)
        self._session.add(news_entity)
        self._session.commit()
        # TODO: Return the new news object.
        return news_entity.to_model()

    def update(self, subject: User, news: News) -> News:
        """
        Update the organization
        If none found with that id, a debug description is displayed.

        Parameters:
            subject: a valid User model representing the currently logged in User
            organization (Organization): Organization to add to table

        Returns:
            Organization: Updated organization object

        Raises:
            ResourceNotFoundException: If no organization is found with the corresponding ID
        """

        # Check if user has admin permissions
        self._permission.enforce(subject, "news.update", f"news/{news.slug}")

        # Query the organization with matching id
        obj = (
            self._session.query(NewsEntity)
            .filter(NewsEntity.slug == news.slug)
            .one_or_none()
        )

        # Check if result is null
        if obj is None:
            raise ResourceNotFoundException(
                f"No news post found with matching ID: {news.id}"
            )

        # Update organization object
        obj.headline = news.headline
        obj.synopsis = news.synopsis
        obj.main_story = news.main_story
        obj.state = news.state
        obj.slug = news.slug
        obj.image_url = news.image_url
        obj.pub_date = news.pub_date
        obj.mod_date = news.mod_date

        # Save changes
        self._session.commit()

        # Return updated object
        return obj.to_model()

    def delete(self, subject: User, slug: str) -> None:
        """
        Delete the organization based on the provided slug.
        If no item exists to delete, a debug description is displayed.

        Parameters:
            subject: a valid User model representing the currently logged in User
            slug: a string representing a unique organization slug

        Raises:
            ResourceNotFoundException: If no organization is found with the corresponding slug
        """
        # Check if user has admin permissions
        self._permission.enforce(subject, "news.delete", f"news")

        # Find object to delete
        obj = (
            self._session.query(NewsEntity)
            .filter(NewsEntity.slug == slug)
            .one_or_none()
        )

        # Ensure object exists
        if obj is None:
            raise ResourceNotFoundException(
                f"No news post found with matching slug: {slug}"
            )

        # Delete object and commit
        self._session.delete(obj)
        # Save changes
        self._session.commit()

    def get_paginated_news(
        self, pagination_params: NewsPaginationParams
    ) -> Paginated[News]:
        statement = select(NewsEntity)
        length_statement = select(func.count()).select_from(NewsEntity)
        if pagination_params.range_start != "":
            range_start = pagination_params.range_start
            range_end = pagination_params.range_end
            criteria = and_(
                NewsEntity.pub_date
                >= datetime.strptime(range_start, "%d/%m/%Y, %H:%M:%S"),
                NewsEntity.pub_date
                <= datetime.strptime(range_end, "%d/%m/%Y, %H:%M:%S"),
            )
            statement = statement.where(criteria)
            length_statement = length_statement.where(criteria)

        if pagination_params.filter != "":
            query = pagination_params.filter

            criteria = or_(
                NewsEntity.headline.ilike(f"%{query}%"),
                NewsEntity.synopsis.ilike(f"%{query}%"),
                exists().where(
                    OrganizationEntity.id == NewsEntity.organization_id,
                    OrganizationEntity.name.ilike(f"%{query}%"),
                ),
                exists().where(
                    OrganizationEntity.id == NewsEntity.organization_id,
                    OrganizationEntity.slug.ilike(f"%{query}%"),
                ),
            )
            statement = statement.where(criteria)
            length_statement = length_statement.where(criteria)

        offset = pagination_params.page * pagination_params.page_size
        limit = pagination_params.page_size

        # if pagination_params.order_by != "":
        #     statement = (
        #         statement.order_by(getattr(NewsEntity, pagination_params.order_by))
        #         if pagination_params.ascending
        #         else statement.order_by(
        #             getattr(NewsEntity, pagination_params.order_by).desc()
        #         )
        #     )
        statement = statement.order_by(
            getattr(NewsEntity, pagination_params.order_by).desc()
        )

        statement = statement.offset(offset).limit(limit)

        length = self._session.execute(length_statement).scalar()
        entities = self._session.execute(statement).scalars()

        return Paginated(
            items=[entity.to_model() for entity in entities],
            length=length,
            params=pagination_params,
        )
