import {
  managementState,
  managementActionTypes,
  managementActions,
  ManagementPayloadGetManagementInjectedIOCS,
  ManagementPayloadGetManagementTable,
  ManagementPayloadGetManagementRulePreview
} from "../../types/management";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const ManagementInitialState: managementState = {
  management_table: INITIAL_REDUCER_DATA,
  management_rule_preview: INITIAL_REDUCER_DATA,
  injected_iocs: INITIAL_REDUCER_DATA,
  getManagementTable: () => { },
  getInjectedIocs: () => { },
  getManagementRulePreview: async () => await false,
  submitManagementRule: async () => await false,
  deleteType: async () => await false,
  generalActions: async () => await false,
};

export const ManagementReducer = (
  state: managementState,
  action: managementActions<managementActionTypes>
): managementState => {
  switch (action.type) {
    case "SET_INJECTED_IOCS":
      return {
        ...state,
        injected_iocs: {
          ...state.injected_iocs,
          data: (action.payload as ManagementPayloadGetManagementInjectedIOCS).injected_iocs,
        },
      };
    case "SET_MANAGEMENT_TABLE":
      return {
        ...state,
        management_table: {
          ...state.management_table,
          data: (action.payload as ManagementPayloadGetManagementTable).management_table,
        },
      };
    case "SET_MANAGMENT_PREVIEW":
      return {
        ...state,
        management_rule_preview: {
          ...state.management_rule_preview,
          data: (action.payload as ManagementPayloadGetManagementRulePreview).management_rule_preview,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof managementState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof managementState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof managementState>).state;
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
