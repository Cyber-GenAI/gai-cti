import {
  ruleState,
  ruleActionTypes,
  ruleActions,
  RulePayloadGetRulePages,
  RulePayloadGetMitreCoverage,
  RulePayloadGetTechniqueRules,
  RulePayloadGetRules,
  RulePayloadGetRulesDashboard,
  RulePayloadGetRuleDetail,
} from "../../types/rules";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const RuleInitialState: ruleState = {
  rules: INITIAL_REDUCER_DATA,
  rulesDashboard: INITIAL_REDUCER_DATA,
  rule_pages: INITIAL_REDUCER_DATA,
  mitre_coverage: INITIAL_REDUCER_DATA,
  technique_rules: INITIAL_REDUCER_DATA,
  ruleDetail: INITIAL_REDUCER_DATA,
  getRules: () => { },
  getRuleDetail: () => { },
  getRulesDashboard: () => { },
  getRulePages: () => { },
  getMitreCoverage: () => { },
  getTechniqueRules: () => { },
  deleteRule: async () => await false,
  editRuleInterval: async () => await false, 
  runRuleManually: async () => await false,
};

export const RuleReducer = (
  state: ruleState,
  action: ruleActions<ruleActionTypes>
): ruleState => {
  switch (action.type) {
    case "SET_RULES":
      return {
        ...state,
        rules: {
          ...state.rules,
          data: (action.payload as RulePayloadGetRules).rules,
        },
      };
    case "SET_RULE_DETAIL":
      return {
        ...state,
        ruleDetail: {
          ...state.ruleDetail,
          data: (action.payload as RulePayloadGetRuleDetail).rule,
        },
      };
    case "SET_RULE_PAGES":
      return {
        ...state,
        rule_pages: {
          ...state.rule_pages,
          data: (action.payload as RulePayloadGetRulePages).rule_pages,
        },
      };
    case "SET_RULE_MITRE_COVERAGE":
      return {
        ...state,
        mitre_coverage: {
          ...state.mitre_coverage,
          data: (action.payload as RulePayloadGetMitreCoverage).mitre_coverage,
        },
      };
    case "SET_RULES_DASHBOARD":
      return {
        ...state,
        rulesDashboard: {
          ...state.rulesDashboard,
          data: (action.payload as RulePayloadGetRulesDashboard).rulesDashboard,
        },
      };
    case "SET_TECHNIQUE_RULES":
      return {
        ...state,
        technique_rules: {
          ...state.technique_rules,
          data: (action.payload as RulePayloadGetTechniqueRules).technique_rules,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof ruleState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof ruleState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof ruleState>).state;
      return {
        ...state,
        [key]: {
          ...state[key],
          isLoading,
        },
      };
    }
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};
