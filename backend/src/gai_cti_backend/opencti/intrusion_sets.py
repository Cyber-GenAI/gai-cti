from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from gql import gql

from .send_request import send


async def get_all_intrusion_sets(cursor: Optional[str] = None, count: int = 5000):
    query = gql(
        """
            query IntrusionSetsRefetchQuery(
              $count: Int = 25
              $cursor: ID
              $filters: FilterGroup
              $orderBy: IntrusionSetsOrdering = name
              $orderMode: OrderingMode = asc
              $search: String
            ) {
              ...IntrusionSetsCards_data_2wN0PW
            }
            
            fragment IntrusionSetCard_node on IntrusionSet {
              id
              name
              aliases
            }
            
            fragment IntrusionSetsCards_data_2wN0PW on Query {
              intrusionSets(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode, filters: $filters) {
                edges {
                  node {
                    id
                    name
                    ...IntrusionSetCard_node
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                  globalCount
                }
              }
            }
            
        """
    )

    variables = {
        "count": count,
        "filters": {
            "filterGroups": [],
            "filters": [
                {
                    "key": "entity_type",
                    "mode": "or",
                    "operator": "eq",
                    "values": ["Intrusion-Set"],
                }
            ],
            "mode": "and",
        },
        "orderBy": "name",
        "orderMode": "asc",
        "search": None,
    }

    if cursor:
        variables["cursor"] = cursor

    result = await send(query=query, variables=variables)
    result = {
        "intrusion_sets": [
            intrusion_sets["node"]
            for intrusion_sets in result["intrusionSets"]["edges"]
        ],
        "pageInfo": result["intrusionSets"]["pageInfo"],
    }
    return result


async def get_all_intrusion_sets_with_indicators(
    cursor: Optional[str] = None, count: int = 5000
):
    query = gql(
        """
            query IntrusionSetsWithIndicatorsQuery(
              $count: Int = 25
              $cursor: ID
              $filters: FilterGroup
              $orderBy: IntrusionSetsOrdering = name
              $orderMode: OrderingMode = asc
              $search: String
            ) {
              intrusionSets(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode, filters: $filters) {
                edges {
                  node {
                    id
                    name
                    aliases
                    stixCoreRelationships(
                      first: 5000
                      orderBy: created
                      orderMode: desc
                      relationship_type: "indicates"
                      fromTypes: ["Indicator"]
                    ) {
                      edges {
                        node {
                          from {
                            ... on Indicator {
                              id
                              name
                              pattern
                              x_opencti_score
                              x_opencti_main_observable_type
                              created_at
                              createdBy{
                                name
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                  globalCount
                }
              }
            }
        """
    )

    variables = {
        "count": count,
        "filters": {
            "filterGroups": [],
            "filters": [
                {
                    "key": "entity_type",
                    "mode": "or",
                    "operator": "eq",
                    "values": ["Intrusion-Set"],
                }
            ],
            "mode": "and",
        },
        "orderBy": "name",
        "orderMode": "asc",
        "search": None,
    }

    if cursor:
        variables["cursor"] = cursor

    result = await send(query=query, variables=variables)
    intrusions = [
        {
            "id": edge["node"]["id"],
            "name": edge["node"]["name"],
            "aliases": edge["node"]["aliases"] or [],
            "relational_iocs": [
                {
                    "id": rel_edge["node"]["from"]["id"],
                    "name": rel_edge["node"]["from"].get("name", "N/A"),
                    "indicator_pattern": rel_edge["node"]["from"].get("pattern", "N/A"),
                    "x_opencti_score": rel_edge["node"]["from"].get(
                        "x_opencti_score", -1
                    ),
                    "indicator_type": rel_edge["node"]["from"].get(
                        "x_opencti_main_observable_type", "N/A"
                    ),
                    "createdBy": (rel_edge["node"]["from"].get("createdBy") or {}).get(
                        "name", "N/A"
                    ),
                    "timestamp": rel_edge["node"]["from"].get(
                        "created_at", datetime.fromtimestamp(0)
                    ),
                }
                for rel_edge in edge["node"]["stixCoreRelationships"]["edges"]
            ],
        }
        for edge in result["intrusionSets"]["edges"]
    ]

    page_info = result["intrusionSets"]["pageInfo"]

    # Assuming all data fits in one request; if page_info["hasNextPage"], you may need to loop
    output = {"data": {"intrusions": intrusions}, "page_info": page_info}
    return output


async def get_indicators_of_an_intrusion_set_by_id(_id: str, cursor: Optional[str]):
    query = gql(
        """
            query EntityStixCoreRelationshipsIndicatorsEntitiesViewQuery(
              $search: String
              $count: Int!
              $cursor: ID
              $orderBy: IndicatorsOrdering
              $orderMode: OrderingMode
              $filters: FilterGroup
            ) {
              ...EntityStixCoreRelationshipsIndicatorsEntitiesView_data_2wN0PW
            }
            
            fragment EntityStixCoreRelationshipsIndicatorsEntitiesViewLine_node on Indicator {
              id
              name
            }
            
            fragment EntityStixCoreRelationshipsIndicatorsEntitiesView_data_2wN0PW on Query {
              indicators(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode, filters: $filters) {
                edges {
                  node {
                    id
                    ...EntityStixCoreRelationshipsIndicatorsEntitiesViewLine_node
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                  globalCount
                }
              }
            }
            
        """
    )

    variables = {
        "count": 5000,
        "orderMode": "desc",
        "orderBy": "created",
        "filters": {
            "mode": "and",
            "filters": [
                {
                    "key": "entity_type",
                    "values": ["Indicator"],
                    "mode": "or",
                    "operator": "eq",
                },
                {
                    "key": "regardingOf",
                    "values": [
                        {
                            "key": "id",
                            "values": [_id],
                        },
                        {"key": "relationship_type", "values": ["indicates"]},
                    ],
                },
            ],
            "filterGroups": [],
        },
    }

    result = await send(query=query, variables=variables)
    result = {
        "indicators": [
            indicator["node"] for indicator in result["indicators"]["edges"]
        ],
        "pageInfo": None,
    }
    return result


async def get_all_indicators_of_an_intrusion_set_by_id(_id: str) -> List[dict]:
    # TODO: what if pageInfo is not None ???
    return (await get_indicators_of_an_intrusion_set_by_id(_id, None))["indicators"]


async def get_adversary_info_by_id(_id: str):
    query = gql(
        """
            query IntrusionSetEditionContainerQuery(
              $id: String!
            ) {
              intrusionSet(id: $id) {
                ...IntrusionSetEditionContainer_intrusionSet
                id
              }
            }
            
            fragment IntrusionSetEditionContainer_intrusionSet on IntrusionSet {
              id
              ...IntrusionSetEditionOverview_intrusionSet
              ...IntrusionSetEditionDetails_intrusionSet
              editContext {
                name
                focusOn
              }
            }
            
            fragment IntrusionSetEditionDetails_intrusionSet on IntrusionSet {
              id
              first_seen
              last_seen
              resource_level
              primary_motivation
              secondary_motivations
              goals
              confidence
              entity_type
            }
            
            fragment IntrusionSetEditionOverview_intrusionSet on IntrusionSet {
              id
              name
              confidence
              entity_type
              description
              createdBy {
                __typename
                __isIdentity: __typename
                id
                name
                entity_type
              }
              objectMarking {
                id
                definition_type
                definition
                x_opencti_order
                x_opencti_color
              }
              status {
                id
                order
                template {
                  name
                  color
                  id
                }
              }
              workflowEnabled
            }
            
        """
    )

    variables = {"id": _id}

    result = await send(query=query, variables=variables)
    result = result["intrusionSet"]
    result["description"] = (
        "No Information is available."
        if not result["description"]
        else result["description"]
    )

    return result


async def get_intrusion_id_by_stix_id(stix_id: str):
    query = gql(
        """
        query GetInternalId($stixId: String!) {
  stixCoreObject(id: $stixId) {
    id
  }
}
        """
    )
    variables = {"stixId": stix_id}

    result = await send(query=query, variables=variables)

    return result["stixCoreObject"]["id"]


async def get_intrusion_sets_with_malwares_bulk(cursor: Optional[str]):
    query = gql(
        """
          query IntrusionSetUsesMalware($cursor: ID) {
            intrusionSets(after: $cursor, first: 5000) {
              pageInfo {
                endCursor
                hasNextPage
                globalCount
              }
              edges {
                node {
                  id
                  name
                  stixCoreRelationships(
                    toTypes: "Malware"
                    relationship_type: "uses"
                    first: 100000
                  ) {
                    edges {
                      node {
                        to {
                          ... on Malware {
                            id
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        """
    )

    variables = {"cursor": cursor}

    result = await send(query=query, variables=variables)
    page_info = result["intrusionSets"]["pageInfo"]
    result = result["intrusionSets"]["edges"]

    return result, page_info
