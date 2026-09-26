import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  mitreCoverage,
  ruleDetail,
  ruleParams,
  rules,
  rulesDashboard,
  ruleState,
  ruleTag,
  ruleTechnique,
} from "../../types/rules";
import {
  RuleReducer,
  RuleInitialState,
} from "../../reducer/rules/rules-reducer";
import {
  AR_GET_RULES_PAGES,
  AR_GET_RULES_MITRE_COVERAGE,
  AR_GET_TECHNIQUE_RULES,
  AR_RUN_RULE_MANUAL,
  AR_KIBANA_LIST_RULES,
  AR_GET_RULES_DASHBOARD,
  AR_GET_RULE_DETAIL,
  AR_EDIT_RULE_INTERVAL,
  AR_DELETE_RULE
} from "../../api/routes/rule";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";
import { buildQuery } from "../../api/utils/buildQuery";
import { page_size } from "../../constants/table";
import Cookies from 'universal-cookie';

const RulesContext = createContext<ruleState | undefined>(undefined);

interface RulesProviderProps {
  children: React.ReactNode;
}

export const RulesProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(RuleReducer, RuleInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof ruleState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof ruleState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    [clearKey]
  );

  const getRules = useCallback(async (params?: Partial<ruleParams>) => {
    setIsLoading({ key: "rules", state: true });

    const constructFilters = () => {
      const filters = [];
      if (params?.filter) {
        filters.push(`alert.attributes.tags:("${params.filter}")`);
      }
      if (params?.searchTerm) {
        filters.push(`(alert.attributes.name: ${params.searchTerm})`);
      }
      return filters.length > 0 ? { filter: filters.join(' AND ') } : {};
    };

    const kibanaParams = {
      page: params?.currentPage ?? 1,
      per_page: page_size,
      sort_field: 'enabled',
      sort_order: 'desc',
      ...constructFilters(),
    };

    const query = buildQuery({ ...kibanaParams });
    const url = `${AR_KIBANA_LIST_RULES}${query}`;

    try {
      const data = await request<rules>({
        url,
        method: "GET",
        config: { headers: { 'Authorization': `ApiKey ${new Cookies().get('es_token')}` } },
      });

      dispatch({
        type: "SET_RULES",
        payload: { rules: data },
      });
    } finally {
      setIsLoading({ key: "rules", state: false });
    }
  }, [setIsLoading]);

  const getRulePages = useCallback(async () => {
    setIsLoading({ key: "rule_pages", state: true });

    const data = await request<ruleTag[]>({
      url: AR_GET_RULES_PAGES,
      method: "GET",
    });

    dispatch({
      type: "SET_RULE_PAGES",
      payload: { rule_pages: data },
    });

    setIsLoading({ key: "rule_pages", state: false });
  }, [setIsLoading]);

  const getMitreCoverage = useCallback(async () => {
    setIsLoading({ key: "mitre_coverage", state: true });

    const data = await request<mitreCoverage>({
      url: AR_GET_RULES_MITRE_COVERAGE,
      method: "GET",
    });

    dispatch({
      type: "SET_RULE_MITRE_COVERAGE",
      payload: { mitre_coverage: data },
    });

    setIsLoading({ key: "mitre_coverage", state: false });
  }, [setIsLoading]);

  const getTechniqueRules = useCallback(async (technique: string) => {
    setIsLoading({ key: "technique_rules", state: true });
    const data = await request<{ count: number, data: ruleTechnique[] }>({
      url: AR_GET_TECHNIQUE_RULES(technique),
      method: "GET",
    });

    dispatch({
      type: "SET_TECHNIQUE_RULES",
      payload: { id: technique, technique_rules: data },
    });

    setIsLoading({ key: "technique_rules", state: false });
  }, [setIsLoading]);

  const getRulesDashboard = useCallback(async () => {
    setIsLoading({ key: "rulesDashboard", state: true });
    const data = await request<rulesDashboard>({
      url: AR_GET_RULES_DASHBOARD,
      method: "GET",
    });

    dispatch({
      type: "SET_RULES_DASHBOARD",
      payload: { rulesDashboard: data },
    });

    setIsLoading({ key: "rulesDashboard", state: false });
  }, [setIsLoading]);

  const getRuleDetail = useCallback(async (id: string) => {
    setIsLoading({ key: "ruleDetail", state: true });
    const data = await request<ruleDetail>({
      url: AR_GET_RULE_DETAIL(id),
      method: "GET",
    });

    dispatch({
      type: "SET_RULE_DETAIL",
      payload: { rule: data },
    });

    setIsLoading({ key: "ruleDetail", state: false });
  }, [setIsLoading]);

  const deleteRule = useCallback(async (id: string) => {
    try {
      await request<null>({
        url: AR_DELETE_RULE(id),
        method: "DELETE",
        config: {
          headers: {
            'accept': 'application/json'
          },
        }
      });
      return true
    } catch {
      return false
    }
  }, []);

  const editRuleInterval = useCallback(async (id: string, interval: string) => {
    try {
      await request<null>({
        url: AR_EDIT_RULE_INTERVAL(id, interval),
        method: "PATCH",
        config: {
          headers: {
            'accept': 'application/json'
          },
        }
      });
      return true
    } catch {
      return false
    }
  }, []);

  const runRuleManually = useCallback(async (id: string) => {
    try {
      const query = buildQuery({ rule_id: id })
      const url = `${AR_RUN_RULE_MANUAL}${query}`;
      await request<null>({
        url,
        method: "POST",
        config: {
          headers: {
            'accept': 'application/json'
          },
        }
      });
      return true
    } catch {
      return false
    }
  }, []);

  const value = useMemo(() => ({
    ...state,
  }), [state]);

  const actions = useMemo(() => ({
    getRules,
    getRulesDashboard,
    getRuleDetail,
    getRulePages,
    deleteRule,
    getMitreCoverage,
    getTechniqueRules,
    editRuleInterval,
    runRuleManually
  }), [getRules, getRulesDashboard, getRuleDetail, getRulePages, deleteRule, getMitreCoverage, getTechniqueRules, editRuleInterval, runRuleManually]);


  return <RulesContext.Provider value={{ ...value, ...actions }}>{children}</RulesContext.Provider>;
};

export const useRules = (): ruleState => {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error("useRules must be used within a RulesProvider");
  }
  return context;
};
