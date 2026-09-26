from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


# Test for /ti/main-table
# @pytest.mark.asyncio
@pytest.mark.skip(reason="Endpoint not implemented yet")
async def test_post__get_ti_table(client: AsyncClient):
    """Test the /ti/main-table endpoint returns the expected table structure."""
    # Mock dependencies
    # with patch("src.gai_cti_backend.routes.ti.get_indicators", new_callable=AsyncMock) as mock_get_indicators, \
    #      patch("src.gai_cti_backend.routes.ti.redis.Redis") as mock_redis:

    #     # Configure mocks
    #     mock_redis.return_value.get.return_value = '{"feeds_name2id": {"Feed 1": "feed1_id"}}'
    #     mock_get_indicators.return_value = [
    #         {
    #             "node": {
    #                 "id": "1",
    #                 "name": "Indicator 1",
    #                 "createdBy": {"name": "Feed 1"},
    #                 "indicator_types": ["ipv4"],
    #                 "created_at": "2023-01-01T00:00:00",
    #                 "x_opencti_score": 50,
    #                 "objectLabel": [{"value": "label1"}],
    #             },
    #             "cursor": "cursor1",
    #         }
    #     ]

    #     # Send request
    #     response = await client.post("/ti/main-table", json={"page_size": 10})

    #     # Assertions
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert "rows" in data
    #     assert "columns" in data
    #     assert len(data["rows"]) == 1
    #     assert data["rows"][0] == {
    #         "id": "1",
    #         "name": "Indicator 1",
    #         "feed_source": "Feed 1",
    #         "type": "ipv4",
    #         "creation_time": "2023-01-01T00:00:00",
    #         "score": 50,
    #         "labels": ["label1"],
    #         "cursor": "cursor1",
    #     }
    pass


@pytest.mark.skip(reason="Endpoint not implemented yet")
async def test_post__get_ti_table___with_empty_data(client: AsyncClient):
    pass


# @pytest.mark.asyncio
@pytest.mark.skip(reason="Endpoint not implemented yet")
async def test_get__get_indicator__with_valid_test_data_to_check_endpoint_functionality(
    client: AsyncClient,
):
    """Test the /ti/indicator/{indicator_id} endpoint with valid test data."""
    # Mock dependencies
    # with patch("src.gai_cti_backend.routes.ti.get_indicator_by_id", new_callable=AsyncMock) as mock_get_indicator_by_id:
    #     # Configure mocks
    #     mock_get_indicator_by_id.return_value = {
    #         "id": "1",
    #         "name": "Indicator 1",
    #         "createdBy": {"name": "Feed 1"},
    #         "indicator_types": ["ipv4"],
    #         "created_at": "2023-01-01T00:00:00",
    #         "x_opencti_score": 50,
    #         "objectLabel": [{"value": "label1"}],
    #     }

    #     # Send request
    #     response = await client.get("/ti/indicator/1")

    #     # Assertions
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["id"] == "1"
    #     assert data["name"] == "Indicator 1"
    #     assert data["createdBy"]["name"] == "Feed 1"
    #     assert data["indicator_types"] == ["ipv4"]
    #     assert data["created_at"] == "2023-01-01T00:00:00"
    #     assert data["x_opencti_score"] == 50
    #     assert data["objectLabel"][0]["value"] == "label1"
