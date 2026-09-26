from datetime import datetime, timedelta

from gql import gql

from .send_request import send


async def number_of_indicators() -> int:
    query = gql(
        """
    query IndicatorCount {
      indicators {
        pageInfo {
          globalCount
        }
      }
    }
    """
    )

    result = await send(query=query, variables={})
    return result["indicators"]["pageInfo"]["globalCount"]


# TODO: Add types


async def number_of_malware():
    query = gql(
        """
            
            query MalwareCount {
                stixDomainObjects(types: ["Malware"], first: 0) {
                    pageInfo {
                     globalCount
                    }
                }
            }    
        """
    )

    result = await send(query=query, variables={})

    return result["stixDomainObjects"]["pageInfo"]["globalCount"]


# TODO: Add types


async def get_indicator_count_by_type(indicator_type: str):
    """Count indicators of specific type using global count"""
    query = gql(
        """
        query IndicatorCount($filters: FilterGroup) {
          indicators(filters: $filters) {
            pageInfo {
              globalCount
            }
          }
        }
        """
    )

    variables = {
        "filters": {
            "mode": "and",
            "filters": [
                {
                    "key": "x_opencti_main_observable_type",
                    "values": [indicator_type],
                    "operator": "eq",
                    "mode": "or",
                }
            ],
            "filterGroups": [],
        },
    }

    result = await send(query=query, variables=variables)

    return result["indicators"]["pageInfo"]["globalCount"]


async def number_of_last_48h_indicators() -> int:

    dt = datetime.now() - timedelta(hours=48)
    twenty_four_hours_ago = dt.isoformat(timespec="milliseconds").replace("+00:00", "Z")
    print(twenty_four_hours_ago)
    # Define the GraphQL query with a variable for the timestamp
    query = gql(
        """
            query EntitiesStixDomainObjectsLinesPaginationQuery(
              $types: [String]
              $search: String
              $count: Int!
              $cursor: ID
              $orderBy: StixDomainObjectsOrdering
              $orderMode: OrderingMode
              $filters: FilterGroup
            ) {
              ...EntitiesStixDomainObjectsLines_data_4GmerJ
            }
            
            fragment EntitiesStixDomainObjectLine_node on StixDomainObject {
              __isStixDomainObject: __typename
              id
              entity_type
              created_at
              draftVersion {
                draft_id
                draft_operation
              }
              ... on AttackPattern {
                name
                description
                aliases
              }
              ... on Campaign {
                name
                description
                aliases
              }
              ... on Note {
                attribute_abstract
                content
              }
              ... on ObservedData {
                name
                first_observed
                last_observed
              }
              ... on Opinion {
                opinion
                explanation
              }
              ... on Report {
                name
                description
              }
              ... on Grouping {
                name
                description
              }
              ... on CourseOfAction {
                name
                description
                x_opencti_aliases
              }
              ... on DataComponent {
                name
                aliases
                description
              }
              ... on DataSource {
                name
                aliases
                description
              }
              ... on Case {
                __isCase: __typename
                name
                description
              }
              ... on Task {
                name
                description
              }
              ... on Individual {
                name
                description
                x_opencti_aliases
              }
              ... on Organization {
                name
                description
                x_opencti_aliases
              }
              ... on Sector {
                name
                description
                x_opencti_aliases
              }
              ... on System {
                name
                description
                x_opencti_aliases
              }
              ... on Indicator {
                name
                description
              }
              ... on Infrastructure {
                name
                description
              }
              ... on IntrusionSet {
                name
                aliases
                description
              }
              ... on Position {
                name
                description
                x_opencti_aliases
              }
              ... on City {
                name
                description
                x_opencti_aliases
              }
              ... on AdministrativeArea {
                name
                description
                x_opencti_aliases
              }
              ... on Country {
                name
                description
                x_opencti_aliases
              }
              ... on Region {
                name
                description
                x_opencti_aliases
              }
              ... on Malware {
                name
                aliases
                description
              }
              ... on MalwareAnalysis {
                result_name
              }
              ... on ThreatActor {
                __isThreatActor: __typename
                name
                aliases
                description
              }
              ... on Tool {
                name
                aliases
                description
              }
              ... on Vulnerability {
                name
                description
              }
              ... on Incident {
                name
                aliases
                description
              }
              ... on Event {
                name
                description
                aliases
              }
              ... on Channel {
                name
                description
                aliases
              }
              ... on Narrative {
                name
                description
                aliases
              }
              ... on Language {
                name
                aliases
              }
              createdBy {
                __typename
                __isIdentity: __typename
                name
                id
              }
              objectMarking {
                id
                definition
                x_opencti_order
                x_opencti_color
              }
              objectLabel {
                id
                value
                color
              }
              creators {
                id
                name
              }
            }
            
            fragment EntitiesStixDomainObjectsLines_data_4GmerJ on Query {
              stixDomainObjects(types: $types, search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode, filters: $filters) {
                edges {
                  node {
                    __typename
                    id
                    entity_type
                    created_at
                    draftVersion {
                      draft_id
                      draft_operation
                    }
                    createdBy {
                      __typename
                      __isIdentity: __typename
                      name
                      id
                    }
                    objectMarking {
                      id
                      definition
                      x_opencti_order
                      x_opencti_color
                    }
                    ...EntitiesStixDomainObjectLine_node
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
        "count": 25,
        "orderMode": "desc",
        "orderBy": "created_at",
        "filters": {
            "mode": "and",
            "filters": [
                {
                    "key": "entity_type",
                    "values": ["Stix-Domain-Object"],
                    "operator": "eq",
                    "mode": "or",
                }
            ],
            "filterGroups": [
                {
                    "mode": "and",
                    "filters": [
                        {
                            "key": "entity_type",
                            "values": ["Indicator"],
                            "operator": "eq",
                            "mode": "or",
                        },
                        {
                            "key": "created_at",
                            "values": [twenty_four_hours_ago],
                            "operator": "gte",
                            "mode": "or",
                        },
                    ],
                    "filterGroups": [],
                }
            ],
        },
    }

    result = await send(query=query, variables=variables)
    return result["stixDomainObjects"]["pageInfo"]["globalCount"]
