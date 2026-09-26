// Payload constants for AlertsContext API calls

import { page_size } from "../../../constants/table";

export const dashboardSeverityLevelsPayload = (isTI: boolean) => ({
  size: 0,
  query: {
    bool: {
      filter: [
        {
          bool: {
            ...(isTI ? {
              "filter": [
                {
                  "bool": {
                    "should": [
                      {
                        "match_phrase": {
                          "kibana.alert.rule.tags": "Type: GAI_CTI_TI"
                        }
                      }
                    ],
                    "minimum_should_match": 1
                  }
                }
              ]
            } : { filter: [] }),
            must_not: [
              { exists: { field: "kibana.alert.building_block_type" } }
            ],
          }
        }
      ]
    }
  },
  aggs: { statusBySeverity: { terms: { field: "kibana.alert.severity" } } },
  runtime_mappings: {}
});

export const dashboardAlertsByNamePayload = (isTI: boolean) => ({
  size: 0,
  query: {
    bool: {
      filter: [
        {
          bool: {
            ...(isTI ? {
              "filter": [
                {
                  "bool": {
                    "should": [
                      {
                        "match_phrase": {
                          "kibana.alert.rule.tags": "Type: GAI_CTI_TI"
                        }
                      }
                    ],
                    "minimum_should_match": 1
                  }
                }
              ]
            } : { filter: [] }),
            must_not: [{ exists: { field: "kibana.alert.building_block_type" } }],
          }
        }
      ]
    }
  },
  aggs: { alertsByRule: { terms: { field: "kibana.alert.rule.name", size: 1000 } } },
  runtime_mappings: {}
});

export const dashboardTopAlertsPayload = (type: string, isTI: boolean) => ({
  size: 0,
  query: {
    bool: {
      filter: [
        {
          bool: {
            must: [],
            ...(isTI ? {
              "filter": [
                {
                  "bool": {
                    "should": [
                      {
                        "match_phrase": {
                          "kibana.alert.rule.tags": "Type: GAI_CTI_TI"
                        }
                      }
                    ],
                    "minimum_should_match": 1
                  }
                }
              ]
            } : { filter: [] }),
            must_not: [
              {
                exists: {
                  field: "kibana.alert.building_block_type"
                }
              }
            ],
          }
        }
      ]
    }
  },
  aggs: {
    alertsByGrouping: {
      terms: {
        field: type,
        size: 10
      }
    },
    missingFields: {
      missing: {
        field: type
      }
    }
  },
  runtime_mappings: {}
});

export const alertsGroupedPayload = (field: string, isTI: boolean) => ({
  size: 0,
  runtime_mappings: {
    groupByField: {
      type: "keyword",
      script: {
        source: "if (doc[params['selectedGroup']].size()==0) { emit(params['uniqueValue']) } else { emit(doc[params['selectedGroup']].join(params['conjunctionValue']))}",
        params: {
          selectedGroup: field,
          uniqueValue: "NONE",
          conjunctionValue: ", "
        }
      }
    }
  },
  query: {
    "bool": {
      "filter": [
        {
          "bool": {
            "must": [],
            "filter": [
              {
                "bool": {
                  "should": isTI ? [
                    {
                      "match_phrase": {
                        "kibana.alert.rule.tags": "Type: GAI_CTI_TI"
                      }
                    }
                  ] : [],
                  "minimum_should_match": 1
                }
              }
            ],
            "should": [],
            "must_not": [
              {
                "exists": {
                  "field": "kibana.alert.building_block_type"
                }
              }
            ]
          }
        },
      ]
    }
  },
  aggs: {
    groupByFields: {
      terms: {
        field: "groupByField",
        size: 10000
      },
      aggs: {
        bucket_truncate: {
          bucket_sort: {
            sort: [{ unitsCount: { "order": "desc" } }],
            from: 0,
            size: 10000
          }
        },
        unitsCount: { cardinality: { "field": "kibana.alert.uuid" } },
        description: {
          terms: {
            field: "kibana.alert.rule.description",
            size: 1
          }
        },
        countSeveritySubAggregation: { cardinality: { field: "kibana.alert.severity" } },
        severitiesSubAggregation: { terms: { field: "kibana.alert.severity" } },
        usersCountAggregation: { cardinality: { field: "user.name" } },
        hostsCountAggregation: { cardinality: { field: "host.name" } },
        ruleName: { terms: { field: "kibana.alert.rule.name" } }
      }
    },
    unitsCount: { value_count: { field: "groupByField" } },
    groupsCount: { cardinality: { field: "groupByField" } }
  },
});

export const alertsTablePayload = (
  id?: string,
  currentPage?: number,
  grouped_field?: { field: string, value: string }
) => (
  {
    "batch": [
      {
        "request": {
          "featureIds": [
            "siem"
          ],
          "fields": [
            {
              "field": "@timestamp",
              "include_unmapped": true
            },
            {
              "field": "kibana.alert.rule.name",
              "include_unmapped": true
            },
            {
              "field": "kibana.alert.workflow_assignee_ids",
              "include_unmapped": true
            },
            {
              "field": "kibana.alert.severity",
              "include_unmapped": true
            },
            {
              "field": "kibana.alert.risk_score",
              "include_unmapped": true
            },
            {
              "field": "kibana.alert.reason",
              "include_unmapped": true
            },
            {
              "field": "host.name",
              "include_unmapped": true
            },
            {
              "field": "user.name",
              "include_unmapped": true
            },
            {
              "field": "process.name",
              "include_unmapped": true
            },
            {
              "field": "file.name",
              "include_unmapped": true
            },
            {
              "field": "source.ip",
              "include_unmapped": true
            },
            {
              "field": "destination.ip",
              "include_unmapped": true
            }
          ],
          query: {
            bool: {
              filter: {
                bool: {
                  must: [],
                  filter: grouped_field?.value && grouped_field.value != "__" ? [{
                    script: {
                      script: {
                        source: "doc[params['field']].size()==params['size']",
                        params: {
                          field: grouped_field.field,
                          "size": 1
                        }
                      }
                    }
                  },
                  { match_phrase: { [grouped_field.field]: { "query": grouped_field.value } } },
                  ] : [],
                  should: [],
                  must_not: [
                    {
                      "exists": {
                        "field": "kibana.alert.building_block_type"
                      }
                    }
                  ],
                }
              }
            }
          },
          pagination: {
            pageIndex: currentPage ? currentPage - 1 : 0,
            pageSize: page_size
          },
          "sort": [
            {
              "@timestamp": {
                "order": "desc"
              }
            }
          ],
          "runtimeMappings": {},
          ...(id ? { id: id } : {}),
        }
      }
    ]
  }
);

export const alertDetailPayload = (id: string) => ({
  size: 1,
  query: { term: { "alert_id": id } },
  runtime_mappings: {}
});

export const alertTableBaseRequest = {
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
            should_ti: [{ "term": { "kibana.alert.rule.tags": { "value": "Type: Type: GAI_CTI_TI" } } }],
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