import pytest
from sqlalchemy.orm import Session
from ....models.news import News
from ....entities.news_entity import NewsEntity
from datetime import datetime

from ..reset_table_id_seq import reset_table_id_seq

testpost = News(
    id=1,
    headline="test",
    synopsis="test",
    main_story="test",
    state=0,
    slug="test",
    image_url="",
    pub_date=datetime.now(),
    mod_date=datetime.now(),
    user_id=1,
    organization_id=1,
)

testpost1 = News(
    id=2,
    headline="test",
    synopsis="test",
    main_story="test",
    state=1,
    slug="test",
    image_url="",
    pub_date=datetime.now(),
    mod_date=datetime.now(),
    user_id=2,
    organization_id=2,
)
news = [testpost, testpost1]

to_add = News(
    headline="newlyadded",
    synopsis="new info",
    main_story="new info",
    state=1,
    slug="important",
    image_url="",
    pub_date=datetime.now(),
    mod_date=datetime.now(),
    user_id=10,
    organization_id=10,
)

to_add_conflicting_id = News(
    id=2,
    headline="tests",
    synopsis="tests",
    main_story="tests",
    state=1,
    slug="tests",
    image_url="",
    pub_date=datetime.now(),
    mod_date=datetime.now(),
    user_id=2,
    organization_id=2,
)


def insert_fake_data(session: Session):
    """Inserts fake organization data into the test session."""

    global news

    # Create entities for test organization data
    entities = []
    for post in news:
        entity = NewsEntity.from_model(post)
        session.add(entity)
        entities.append(entity)

    # Reset table IDs to prevent ID conflicts
    reset_table_id_seq(session, NewsEntity, NewsEntity.id, len(news) + 1)

    # Commit all changes
    session.commit()


@pytest.fixture(autouse=True)
def fake_data_fixture(session: Session):
    """Insert fake data the session automatically when test is run.
    Note:
        This function runs automatically due to the fixture property `autouse=True`.
    """
    insert_fake_data(session)
    session.commit()
    yield
