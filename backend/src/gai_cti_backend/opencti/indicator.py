from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from gql import gql

from ..models.utils import Timestamp
from .send_request import send


async def get_all_indicator_types():
    query = gql(
        """
            query useSearchEntitiesSchemaSCOSearchQuery {
              schemaSCOs: subTypes(type: "Stix-Cyber-Observable") {
                edges {
                  node {
                    id
                    label
                  }
                }
              }
            }
            
        """
    )

    variables = {}

    result = await send(query=query, variables=variables)
    result = [node["node"]["label"] for node in result["schemaSCOs"]["edges"]]
    return result


async def get_indicators_with_risk_and_conf_bulk(cursor: Optional[str]):
    query = gql(
        """
        query IndicatorsWithRiskAndConf($cursor: ID) {
          indicators(first: 5000, after: $cursor) {
            pageInfo {
              endCursor
              hasNextPage
              globalCount
            }
            edges {
              node {
                created_at
                x_opencti_score
                confidence
              }
            }
          }
        }
        """
    )

    variables = {"cursor": cursor}

    result = await send(query=query, variables=variables)
    page_info = result["indicators"]["pageInfo"]
    result = result["indicators"]["edges"]

    return result, page_info


async def get_indicators_with_tags_bulk(cursor: Optional[str]):
    query = gql(
        """
          query IndicatorsWithTags($cursor: ID) {
            indicators(
              first: 5000
              after: $cursor
              ) {
              pageInfo {
                endCursor
                hasNextPage
                globalCount
              }
              edges {
                node {
                  id
                  objectLabel {
                    representative {
                      main
                      secondary
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
    page_info = result["indicators"]["pageInfo"]
    result = result["indicators"]["edges"]

    return result, page_info


async def get_indicator_by_id(_id: str):
    query = gql(
        """
            query RootIndicatorQuery(
              $id: String!
            ) {
              indicator(id: $id) {
                id
                standard_id
                entity_type
                name
                pattern
                ...Indicator_indicator
                ...IndicatorDetails_indicator
                ...FileImportViewer_entity
                ...FileExportViewer_entity
                ...FileExternalReferencesViewer_entity
                ...WorkbenchFileViewer_entity
                ...StixCoreObjectContent_stixCoreObject
              }
              connectorsForImport {
                ...FileManager_connectorsImport
                id
              }
              connectorsForExport {
                ...FileManager_connectorsExport
                id
              }
            }
            
            fragment FileExportViewer_entity on StixCoreObject {
              __isStixCoreObject: __typename
              id
              exportFiles(first: 500) {
                edges {
                  node {
                    id
                    ...FileLine_file
                    __typename
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                }
              }
            }
            
            fragment FileExternalReferencesViewer_entity on StixCoreObject {
              __isStixCoreObject: __typename
              id
              entity_type
              externalReferences {
                edges {
                  node {
                    source_name
                    url
                    description
                    importFiles(first: 500) {
                      edges {
                        node {
                          id
                          lastModified
                          ...FileLine_file
                          metaData {
                            mimetype
                          }
                          __typename
                        }
                        cursor
                      }
                      pageInfo {
                        endCursor
                        hasNextPage
                      }
                    }
                    id
                  }
                }
              }
            }
            
            fragment FileImportViewer_entity on StixCoreObject {
              __isStixCoreObject: __typename
              id
              entity_type
              importFiles(first: 500) {
                edges {
                  node {
                    id
                    ...FileLine_file
                    metaData {
                      mimetype
                    }
                    __typename
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                }
              }
            }
            
            fragment FileLine_file on File {
              id
              name
              uploadStatus
              lastModified
              lastModifiedSinceMin
              metaData {
                mimetype
                list_filters
                external_reference_id
                file_markings
                messages {
                  timestamp
                  message
                }
                errors {
                  timestamp
                  message
                }
                labels
              }
              ...FileWork_file
            }
            
            fragment FileManager_connectorsExport on Connector {
              id
              name
              active
              connector_scope
              updated_at
            }
            
            fragment FileManager_connectorsImport on Connector {
              id
              name
              active
              connector_scope
              updated_at
              configurations {
                id
                name
                configuration
              }
            }
            
            fragment FileWork_file on File {
              id
              works {
                id
                connector {
                  name
                  id
                }
                user {
                  name
                  id
                }
                received_time
                tracking {
                  import_expected_number
                  import_processed_number
                }
                messages {
                  timestamp
                  message
                }
                errors {
                  timestamp
                  message
                }
                status
                timestamp
              }
            }
            
            fragment ImportWorkbenchesContentFileLine_file on File {
              id
              entity_type
              name
              uploadStatus
              lastModified
              lastModifiedSinceMin
              metaData {
                mimetype
                list_filters
                labels
                labels_text
                messages {
                  timestamp
                  message
                }
                errors {
                  timestamp
                  message
                }
                creator {
                  name
                  id
                }
              }
            }
            
            fragment IndicatorDetails_indicator on Indicator {
              id
              description
              pattern
              valid_from
              valid_until
              x_opencti_score
              x_opencti_detection
              x_mitre_platforms
              indicator_types
              decay_base_score
              decay_base_score_date
              decay_history {
                score
                updated_at
              }
              decay_applied_rule {
                decay_rule_id
                decay_lifetime
                decay_pound
                decay_points
                decay_revoke_score
              }
              decayLiveDetails {
                live_score
                live_points {
                  score
                  updated_at
                }
              }
              decayChartData {
                live_score_serie {
                  updated_at
                  score
                }
              }
              objectLabel {
                id
                value
                color
              }
              killChainPhases {
                id
                entity_type
                kill_chain_name
                phase_name
                x_opencti_order
              }
              ...IndicatorObservables_indicator
            }
            
            fragment IndicatorObservables_indicator on Indicator {
              id
              name
              parent_types
              entity_type
              observables(first: 100) {
                edges {
                  node {
                    __typename
                    id
                    entity_type
                    parent_types
                    observable_value
                    created_at
                    updated_at
                  }
                }
                pageInfo {
                  globalCount
                }
              }
            }
            
            fragment Indicator_indicator on Indicator {
              id
              standard_id
              entity_type
              x_opencti_stix_ids
              spec_version
              revoked
              confidence
              created
              modified
              created_at
              updated_at
              createdBy {
                __typename
                __isIdentity: __typename
                id
                name
                entity_type
                x_opencti_reliability
              }
              creators {
                id
                name
              }
              objectMarking {
                id
                definition_type
                definition
                x_opencti_order
                x_opencti_color
              }
              objectLabel {
                id
                value
                color
              }
              name
              pattern_type
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
              ...IndicatorDetails_indicator
            }
            
            fragment StixCoreObjectContent_stixCoreObject on StixCoreObject {
              __isStixCoreObject: __typename
              id
              entity_type
              objectMarking {
                id
                definition_type
                definition
                x_opencti_order
                x_opencti_color
              }
              ... on Report {
                name
                description
                contentField: content
                content_mapping
                editContext {
                  name
                  focusOn
                }
              }
              ... on Case {
                __isCase: __typename
                name
                description
                contentField: content
                content_mapping
                editContext {
                  name
                  focusOn
                }
              }
              ... on Grouping {
                name
                description
                contentField: content
                content_mapping
                editContext {
                  name
                  focusOn
                }
              }
              importFiles(first: 500) {
                edges {
                  node {
                    id
                    name
                    uploadStatus
                    lastModified
                    lastModifiedSinceMin
                    metaData {
                      mimetype
                      list_filters
                      file_markings
                      messages {
                        timestamp
                        message
                      }
                      errors {
                        timestamp
                        message
                      }
                    }
                    __typename
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                }
              }
              exportFiles(first: 500) {
                edges {
                  node {
                    id
                    name
                    uploadStatus
                    lastModified
                    lastModifiedSinceMin
                    metaData {
                      mimetype
                      file_markings
                    }
                    ...FileLine_file
                    __typename
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                }
              }
              ... on Container {
                __isContainer: __typename
                filesFromTemplate(first: 500) {
                  edges {
                    node {
                      id
                      name
                      uploadStatus
                      lastModified
                      lastModifiedSinceMin
                      objectMarking {
                        id
                        representative {
                          main
                        }
                      }
                      metaData {
                        mimetype
                        list_filters
                        file_markings
                        messages {
                          timestamp
                          message
                        }
                        errors {
                          timestamp
                          message
                        }
                      }
                      __typename
                    }
                    cursor
                  }
                  pageInfo {
                    endCursor
                    hasNextPage
                  }
                }
              }
              externalReferences {
                edges {
                  node {
                    source_name
                    url
                    description
                    importFiles(first: 500) {
                      edges {
                        node {
                          id
                          name
                          uploadStatus
                          lastModified
                          lastModifiedSinceMin
                          metaData {
                            mimetype
                            list_filters
                            external_reference_id
                            messages {
                              timestamp
                              message
                            }
                            errors {
                              timestamp
                              message
                            }
                          }
                        }
                      }
                    }
                    id
                  }
                }
              }
            }
            
            fragment WorkbenchFileViewer_entity on StixCoreObject {
              __isStixCoreObject: __typename
              id
              entity_type
              pendingFiles(first: 500) {
                edges {
                  node {
                    id
                    ...ImportWorkbenchesContentFileLine_file
                    metaData {
                      mimetype
                    }
                    __typename
                  }
                  cursor
                }
                pageInfo {
                  endCursor
                  hasNextPage
                }
              }
            }
            
        """
    )

    variables = {"id": _id}

    result = await send(query=query, variables=variables)

    data = dict()
    data["id"] = result["indicator"]["id"]
    data["name"] = result["indicator"]["name"]
    data["indicator_pattern"] = result["indicator"]["pattern"]
    data["confidence_level"] = result["indicator"]["confidence"]
    data["is_revoked"] = result["indicator"]["revoked"]
    data["created_at"] = result["indicator"]["created_at"]
    data["x_opencti_score"] = result["indicator"]["x_opencti_score"]
    data["indicator_types"] = result["indicator"]["indicator_types"]
    data["valid_until"] = result["indicator"]["valid_until"]
    data["objectLabel"] = [
        label["value"] for label in result["indicator"]["objectLabel"]
    ]
    data["platforms"] = result["indicator"]["x_mitre_platforms"]
    data["description"] = result["indicator"]["description"]
    data["kill_chain_phases"] = result["indicator"]["killChainPhases"]
    data["reliability_of_author"] = result["indicator"]["createdBy"][
        "x_opencti_reliability"
    ]
    data["author"] = result["indicator"]["createdBy"]["name"]
    data["external_references"] = [
        {
            "source_name": reference["node"]["source_name"],
            "url": reference["node"]["url"],
        }
        for reference in result["indicator"]["externalReferences"]["edges"]
    ]

    return data


async def get_indicators_by_id_bulk(_ids: List[str]):
    query = gql(
        """
        query StixCoreObjectsQuery($filters: FilterGroup!) {
          stixCoreObjects(filters: $filters) {
            edges {
              node {
                ... on Indicator {
                  id
                  standard_id
                  entity_type
                  name
                  pattern
                  ...Indicator_indicator
                }
              }
            }
          }
        }
        
        fragment Indicator_indicator on Indicator {
          # Include all fields as in your single indicator query
          id
          standard_id
          entity_type
          x_opencti_stix_ids
          spec_version
          revoked
          confidence
          created
          modified
          created_at
          updated_at
          createdBy {
            __typename
            __isIdentity: __typename
            id
            name
            entity_type
            x_opencti_reliability
          }
          creators {
            id
            name
          }
          objectMarking {
            id
            definition_type
            definition
            x_opencti_order
            x_opencti_color
          }
          objectLabel {
            id
            value
            color
          }
          name
          pattern_type
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

    filters = {
        "mode": "and",
        "filters": [
            {"key": "entity_type", "values": ["Indicator"], "operator": "eq"},
            {"key": "ids", "values": _ids, "operator": "eq", "mode": "or"},
        ],
        "filterGroups": [],
    }
    variables = {"filters": filters}
    result = await send(query=query, variables=variables)

    data = [
        {
            "id": node["node"]["id"],
            "name": node["node"]["name"],
            "indicator_pattern": node["node"]["pattern"],
        }
        for node in result["stixCoreObjects"]["edges"]
    ]
    return data


async def get_indicators_with_filters(
    filters: List[Dict[str, Any]] = [],
    limit: int = 25,
    cursor: Optional[str] = None,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    # TODO: remove extra parts from the query like ``... on AttackPattern`` or ``... on Campaign``
    if cursor == "":
        cursor = None

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
                indicator_types
                x_opencti_main_observable_type
                x_opencti_score
              }
              ... on Malware {
                name
                aliases
                description
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
                    confidence
                    draftVersion {
                      draft_id
                      draft_operation
                    }
                    createdBy {
                      __typename
                      __isIdentity: __typename
                      name
                      id
                      x_opencti_reliability
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
        "count": limit,
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
                        }
                    ],
                    # Wrap user filters inside a filter group so each group has the "filters" key:
                    "filterGroups": [
                        {
                            "mode": "and",
                            "filters": filters,
                            "filterGroups": [],  # <-- user filters are now inside this group's "filters" key
                        }
                    ],
                }
            ],
        },
    }

    if cursor:
        variables["cursor"] = cursor

    result = await send(query=query, variables=variables)
    page_info = result["stixDomainObjects"]["pageInfo"]
    result = result["stixDomainObjects"]["edges"]

    return result, page_info


async def get_indicator_by_id_for_llm(_id: str) -> str:
    # TODO: add more information to results
    # help: http://gai-cti.amnafzar.ir/open-cti/public/graphql

    query = gql(
        """
          query Indicator4LLM($id: String!) {
            indicator(id: $id) {
              name
              description
            }
          }
        """
    )

    variables = {"id": "8a6911c2-7708-43e2-87ef-25ba64564373"}

    result = await send(query=query, variables=variables)
    #   result["indicator"] -->> {
    #   "data": {
    #     "indicator": {
    #       "name": "111.198.222.34",
    #       "description": "Agressive IP known malicious on AbuseIPDB - countryCode: CN - abuseConfidenceScore: 100 - lastReportedAt: 2025-08-26T08:39:56+00:00"
    #     }
    #   }
    # }

    return str(result)


async def get_indicator_id_by_stix_id(stix_id: str):
    query = gql(
        """
        query GetInternalId($id: String!) {
  indicator(id: $id) {
    id
  }
}
        """
    )
    variables = {"id": stix_id}

    result = await send(query=query, variables=variables)

    return result.get("indicator", {}).get("id")


async def change_indicator_confidence_level_by_id(_id: str, conf_level: int):
    query = gql(
        """
            mutation IndicatorEditionOverviewFieldPatchMutation(
              $id: ID!
              $input: [EditInput!]!
              $commitMessage: String
              $references: [String]
            ) {
              indicatorFieldPatch(id: $id, input: $input, commitMessage: $commitMessage, references: $references) {
                ...IndicatorEditionOverview_indicator
                ...Indicator_indicator
                id
              }
            }
            
            fragment IndicatorDetails_indicator on Indicator {
              id
              description
              pattern
              valid_from
              valid_until
              x_opencti_score
              x_opencti_detection
              x_mitre_platforms
              indicator_types
              decay_base_score
              decay_base_score_date
              decay_history {
                score
                updated_at
              }
              decay_applied_rule {
                decay_rule_id
                decay_lifetime
                decay_pound
                decay_points
                decay_revoke_score
              }
              decayLiveDetails {
                live_score
                live_points {
                  score
                  updated_at
                }
              }
              decayChartData {
                live_score_serie {
                  updated_at
                  score
                }
              }
              objectLabel {
                id
                value
                color
              }
              killChainPhases {
                id
                entity_type
                kill_chain_name
                phase_name
                x_opencti_order
              }
              ...IndicatorObservables_indicator
            }
            
            fragment IndicatorEditionOverview_indicator on Indicator {
              id
              name
              confidence
              entity_type
              description
              pattern
              valid_from
              valid_until
              revoked
              x_opencti_score
              x_opencti_detection
              x_mitre_platforms
              indicator_types
              createdBy {
                __typename
                __isIdentity: __typename
                id
                name
                entity_type
              }
              killChainPhases {
                id
                entity_type
                kill_chain_name
                phase_name
                x_opencti_order
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
            
            fragment IndicatorObservables_indicator on Indicator {
              id
              name
              parent_types
              entity_type
              observables(first: 100) {
                edges {
                  node {
                    __typename
                    id
                    entity_type
                    parent_types
                    observable_value
                    created_at
                    updated_at
                  }
                }
                pageInfo {
                  globalCount
                }
              }
            }
            
            fragment Indicator_indicator on Indicator {
              id
              standard_id
              entity_type
              x_opencti_stix_ids
              spec_version
              revoked
              confidence
              created
              modified
              created_at
              updated_at
              createdBy {
                __typename
                __isIdentity: __typename
                id
                name
                entity_type
                x_opencti_reliability
              }
              creators {
                id
                name
              }
              objectMarking {
                id
                definition_type
                definition
                x_opencti_order
                x_opencti_color
              }
              objectLabel {
                id
                value
                color
              }
              name
              pattern_type
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
              ...IndicatorDetails_indicator
            }
            
        """
    )

    variables = {
        "id": _id,
        "input": {"key": "confidence", "value": conf_level},
        "commitMessage": None,
        "references": None,
    }

    result = await send(query=query, variables=variables)


async def get_timeseries_for_indicator_count() -> Dict[Timestamp, int]:

    query = gql(
        """
        query IndicatorsCountPerDay($start: DateTime!, $end: DateTime!) {
            indicatorsTimeSeries(
                field: "created_at"
                operation: count
                interval: "day"
                startDate: $start
                endDate: $end
            ) {
                date
                value
            }
        }
        """
    )

    end = datetime.now().astimezone()
    start = end - timedelta(days=30)
    variables = {
        "start": start.isoformat(),
        "end": end.isoformat(),
    }

    result = await send(query=query, variables=variables)

    return {
        datetime.fromisoformat(item["date"]).timestamp() * 1000: item["value"]
        for item in result["indicatorsTimeSeries"]
    }
