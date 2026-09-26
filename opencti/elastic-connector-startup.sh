#!/bin/sh


check_indicators_streamer_exists() {
  local response
  response=$(wget -qO- \
    --header="Authorization: Bearer ${OPENCTI_TOKEN}" \
    --header="Content-Type: application/json" \
    --post-data='{
      "query": "query StreamLinesPaginationQuery($search: String, $count: Int!, $cursor: ID, $orderBy: StreamCollectionOrdering, $orderMode: OrderingMode) { ...StreamLines_data_2ltyuX } fragment StreamCollectionEdition_streamCollection on StreamCollection { id name description filters stream_live stream_public authorized_members { id name } } fragment StreamLine_node on StreamCollection { id name description filters stream_public stream_live ...StreamCollectionEdition_streamCollection } fragment StreamLines_data_2ltyuX on Query { streamCollections(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode) { edges { node { ...StreamLine_node id __typename } cursor } pageInfo { endCursor hasNextPage globalCount } } }",
      "variables": {
        "search": "",
        "count": 25,
        "cursor": null,
        "orderBy": "name",
        "orderMode": "asc"
      }
    }' \
    ${OPENCTI_URL}/graphql)

  # Check if the response contains the specific name
  if echo "$response" | grep -q '"name":\s*"indicators_st"'; then
    echo 1
  else
    echo 0
  fi
}


get_existing_indicators_streamer_id () {
  wget -qO- \
    --header="Authorization: Bearer ${OPENCTI_TOKEN}" \
    --header="Content-Type: application/json" \
    --post-data='{
      "query": "query StreamLinesPaginationQuery($search: String, $count: Int!, $cursor: ID, $orderBy: StreamCollectionOrdering, $orderMode: OrderingMode) { ...StreamLines_data_2ltyuX } fragment StreamCollectionEdition_streamCollection on StreamCollection { id name description filters stream_live stream_public authorized_members { id name } } fragment StreamLine_node on StreamCollection { id name description filters stream_public stream_live ...StreamCollectionEdition_streamCollection } fragment StreamLines_data_2ltyuX on Query { streamCollections(search: $search, first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode) { edges { node { ...StreamLine_node id __typename } cursor } pageInfo { endCursor hasNextPage globalCount } } }",
      "variables": {
        "search": "",
        "count": 25,
        "cursor": null,
        "orderBy": "name",
        "orderMode": "asc"
      }
    }' \
    ${OPENCTI_URL}/graphql | sed -n 's/.*"node":{"id":"\([^"]*\)","name":"indicators_st".*}/\1/p'
}


create_indicators_streamer () {
  wget -qO- \
  --header="Authorization: Bearer ${OPENCTI_TOKEN}" \
  --header="Content-Type: application/json" \
  --post-data='{
    "query": "mutation StreamCollectionCreationMutation($input: StreamCollectionAddInput!) { streamCollectionAdd(input: $input) { id ...StreamLine_node } } fragment StreamCollectionEdition_streamCollection on StreamCollection { id name description filters stream_public stream_live authorized_members { id name } } fragment StreamLine_node on StreamCollection { id name description filters stream_public stream_live ...StreamCollectionEdition_streamCollection }",
    "variables": {
      "input": {
        "name": "indicators_st",
        "description": "",
        "stream_public": true,
        "authorized_members": [],
        "filters": "{\"mode\":\"and\",\"filters\":[{\"key\":[\"entity_type\"],\"values\":[\"Indicator\"],\"operator\":\"eq\",\"mode\":\"or\"}],\"filterGroups\":[]}"
      }
    }
  }' \
  ${OPENCTI_URL}/graphql \
  | sed 's/.*"id":"\([^"]*\)".*/\1/'
}

activate_data_streamer() {
  local STREAM_ID
  local response
  STREAM_ID=$1

  response=$(wget -qO- \
    --header="Authorization: Bearer ${OPENCTI_TOKEN}" \
    --header="Content-Type: application/json" \
    --post-data='{"query": "mutation StreamCollectionEditionFieldPatchMutation($id: ID!, $input: [EditInput]!) { streamCollectionEdit(id: $id) { fieldPatch(input: $input) { ...StreamCollectionEdition_streamCollection id } } } fragment StreamCollectionEdition_streamCollection on StreamCollection { id name description filters stream_live stream_public authorized_members { id name } }", "variables": {"id": "'${STREAM_ID}'", "input": [{"key": "stream_live", "value": ["true"]}]}}' \
    ${OPENCTI_URL}/graphql
  )
}


indicators_streamer_existence=$(check_indicators_streamer_exists)

if [ $indicators_streamer_existence -ne 1 ]; then
  echo "Data streamer named 'indicators_st' not exists. Creating....."
  ID=$(create_indicators_streamer)
  echo "Done creating."
  CONNECTOR_LIVE_STREAM_ID=$ID; export CONNECTOR_LIVE_STREAM_ID
  echo "Exported live stream id"
  echo "Activating the streamer...."
  activate_data_streamer $CONNECTOR_LIVE_STREAM_ID
  echo "Done activating."
else
  echo "Data streamer exists."
  ID=$(get_existing_indicators_streamer_id)
  CONNECTOR_LIVE_STREAM_ID=$ID; export CONNECTOR_LIVE_STREAM_ID
  echo "Exported live stream id"
fi