import { genericTableColumn } from "../../../../components";

export const column: Record<string, genericTableColumn> = {
  id: {
    name: "ID",
    type: "hidden",
  },
  "@timestamp": {
    name: "Timestamp",
    type: "date",
  },
  "kibana.alert.rule.name": {
    name: "Rule",
    type: "text",
  },
  "kibana.alert.rule.threat.tactic.name": {
    name: "Tactic",
    type: "health"
  },
  "kibana.alert.rule.threat.technique.name": {
    name: "Technique",
    type: "health"
  },
  "kibana.alert.severity": {
    name: "Severity",
    type: "health",
  },
  "kibana.alert.risk_score": {
    name: "Risk score",
    type: "score",
  },
  "host.name": {
    name: "Host Name",
    type: "health",
  },
  "user.name": {
    name: "User Name",
    type: "health",
  },
  "source.ip": {
    name: "Source IP",
    type: "health",
  },
  "destination.ip": {
    name: "Destination IP",
    type: "health",
  },
};
