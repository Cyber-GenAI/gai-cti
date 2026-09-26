import { genericTableColumn } from "../../../../components";

export const RulesDisplay: Record<string, genericTableColumn> = {
  name: {
    name: "Name",
    type: "long_text",
  },
  id: {
    name: "ID",
    type: "hidden",
  },
  related_integrations: {
    name: "Integrations",
    type: "length",
  },
  tags: {
    name: "Tags",
    type: "length",
  },
  risk_score: {
    name: "Risk Score",
    type: "score",
  },
  severity: {
    name: "Severity",
    type: "health",
  },
  "execution_summary.last_execution.date": {
    name: "Last Run",
    type: "date",
  },
  "execution_summary.last_execution.status": {
    name: "Last Response",
    type: "health",
  },
  updated_at: {
    name: "Last Update",
    type: "date",
  },
  enabled: {
    name: "Enabled",
    type: "bool",
  },
  actions: {
    name: "Actions",
    type: "action",
  },
};
