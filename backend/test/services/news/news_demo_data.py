import pytest
from sqlalchemy.orm import Session
from ....models.news import News, StateEnum
from ....entities.news_entity import NewsEntity
import datetime

from ..reset_table_id_seq import reset_table_id_seq


def date_maker(days_in_future: int, hour: int, minutes: int) -> datetime.datetime:
    """
    Creates a new `datetime` object relative to the current day when the
    data is reset using a reset script.

    Parameters:
        days_in_future (int): Number of days in the future from the current day to set the date
        hour (int): Which hour of the day to set the `datetime`, using the 24 hour clock
        minutes (int): Which minute to set the `datetime`

    Returns:
        datetime: `datetime` object to use in events test data.
    """
    # Find the date and time at the moment the script is run
    now = datetime.datetime.now()
    # Set the date and time to 12:00AM of that day
    current_day = datetime.datetime(now.year, now.month, now.day)
    # Create a delta containing the offset for which to move the current date
    timedelta = datetime.timedelta(days=days_in_future, hours=hour, minutes=minutes)
    # Create the new date object offset by `timedelta`
    new_date = current_day + timedelta
    # Returns the new date
    return new_date


testpost = NewsEntity(
    id=1,
    headline="test1",
    synopsis="test1",
    main_story="test1",
    state=StateEnum.DRAFT,
    slug="test",
    image_url="",
    pub_date=date_maker(days_in_future=-40, hour=10, minutes=0),
    mod_date=date_maker(days_in_future=-40, hour=10, minutes=0),
    user_id=1,
    organization_id=1,
)

testpost1 = NewsEntity(
    id=2,
    headline="test",
    synopsis="test",
    main_story="test",
    state=StateEnum.PUBLISHED,
    slug="test2",
    image_url="",
    pub_date=datetime.datetime.now(),
    mod_date=datetime.datetime.now(),
    user_id=2,
    organization_id=2,
)

testpost2 = NewsEntity(
    id=3,
    headline="test2",
    synopsis="test2",
    main_story="test2",
    state=StateEnum.PUBLISHED,
    slug="test1",
    image_url="",
    pub_date=date_maker(days_in_future=-40, hour=10, minutes=0),
    mod_date=date_maker(days_in_future=-40, hour=10, minutes=0),
    user_id=2,
    organization_id=4,
)
news = [testpost, testpost1, testpost2]


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
