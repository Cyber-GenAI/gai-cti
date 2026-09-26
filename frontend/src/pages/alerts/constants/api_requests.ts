export const alerts_grouped_request = {
  "size": 0,
  "runtime_mappings": {
    "groupByField": {
      "type": "keyword",
      "script": {
        "source": "if (doc[params['selectedGroup']].size()==0) { emit(params['uniqueValue']) } else { emit(doc[params['selectedGroup']].join(params['uniqueValue']))}",
        "params": {
          "selectedGroup": "kibana.alert.rule.name",
          "uniqueValue": "__"
        }
      }
    }
  },
  "aggs": {
    "groupByFields": {
      "terms": {
        "field": "groupByField",
        "size": 10000
      },
      "aggs": {
        "bucket_truncate": {
          "bucket_sort": {
            "sort": [{ "unitsCount": { "order": "desc" } }],
            "from": 0,
            "size": 25
          }
        },
        "unitsCount": { "cardinality": { "field": "kibana.alert.uuid" } },
        "description": {
          "terms": {
            "field": "kibana.alert.rule.description",
            "size": 1
          }
        },
        "countSeveritySubAggregation": { "cardinality": { "field": "kibana.alert.severity" } },
        "severitiesSubAggregation": { "terms": { "field": "kibana.alert.severity" } },
        "usersCountAggregation": { "cardinality": { "field": "user.name" } },
        "hostsCountAggregation": { "cardinality": { "field": "host.name" } },
        "ruleTags": { "terms": { "field": "kibana.alert.rule.tags" } }
      }
    },
    "unitsCount": { "value_count": { "field": "groupByField" } },
    "groupsCount": { "cardinality": { "field": "groupByField" } }
  },
}