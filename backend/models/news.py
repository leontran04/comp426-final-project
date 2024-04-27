from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from .user import User
from .organization import Organization


class StateEnum(Enum):
    DRAFT = 0
    PUBLISHED = 1
    ARCHIVED = 2


class News(BaseModel):
    """
    Pydantic model to represent a News Post.
    """

    id: int | None
    headline: str
    synopsis: str
    main_story: str
    user_id: int
    user: User | None
    organization_id: int | None
    organization: Organization | None
    state: StateEnum
    slug: str
    image_url: str | None
    pub_date: datetime
    mod_date: datetime
