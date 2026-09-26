from datetime import datetime

from src.gai_cti_backend.models.ti import TIRow


def test_ti_row():
    """Test the TIRow model correctly assigns and validates fields."""
    row = TIRow(
        id="1",
        name="Indicator 1",
        feed_source="Feed 1",
        type="ipv4",
        creation_time=datetime(2023, 1, 1),
        score=50,
        labels=["label1"],
        cursor="cursor1",
    )

    # Assertions
    assert row.id == "1"
    assert row.name == "Indicator 1"
    assert row.feed_source == "Feed 1"
    assert row.type == "ipv4"
    assert row.creation_time == datetime(2023, 1, 1)
    assert row.score == 50
    assert row.labels == ["label1"]
    assert row.cursor == "cursor1"
