export const source_options = [
  {
    value: "host.name",
    text: "host.name"
  },
  {
    value: "user.name",
    text: "user.name"
  },
  {
    value: "source.ip",
    text: "source.ip"
  },
  {
    value: "destination.ip",
    text: "destination.ip"
  },
]
export const alert_list_request_body = {
  request: {
    featureIds: ["siem"],
    fields: [
      { field: "@timestamp", include_unmapped: true },
      { field: "kibana.alert.rule.name", include_unmapped: true },
      { field: "kibana.alert.workflow_assignee_ids", include_unmapped: true },
      { field: "kibana.alert.severity", include_unmapped: true },
      { field: "kibana.alert.risk_score", include_unmapped: true },
      { field: "kibana.alert.reason", include_unmapped: true },
      { field: "host.name", include_unmapped: true },
      { field: "user.name", include_unmapped: true },
      { field: "process.name", include_unmapped: true },
      { field: "file.name", include_unmapped: true },
      { field: "source.ip", include_unmapped: true },
      { field: "destination.ip", include_unmapped: true }
    ],
    query: {
      bool: {
        filter: {
          bool: {
            must: [],
            filter: [],
            should: [],
            must_not: [
              { exists: { field: "kibana.alert.building_block_type" } }
            ]
          }
        }
      }
    },
    pagination: {
      pageIndex: 0,
      pageSize: 50
    },
    sort: [
      { "@timestamp": { order: "desc" } }
    ],
    runtimeMappings: {}
  },
  options: {
    strategy: "privateRuleRegistryAlertsSearchStrategy",
    isSearchStored: false,
    executionContext: {
      type: "application",
      name: "securitySolutionUI",
      url: "/kibana/app/security/alerts",
      page: "/alerts"
    }
  }
}