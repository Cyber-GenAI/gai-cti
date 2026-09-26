from datetime import datetime, timedelta
from typing import Dict, List, Literal, Tuple

from gql import gql

from ..models.utils import Day, ReliabilityLevel
from .send_request import send


async def get_all_external_connectors():
    # This is the correct query to get connector status, including the 'active' field
    query = gql(
        """
        query ConnectorsStatusQuery {
              connectors {
                id
                name
                active
                connector_type
                connector_queue_details{
                  messages_number
                  messages_size
                }
                connector_info{
                  last_run_datetime
                  next_run_datetime
                }
              }
        }
    """
    )

    # We don't need any variables for this specific query
    variables = {}

    # Send the query and get the raw result
    raw_result = await send(query=query, variables=variables)

    # Filter for 'EXTERNAL_IMPORT' connectors and return their details
    # This also handles the case where the 'AlienVault' connector's name is "AlienVault"
    # and not "AV EMPTY REPORT" which was a previous check.
    external_import_connectors = [
        connector
        for connector in raw_result["connectors"]
        if connector["connector_type"] == "EXTERNAL_IMPORT"
    ]

    return external_import_connectors


async def get_all_external_connectors_and_feeds():
    query = gql(
        """
        query GetConnectorsAndOrganizations(
          $search: String
          $count: Int!
          $cursor: ID
          $orderBy: OrganizationsOrdering
          $orderMode: OrderingMode
          $filters: FilterGroup
        ) {
          connectors {
            id
            name
            active
            connector_type
          }
          organizations(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode, filters: $filters) {
            edges {
              node {
                id
                name
                x_opencti_reliability
                confidence
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

    variables = {"count": 10_000, "orderMode": "asc", "orderBy": "name"}

    raw_result = await send(query=query, variables=variables)

    external_import_connectors = [
        connector
        for connector in raw_result["connectors"]
        if connector["connector_type"] == "EXTERNAL_IMPORT"
    ]

    feeds_data = [
        edge["node"]
        for edge in raw_result["organizations"]["edges"]
        if edge["node"]["name"] != "AV EMPTY REPORT"
    ]

    return external_import_connectors, feeds_data


async def get_all_organizations():
    query = gql(
        """
            query OrganizationsLinesPaginationQuery(
              $search: String
              $count: Int!
              $cursor: ID
              $orderBy: OrganizationsOrdering
              $orderMode: OrderingMode
              $filters: FilterGroup
            ) {
              ...OrganizationsLines_data_2wN0PW
            }

            fragment OrganizationLine_node on Organization {
              id
              name
              x_opencti_reliability
              confidence
            }

            fragment OrganizationsLines_data_2wN0PW on Query {
              organizations(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode, filters: $filters) {
                edges {
                  node {
                    id
                    name
                    ...OrganizationLine_node
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

    variables = {"count": 120, "orderMode": "asc", "orderBy": "name"}
    raw_result = await send(query=query, variables=variables)

    feeds_data = [
        connector["node"]
        for connector in raw_result["organizations"]["edges"]
        if connector["node"]["name"] != "AV EMPTY REPORT"
    ]

    return feeds_data


async def get_organization_by_id(_id: str):
    query = gql(
        """
          query OrganizationEditionContainerQuery(
              $id: String!
            ) {
              organization(id: $id) {
                ...OrganizationEditionContainer_organization
                id
              }
            }
            
            fragment OrganizationEditionContainer_organization on Organization {
              id
              ...OrganizationEditionOverview_organization
              editContext {
                name
                focusOn
              }
            }
            
            fragment OrganizationEditionOverview_organization on Organization {
              id
              name
              description
              confidence
              entity_type
              contact_information
              x_opencti_organization_type
              x_opencti_reliability
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

    raw_result = await send(query=query, variables=variables)

    return raw_result["organization"]


async def update_feed_conf(_id: str, status: Literal["active", "inactive"]):
    print(
        f"Feed source with 'id': {_id} is {'activated' if status == "active" else 'deactivated'}"
    )
    # query = gql(
    #     """
    #     mutation ChangeFeedConf($id: String!, $status: Boolean!) {
    #         changeFeedConf(id: $id, status: $status) {
    #             id
    #             active
    #         }
    #     }
    #     """
    # )

    # variables = {"id": _id, "status": status}

    # raw_result = await send(query=query, variables=variables)

    # return raw_result["changeFeedConf"]


async def get_all_feeds_organization_id() -> Dict[str, str]:
    """return type is Dict[Name, ID]"""
    query = gql(
        """
        query Organizations {
          organizations {
            edges {
              node {
                name
                id
              }
            }
          }
        }
        """
    )

    result = await send(query=query, variables={})

    return {
        item["node"]["name"]: item["node"]["id"]
        for item in result["organizations"]["edges"]
        if item["node"]["name"] != "AV EMPTY REPORT"
    }


async def get_indicators_timeseries_for_a_feed(id: str) -> Dict[Day, int]:

    query = gql(
        """
        query IndicatorsCountPerDay($id: Any!, $start: DateTime!, $end: DateTime!) {
            indicatorsTimeSeries(
                field: "created_at"
                operation: count
                interval: "day"
                startDate: $start
                endDate: $end
                filters: {mode: or, filters: [{key: "createdBy", values: [$id]}], filterGroups: []}
            ) {
                date
                value
            }
        }
        """
    )

    end = datetime.now().astimezone()
    start = end - timedelta(days=365 * 5)
    variables = {
        "id": id,
        "start": start.isoformat(),
        "end": end.isoformat(),
    }

    result = await send(query=query, variables=variables)

    # item["date"][:10] means yyyy-mm-dd
    return {item["date"][:10]: item["value"] for item in result["indicatorsTimeSeries"]}


async def change_feed_confidence_level_by_id(id: str, conf_level: int):
    query = gql(
        """
            mutation OrganizationEditionOverviewFieldPatchMutation(
              $id: ID!
              $input: [EditInput]!
              $commitMessage: String
              $references: [String]
            ) {
              organizationFieldPatch(id: $id, input: $input, commitMessage: $commitMessage, references: $references) {
                ...OrganizationEditionOverview_organization
                ...Organization_organization
                id
              }
            }
            
            fragment OrganizationDetails_organization on Organization {
              id
              description
              contact_information
              x_opencti_reliability
              x_opencti_organization_type
              objectLabel {
                id
                value
                color
              }
            }
            
            fragment OrganizationEditionOverview_organization on Organization {
              id
              name
              description
              confidence
              entity_type
              contact_information
              x_opencti_organization_type
              x_opencti_reliability
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
            
            fragment Organization_organization on Organization {
              id
              standard_id
              entity_type
              x_opencti_stix_ids
              spec_version
              revoked
              x_opencti_reliability
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
              x_opencti_aliases
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
              ...OrganizationDetails_organization
            }
            
        """
    )

    variables = {
        "id": id,
        "input": {"key": "confidence", "value": conf_level},
        "commitMessage": None,
        "references": None,
    }

    result = await send(query=query, variables=variables)


async def change_feed_reliability_by_id(id: str, reliability: ReliabilityLevel):
    query = gql(
        """
            mutation OrganizationEditionOverviewFieldPatchMutation(
              $id: ID!
              $input: [EditInput]!
              $commitMessage: String
              $references: [String]
            ) {
              organizationFieldPatch(id: $id, input: $input, commitMessage: $commitMessage, references: $references) {
                ...OrganizationEditionOverview_organization
                ...Organization_organization
                id
              }
            }
            
            fragment OrganizationDetails_organization on Organization {
              id
              description
              contact_information
              x_opencti_reliability
              x_opencti_organization_type
              objectLabel {
                id
                value
                color
              }
            }
            
            fragment OrganizationEditionOverview_organization on Organization {
              id
              name
              description
              confidence
              entity_type
              contact_information
              x_opencti_organization_type
              x_opencti_reliability
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
            
            fragment Organization_organization on Organization {
              id
              standard_id
              entity_type
              x_opencti_stix_ids
              spec_version
              revoked
              x_opencti_reliability
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
              x_opencti_aliases
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
              ...OrganizationDetails_organization
            }
            
        """
    )

    variables = {
        "id": id,
        "input": {"key": "x_opencti_reliability", "value": reliability},
        "commitMessage": None,
        "references": None,
    }

    result = await send(query=query, variables=variables)


async def get_all_deactivated_feeds():
    query = gql(
        """
            query ConnectorsStatusQuery(
              $enableComposerFeatureFlag: Boolean!
            ) {
              ...ConnectorsStatus_data
            }
            
            fragment ConnectorsStatus_data on Query {
              connectorManagers @include(if: $enableComposerFeatureFlag) {
                id
                name
                active
                last_sync_execution
              }
            
            catalogs @include(if: $enableComposerFeatureFlag) {
                id
                name
                description
                contracts
              }
              connectors {
                id
                name
                active
                connector_type
                built_in
              }
            }
            
        """
    )

    variables = {"enableComposerFeatureFlag": False}

    result = await send(query=query, variables=variables)
    connectors = [
        {"name": connector["name"], "id": connector["id"]}
        for connector in result["connectors"]
        if (connector["connector_type"] == "EXTERNAL_IMPORT")
        and (connector["built_in"] == False)
        and (connector["active"] == False)
    ]
    return connectors


async def delete_inactive_feed(id: str):
    query = gql(
        """
            mutation ConnectorDeletionMutation(
              $id: ID!
            ) {
              deleteConnector(id: $id)
            }
            
        """
    )

    variables = {"id": id}
    result = await send(query=query, variables=variables)
