from unittest.mock import AsyncMock, patch

import pytest
from httpx import Client


# Test for GET /feeds/main-table
@pytest.mark.asyncio
async def test_get__get_feeds_main_table__with_valid_test_data_to_check_functionality_of_endpoint(
    client: Client,
):
    """Test the /feeds/main-table endpoint returns the expected FeedTable model with valid column data."""
    # Mock dependency
    with patch(
        "src.gai_cti_backend.routes.feeds.get_all_feeds", new_callable=AsyncMock
    ) as mock_get_all_feeds:
        # Configure mock
        mock_get_all_feeds.return_value = [
            {
                "id": "feed1",
                "name": "Feed 1",
                "updated_at": "2023-01-01T00:00:00",
                "actions": ["Edit"],
                "active": True,
            }
        ]

        # Send request
        response = client.get("/feeds/main-table")

        # Assertions
        assert response.status_code == 200

        data = response.json()
        assert "rows" in data
        assert len(data["rows"]) == 1
        assert data["rows"][0] == {
            "id": "feed1",
            "name": "Feed 1",
            "last_update": "2023-01-01T00:00:00",
            "actions": ["Edit"],
            "active": True,
        }


# Test for GET /feeds/{id}
@pytest.mark.asyncio
async def test_get__get_feed_info__with_valid_test_data_to_check_functionality_of_endpoint(
    client: Client,
):
    """Test the /feeds/{id} endpoint returns the expected Feed model with valid column data."""
    # Mock dependency
    with patch(
        "src.gai_cti_backend.routes.feeds.get_feed_by_id", new_callable=AsyncMock
    ) as mock_get_feed_by_id:
        # Configure mock
        mock_get_feed_by_id.return_value = {
            "id": "feed1",
            "name": "Feed 1",
            "updated_at": "2023-01-01T00:00:00",
            "active": True,
            "works": {
                "name": "n1",
                "completed_number": "cn1",
                "status": "s1",
                "completed_time": "ct1",
                "processed_time": "pt1",
            },
        }

        # Send request
        response = client.get("/feeds/1")

        # Assertions
        assert response.status_code == 200

        data = response.json()
        assert data == {
            "id": "feed1",
            "name": "Feed 1",
            "active": True,
            "max_conf_score": 100,
            "updating_interval": 10,
        }


# Test for PATCH /feeds/{id}
@pytest.mark.skip(reason="Endpoint not implemented yet.")
async def test_patch__update_feed_conf__with_valid_test_data_to_check_functionality_of_endpoint():
    pass
