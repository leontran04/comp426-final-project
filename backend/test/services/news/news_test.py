"""Tests for the OrganizationService class."""

# PyTest
import pytest
from unittest.mock import create_autospec

from backend.services.exceptions import (
    UserPermissionException,
    ResourceNotFoundException,
)

# Tested Dependencies
from ....models import News
from ....services import NewsService

# Injected Service Fixtures
from ..fixtures import news_svc_integration

# Explicitly import Data Fixture to load entities in database
from ..core_data import setup_insert_data_fixture

# Data Models for Fake Data Inserted in Setup
from .news_test_data import (
    news,
    to_add,
    to_add_conflicting_id,
)
from ..user_data import root, user

__authors__ = ["Ajay Gandecha"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"

# Test Functions

# Test `NewsService.all()`


def test_get_all(news_svc_integration: NewsService):
    """Test that all organizations can be retrieved."""
    fetched_news = news_svc_integration.all()
    assert fetched_news is not None
    assert len(fetched_news) == len(news)
    assert isinstance(fetched_news[0], News)


# Test `NewsService.create()`


def test_create_enforces_permission(news_svc_integration: NewsService):
    """Test that the service enforces permissions when attempting to create a news post."""

    # Setup to test permission enforcement on the PermissionService.
    news_svc_integration._permission = create_autospec(news_svc_integration._permission)

    # Test permissions with root user (admin permission)
    news_svc_integration.create(root, to_add)
    news_svc_integration._permission.enforce.assert_called_with(
        root, "news.create", "news"
    )


def test_create_news_as_root(news_svc_integration: NewsService):
    """Test that the root user is able to create new news."""
    created_post = news_svc_integration.create(root, to_add)
    assert created_post is not None
    assert created_post.id is not None


def test_create_news_id_already_exists(
    news_svc_integration: NewsService,
):
    """Test that the root user is able to create new news when an extraneous ID is provided."""
    created_post = news_svc_integration.create(root, to_add_conflicting_id)
    assert created_post is not None
    assert created_post.id is not None


def test_create_news_as_user(news_svc_integration: NewsService):
    """Test that any user is *unable* to create new news."""
    with pytest.raises(UserPermissionException):
        news_svc_integration.create(user, to_add)
        pytest.fail()  # Fail test if no error was thrown abov


def test_delete_enforces_permission(news_svc_integration: NewsService):
    """Test that the service enforces permissions when attempting to delete an organization."""

    # Setup to test permission enforcement on the PermissionService.
    news_svc_integration._permission = create_autospec(news_svc_integration._permission)

    # Test permissions with root user (admin permission)
    news_svc_integration.delete(root, to_add.slug)
    news_svc_integration._permission.enforce.assert_called_with(
        root, "news.delete", "news"
    )


def test_delete_news_as_root(news_svc_integration: NewsService):
    """Test that the root user is able to delete organizations."""
    news_svc_integration.delete(root, to_add.slug)
    with pytest.raises(ResourceNotFoundException):
        news_svc_integration.get_by_slug(to_add.slug)


def test_delete_news_as_user(news_svc_integration: NewsService):
    """Test that any user is *unable* to delete organizations."""
    with pytest.raises(UserPermissionException):
        news_svc_integration.delete(user, to_add.slug)
