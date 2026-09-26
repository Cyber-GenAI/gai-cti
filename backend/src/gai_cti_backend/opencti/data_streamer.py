from typing import List

from gql import gql

from .send_request import send


async def create_data_streamer_for_indicators(streamer_name: str) -> str:
    query = gql(
        """
            mutation StreamCollectionCreationMutation(
              $input: StreamCollectionAddInput!
            ) {
              streamCollectionAdd(input: $input) {
                ...StreamLine_node
                id
              }
            }
            
            fragment StreamCollectionEdition_streamCollection on StreamCollection {
              id
              name
              description
              filters
              stream_live
              stream_public
              authorized_members {
                id
                name
              }
            }

            fragment StreamLine_node on StreamCollection {
              id
              name
              description
              filters
              stream_public
              stream_live
              ...StreamCollectionEdition_streamCollection
            }
            
        """
    )

    variables = {
        "input": {
            "name": streamer_name,
            "description": "",
            "stream_public": True,
            "authorized_members": [],
            "filters": '{"mode":"and","filters":[{"key":["entity_type"],"values":["Indicator"],"operator":"eq","mode":"or"}],"filterGroups":[]}',
        }
    }

    result = await send(query=query, variables=variables)

    streamer_id = result["streamCollectionAdd"]["id"]
    # Activate the streamer
    await activate_data_streamer(streamer_id)

    return streamer_id


async def activate_data_streamer(streamer_id: str) -> None:
    query = gql(
        """
            mutation StreamCollectionEditionFieldPatchMutation(
              $id: ID!
              $input: [EditInput]!
            ) {
              streamCollectionEdit(id: $id) {
                fieldPatch(input: $input) {
                  ...StreamCollectionEdition_streamCollection
                  id
                }
              }
            }
            
            fragment StreamCollectionEdition_streamCollection on StreamCollection {
              id
              name
              description
              filters
              stream_live
              stream_public
              authorized_members {
                id
                name
              }
            }
            
        """
    )

    variables = {
        "id": streamer_id,
        "input": [{"key": "stream_live", "value": ["true"]}],
    }

    result = await send(query=query, variables=variables)
    return result


async def get_all_data_streamers() -> List[dict]:
    query = gql(
        """
            query StreamLinesPaginationQuery(
              $search: String
              $count: Int!
              $cursor: ID
              $orderBy: StreamCollectionOrdering
              $orderMode: OrderingMode
            ) {
              ...StreamLines_data_2ltyuX
            }
            
            fragment StreamCollectionEdition_streamCollection on StreamCollection {
              id
              name
              description
              filters
              stream_live
              stream_public
              authorized_members {
                id
                name
              }
            }
            
            fragment StreamLine_node on StreamCollection {
              id
              name
              description
              filters
              stream_public
              stream_live
              ...StreamCollectionEdition_streamCollection
            }
            
            fragment StreamLines_data_2ltyuX on Query {
              streamCollections(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode) {
                edges {
                  node {
                    ...StreamLine_node
                    id
                    __typename
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
        "search": "",
        "count": 25,
        "cursor": None,
        "orderBy": "name",
        "orderMode": "asc",
    }

    result = await send(query=query, variables=variables)

    nodes_list = []

    for edge in result["streamCollections"]["edges"]:
        node = edge["node"]
        node.pop("__typename", None)
        node.pop("stream_public", None)
        node.pop("authorized_members", None)
        node.pop("filters", None)
        nodes_list.append(node)

    return nodes_list
