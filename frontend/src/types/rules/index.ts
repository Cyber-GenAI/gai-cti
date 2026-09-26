import { fieldWithType, genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"
import { VisualResponseWithType } from "../visuals"

export type ruleTag = {
  name: string
  description: string
  tag: string
}

export type rule = Record<string, unknown>

export type rules = {
  page: number;
  perPage: number;
  total: number;
  data: rule[];
}

export type ruleDetail = fieldWithType[];

export type mitreCoverage = Record<string, number>
export type ruleTechnique = {
  id: string
  rule_id: string
  name: string
  tags: string[]
  type: string
  enabled: boolean
  ttps: unknown
}

export type ruleParams = { filter?: string, currentPage?: number, searchTerm?: string }

export type rulesDashboard = {
  "total-count": VisualResponseWithType<"MetricVisual">
  "sigma-count": VisualResponseWithType<"MetricVisual">
  "ioc-count": VisualResponseWithType<"MetricVisual">
  "custom-count": VisualResponseWithType<"MetricVisual">
  "severity": VisualResponseWithType<"PieVisual">
  "risk-distribution": VisualResponseWithType<"BarVisual">
  "tags-treemap": VisualResponseWithType<"TreeMapVisual">
}

export type ruleState = {
  rules: genericContext<rules>;
  rule_pages: genericContext<ruleTag[]>;
  mitre_coverage: genericContext<mitreCoverage>;
  rulesDashboard: genericContext<rulesDashboard>;
  ruleDetail: genericContext<ruleDetail>;
  technique_rules: genericContext<{count: number, data: ruleTechnique[]}>;
  getRules: (params?: Partial<ruleParams>) => void;
  getRuleDetail: (id: string) => void;
  getRulePages: () => void;
  getRulesDashboard: () => void;
  getMitreCoverage: () => void;
  getTechniqueRules: (technique: string) => void;
  deleteRule: (id: string) => Promise<boolean>;
  editRuleInterval: (id: string, interval: string) => Promise<boolean>;
  runRuleManually: (id: string) => Promise<boolean>;
}

export type RulePayloadGetRules = {
  rules: rules;
}

export type RulePayloadGetRuleDetail = {
  rule: ruleDetail;
}

export type RulePayloadGetRulesDashboard = {
  rulesDashboard: rulesDashboard
}

export type RulePayloadGetRulePages = {
  rule_pages: ruleTag[];
}

export type RulePayloadGetMitreCoverage = {
  mitre_coverage: mitreCoverage
}

export type RulePayloadGetTechniqueRules = {
  id: string;
  technique_rules: {count: number, data: ruleTechnique[]}
}

export type ruleActionTypes = "SET_RULES" | "SET_RULE_DETAIL" | "SET_RULES_DASHBOARD" | "SET_RULE_PAGES" | "SET_TECHNIQUE_RULES" | "SET_RULE_MITRE_COVERAGE"

export type ruleActions<T> = {
    type: T | "SET_ISLOADING" | "CLEAR_KEY"
    payload: RulePayloadGetRules
    | RulePayloadGetRulePages
    | RulePayloadGetMitreCoverage
    | RulePayloadGetTechniqueRules
    | RulePayloadGetRuleDetail
    | RulePayloadGetRulesDashboard
    | globalPayloadSetIsLoading<keyof ruleState>
    | globalPayloadClearData<keyof ruleState>
}