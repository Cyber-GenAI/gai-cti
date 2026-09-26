#!/bin/sh


# This script is used to start the OpenCTI Elastic connector.
. /startup.sh
echo "CONNECTOR_LIVE_STREAM_ID is set to: $CONNECTOR_LIVE_STREAM_ID"
echo "export CONNECTOR_LIVE_STREAM_ID=$CONNECTOR_LIVE_STREAM_ID" > /etc/profile.d/connector_env.sh

# Correct working directory
cd /opt/opencti-connector-elastic

# Start the connector
exec /usr/local/bin/python3 -m elastic