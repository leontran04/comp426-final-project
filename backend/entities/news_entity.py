from backend.models.news import News, StateEnum
from .entity_base import EntityBase
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Self
from datetime import datetime, timedelta, timezone
from sqlalchemy import Enum as SQLAlchemyEnum


class NewsEntity(EntityBase):

    # Name for News table in PostgreSQL database
    __tablename__ = "news"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    headline: Mapped[str] = mapped_column(String, nullable=False)
    synopsis: Mapped[str] = mapped_column(String, nullable=False)
    main_story: Mapped[str] = mapped_column(String, nullable=False)
    # author: Mapped[str] = mapped_column(String, nullable=False)
    # organization: Mapped[str] = mapped_column(String)
    state: Mapped[StateEnum] = mapped_column(SQLAlchemyEnum(StateEnum))
    slug: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    image_url: Mapped[str] = mapped_column(String, nullable=True)
    pub_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now(timezone.utc) - timedelta(hours=5),
    )
    mod_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now(timezone.utc) - timedelta(hours=5),
        onupdate=datetime.now(timezone.utc) - timedelta(hours=5),
    )

    # One to one
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)
    user: Mapped["UserEntity"] = relationship(back_populates="news")

    # Many to one
    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organization.id"), nullable=True
    )
    organization: Mapped["OrganizationEntity"] = relationship(back_populates="news")

    @classmethod
    def from_model(cls, model: News) -> Self:
        """
        Class method that converts an `Organization` model into a `OrganizationEntity`

        Parameters:
            - model (Organization): Model to convert into an entity
        Returns:
            OrganizationEntity: Entity created from model
        """
        return cls(
            id=model.id,
            headline=model.headline,
            synopsis=model.synopsis,
            main_story=model.main_story,
            # author=model.author,
            user_id=model.user_id,
            organization_id=model.organization_id,
            state=model.state,
            slug=model.slug,
            image_url=model.image_url,
            pub_date=model.pub_date,
            mod_date=model.mod_date,
        )

    def to_model(self) -> News:
        """
        Class method that converts an `Organization` model into a `OrganizationEntity`

        Parameters:
            - model (Organization): Model to convert into an entity
        Returns:
            OrganizationEntity: Entity created from model
        """
        organization = None
        if self.organization != None:
            organization = self.organization.to_model()

        return News(
            id=self.id,
            headline=self.headline,
            synopsis=self.synopsis,
            main_story=self.main_story,
            user_id=self.user_id,
            user=self.user.to_model(),
            organization_id=self.organization_id,
            organization=organization,
            state=self.state,
            slug=self.slug,
            image_url=self.image_url,
            pub_date=self.pub_date,
            mod_date=self.mod_date,
        )
