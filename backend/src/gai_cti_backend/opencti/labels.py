from datetime import datetime, timedelta
from typing import Dict, ItemsView

from async_lru import alru_cache
from gql import gql

from .send_request import send


async def get_all_labels() -> dict:
    query = gql(
        """
            query LabelsQuerySearchQuery(
              $search: String
            ) {
              labels(search: $search, first: 50000) {
                edges {
                  node {
                    id
                    value
                    color
                  }
                }
              }
            }
            
        """
    )

    variables = {"search": ""}

    result = await send(query=query, variables=variables)
    result = result["labels"]["edges"]

    label_names2id = {node["node"]["value"]: node["node"]["id"] for node in result}
    sorted_label_names2id = dict(sorted(label_names2id.items()))

    return sorted_label_names2id


@alru_cache(ttl=600)
async def get_most_active_labels() -> ItemsView[str, int]:
    query = gql(
        """
            query StixRelationshipsHorizontalBarsDistributionQuery(
              $field: String!
              $operation: StatsOperation!
              $startDate: DateTime
              $endDate: DateTime
              $dateAttribute: String
              $isTo: Boolean
              $limit: Int
              $fromOrToId: [String]
              $elementWithTargetTypes: [String]
              $fromId: [String]
              $fromRole: String
              $fromTypes: [String]
              $toId: [String]
              $toRole: String
              $toTypes: [String]
              $relationship_type: [String]
              $confidences: [Int]
              $search: String
              $filters: FilterGroup
              $dynamicFrom: FilterGroup
              $dynamicTo: FilterGroup
            ) {
              stixRelationshipsDistribution(field: $field, operation: $operation, startDate: $startDate, endDate: $endDate, dateAttribute: $dateAttribute, isTo: $isTo, limit: $limit, fromOrToId: $fromOrToId, elementWithTargetTypes: $elementWithTargetTypes, fromId: $fromId, fromRole: $fromRole, fromTypes: $fromTypes, toId: $toId, toRole: $toRole, toTypes: $toTypes, relationship_type: $relationship_type, confidences: $confidences, search: $search, filters: $filters, dynamicFrom: $dynamicFrom, dynamicTo: $dynamicTo) {
                value
                entity {
                  ... on StixObject {
                    __isStixObject: __typename
                    representative {
                      main
                    }
                  }
                  ... on StixRelationship {
                    __isStixRelationship: __typename
                    representative {
                      main
                    }
                  }
                  ... on Label {
                    color
                    id
                  }
                }
              }
            }
            
        """
    )

    date = (datetime.now() - timedelta(days=30 * 3)).astimezone().isoformat()
    variables = {
        "field": "internal_id",
        "operation": "count",
        "startDate": date,
        "endDate": None,
        "dateAttribute": "created_at",
        "isTo": True,
        "limit": 10,
        "fromOrToId": None,
        "elementWithTargetTypes": None,
        "fromId": None,
        "fromRole": None,
        "fromTypes": None,
        "toId": None,
        "toRole": None,
        "toTypes": None,
        "relationship_type": None,
        "confidences": None,
        "search": None,
        "filters": {
            "mode": "and",
            "filters": [{"key": "toTypes", "mode": "or", "values": ["Label"]}],
            "filterGroups": [],
        },
        "dynamicFrom": None,
        "dynamicTo": None,
    }

    result = await send(query=query, variables=variables)
    return {
        item["entity"]["representative"]["main"]: item["value"]
        for item in result["stixRelationshipsDistribution"]
    }.items()
