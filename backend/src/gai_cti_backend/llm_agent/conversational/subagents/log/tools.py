from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from langchain_core.tools import tool

from .....elastic_client.utils.others import get_es


# log tools
@tool(
    "get_single_log_info_by_id",
    description="""
    Retrieve a single log document from Elasticsearch by its ID.

    This function queries Elasticsearch to fetch the full `_source` of a log 
    document from a given index pattern, based on its unique log ID. 

    If the document is found, its source content is returned as plain text.
    If the document is not found or an error occurs, a `KeyError` is raised.

    Args:
        index_pattern (str): Elasticsearch index pattern to search in 
                             (e.g., `"logs-*"`).
        log_id (str): The unique identifier (`_id`) of the log document.

    Returns:
        Dict[str, str]: A dictionary containing:
            - `"logs_text"` (str): The full `_source` of the document, 
              converted to string.

    Raises:
        KeyError: If the log document cannot be found in the given index.

    Example:
        >>> result = await get_log_info("logs-*", "abc123")
        >>> result["logs_text"]
        "{'@timestamp': '2025-09-01T12:00:00Z', 'message': 'Suspicious activity...'}"
    """,
)
async def get_single_log_info_by_id(index_pattern: str, log_id: str) -> Dict[str, str]:
    es = get_es()

    try:
        query_body = {"query": {"term": {"_id": log_id}}}
        response = await es.search(index=index_pattern, body=query_body)

        if response["hits"]["total"]["value"] == 0:
            raise KeyError(f"Log with ID '{log_id}' not found in {index_pattern}.")

        # Get the first (and should be only) hit
        log_document = response["hits"]["hits"][0]

    except Exception as e:
        raise KeyError(
            f"Log with ID '{log_id}' not found in {index_pattern}. Error: {e}"
        )
    finally:
        await es.close()

    log_source = log_document["_source"]
    log_text = str(log_source)

    return {"logs_text": log_text}


@tool(
    "get_index_info_table",
    description="""
    Generate a daily log count table from Elasticsearch.

    This function queries Elasticsearch for the number of documents indexed 
    per day, based on a date field determined by the index type:
    
    - If the index pattern starts with `"open"`, it uses 
      `threatintel.opencti.created_at` as the date field.
    - Otherwise, it uses the standard `@timestamp` field.

    The results are aggregated into daily buckets using a `date_histogram`
    and returned as a list of dictionaries with the day and corresponding
    document count.

    Args:
        index_pattern (str): Elasticsearch index pattern to query 
                             (e.g., `"logs-*"`, `"open-threatintel-*"`).

    Returns:
        List[Dict[str, Any]]: A list of daily document counts, where each 
        entry contains:
            - `"timestamp"` (str): The date in `YYYY-MM-DD` format.
            - `"total_doc_count"` (int): The number of documents for that day.

    Example:
        >>> result = await log_info_table("logs-*")
        >>> result[0]
        {'timestamp': '2025-09-01', 'total_doc_count': 1234}
    """,
)
async def get_index_info_table(index_pattern: str) -> list[Dict[str, Any]]:
    es = get_es()
    try:
        if index_pattern.startswith("open"):
            field = "threatintel.opencti.created_at"
        else:
            field = "@timestamp"
        query = {
            "size": 0,
            "aggs": {
                "docs_per_day": {
                    "date_histogram": {
                        "field": field,
                        "calendar_interval": "day",
                        "format": "yyyy-MM-dd",
                        "min_doc_count": 0,
                    }
                }
            },
        }
        response = await es.search(index=index_pattern, body=query)

    except Exception as e:
        raise RuntimeError(f"Error extracting logs: {e}")
    finally:
        await es.close()

    result = []

    for item in response["aggregations"]["docs_per_day"]["buckets"]:
        log_data_table = {
            "timestamp": item["key_as_string"],
            "total_doc_count": item["doc_count"],
        }
        result.append(log_data_table)

    return result


@tool(
    "get_aggregated_index_info",
    description="""
    Query Elasticsearch for aggregated log information.

    This function runs an asynchronous aggregation query against the specified 
    Elasticsearch index pattern. It collects two main aggregations:

    1. **labels** – Top 10 most frequent values from the `labels.keyword` field.
    2. **threatintel.indicator.provider** – Top 10 most frequent values from the 
       `threatintel.indicator.provider.keyword` field.

    The function returns the raw aggregation results from Elasticsearch, including 
    bucket counts for each field.

    Args:
        index_pattern (str): Elasticsearch index pattern to query (e.g., "logs-*").

    Returns:
        Dict: Aggregation results with two keys:
            - "labels": Buckets of label values and their document counts.
            - "threatintel.indicator.provider": Buckets of threat intel providers 
              and their document counts.

    Example:
        >>> result = await aggregated_log_info("logs-*")
        >>> result["labels"]["buckets"][0]
        {'key': 'botnet_cc', 'doc_count': 6222}
    """,
)
async def get_aggregated_index_info(index_pattern: str) -> Dict:
    es = get_es()
    try:
        response = await es.search(
            index=index_pattern,
            body={
                "size": 0,
                "aggs": {
                    "labels": {"terms": {"field": "labels.keyword", "size": 10}},
                    "threatintel.indicator.provider": {
                        "terms": {
                            "field": "threatintel.indicator.provider.keyword",
                            "size": 10,
                        }
                    },
                },
            },
        )

        if "aggregations" not in response:
            return {
                "labels": {"buckets": []},
                "threatintel.indicator.provider": {"buckets": []},
                "error": f"No aggregations found for index_pattern={index_pattern}",
            }

        return response["aggregations"]

    except Exception as e:
        raise RuntimeError(f"Error extracting logs: {e}")
    finally:
        await es.close()


@tool(
    "get_logs_by_time_range",
    description="""
    Retrieve logs within a specific time range from now.
    
    Fetches logs from the specified index pattern looking back a certain number 
    of hours from the current time. Useful for analyzing recent log activity.
    
    Args:
        index_pattern (str): Elasticsearch index pattern to query (e.g., "logs-*")
        hours (int): Number of hours to look back from now (default: 24)
                     Examples: 24 (1 day), 48 (2 days), 168 (1 week), 720 (30 days)
    
    Returns:
        Dict containing:
            - "total_count" (int): Total number of logs found
            - "time_range" (str): Human-readable time range
            - "sample_logs" (List[Dict]): Up to 100 sample log entries
            - "top_labels" (List[Dict]): Most frequent labels in the time range
    
    Example:
        >>> result = await get_logs_by_time_range("logs-*", 24)
        >>> result["total_count"]
        1523
    """,
)
async def get_logs_by_time_range(
    index_pattern: str, hours: int = 24
) -> Dict[str, Any]:
    es = get_es()
    
    now_datetime = datetime.now()
    start_datetime = now_datetime - timedelta(hours=hours)
    
    # Determine the timestamp field based on index pattern
    if index_pattern.startswith("open"):
        timestamp_field = "threatintel.opencti.created_at"
    else:
        timestamp_field = "@timestamp"
    
    try:
        # Query for logs in the time range
        query_body = {
            "query": {
                "range": {
                    timestamp_field: {
                        "gte": start_datetime.isoformat(timespec="milliseconds") + "Z",
                        "lte": now_datetime.isoformat(timespec="milliseconds") + "Z",
                    }
                }
            },
            "size": 100,  # Limit sample logs
            "sort": [{timestamp_field: {"order": "desc"}}],
            "aggs": {
                "top_labels": {
                    "terms": {"field": "labels.keyword", "size": 10}
                }
            },
        }
        
        response = await es.search(index=index_pattern, body=query_body)
        
        total_count = response["hits"]["total"]["value"]
        sample_logs = [hit["_source"] for hit in response["hits"]["hits"]]
        
        top_labels = []
        if "aggregations" in response and "top_labels" in response["aggregations"]:
            top_labels = [
                {"label": bucket["key"], "count": bucket["doc_count"]}
                for bucket in response["aggregations"]["top_labels"]["buckets"]
            ]
        
        return {
            "total_count": total_count,
            "time_range": f"Last {hours} hours ({start_datetime.strftime('%Y-%m-%d %H:%M:%S')} to {now_datetime.strftime('%Y-%m-%d %H:%M:%S')})",
            "sample_logs": sample_logs,
            "top_labels": top_labels,
        }
        
    except Exception as e:
        raise RuntimeError(f"Error retrieving logs by time range: {e}")
    finally:
        await es.close()


@tool(
    "get_logs_by_date_range",
    description="""
    Retrieve logs between specific start and end dates.
    
    Fetches logs from the specified index pattern within a custom date range.
    Useful for analyzing historical log data or comparing specific time periods.
    
    Args:
        index_pattern (str): Elasticsearch index pattern to query (e.g., "logs-*")
        start_date (str): Start date in ISO format (e.g., "2025-02-02" or "2025-02-02T12:00:00")
        end_date (str): End date in ISO format (e.g., "2025-02-05" or "2025-02-05T23:59:59")
    
    Returns:
        Dict containing:
            - "total_count" (int): Total number of logs found
            - "date_range" (str): Human-readable date range
            - "sample_logs" (List[Dict]): Up to 100 sample log entries
            - "top_labels" (List[Dict]): Most frequent labels in the date range
            - "daily_distribution" (List[Dict]): Log counts per day
    
    Raises:
        ValueError: If date format is invalid or start_date >= end_date
    
    Example:
        >>> result = await get_logs_by_date_range("logs-*", "2025-02-02", "2025-02-05")
        >>> result["total_count"]
        4521
    """,
)
async def get_logs_by_date_range(
    index_pattern: str, start_date: str, end_date: str
) -> Dict[str, Any]:
    es = get_es()
    
    # Parse dates
    try:
        start_datetime = datetime.fromisoformat(start_date.replace("Z", ""))
    except ValueError:
        raise ValueError(
            f"Invalid start_date format: {start_date}. Use ISO format like '2025-02-02' or '2025-02-02T12:00:00'"
        )
    
    try:
        end_datetime = datetime.fromisoformat(end_date.replace("Z", ""))
    except ValueError:
        raise ValueError(
            f"Invalid end_date format: {end_date}. Use ISO format like '2025-02-05' or '2025-02-05T23:59:59'"
        )
    
    if start_datetime >= end_datetime:
        raise ValueError(f"start_date ({start_date}) must be before end_date ({end_date})")
    
    # Determine the timestamp field based on index pattern
    if index_pattern.startswith("open"):
        timestamp_field = "threatintel.opencti.created_at"
    else:
        timestamp_field = "@timestamp"
    
    try:
        # Query for logs in the date range
        query_body = {
            "query": {
                "range": {
                    timestamp_field: {
                        "gte": start_datetime.isoformat(timespec="milliseconds") + "Z",
                        "lte": end_datetime.isoformat(timespec="milliseconds") + "Z",
                    }
                }
            },
            "size": 100,  # Limit sample logs
            "sort": [{timestamp_field: {"order": "desc"}}],
            "aggs": {
                "top_labels": {
                    "terms": {"field": "labels.keyword", "size": 10}
                },
                "daily_distribution": {
                    "date_histogram": {
                        "field": timestamp_field,
                        "calendar_interval": "day",
                        "format": "yyyy-MM-dd",
                    }
                },
            },
        }
        
        response = await es.search(index=index_pattern, body=query_body)
        
        total_count = response["hits"]["total"]["value"]
        sample_logs = [hit["_source"] for hit in response["hits"]["hits"]]
        
        top_labels = []
        if "aggregations" in response and "top_labels" in response["aggregations"]:
            top_labels = [
                {"label": bucket["key"], "count": bucket["doc_count"]}
                for bucket in response["aggregations"]["top_labels"]["buckets"]
            ]
        
        daily_distribution = []
        if "aggregations" in response and "daily_distribution" in response["aggregations"]:
            daily_distribution = [
                {"date": bucket["key_as_string"], "count": bucket["doc_count"]}
                for bucket in response["aggregations"]["daily_distribution"]["buckets"]
            ]
        
        return {
            "total_count": total_count,
            "date_range": f"{start_date} to {end_date}",
            "sample_logs": sample_logs,
            "top_labels": top_labels,
            "daily_distribution": daily_distribution,
        }
        
    except Exception as e:
        raise RuntimeError(f"Error retrieving logs by date range: {e}")
    finally:
        await es.close()
