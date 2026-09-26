import {
  threatIntelligenceState,
  threatIntelligenceActionTypes,
  threatIntelligenceActions,
  ThreatIntelligencePayloadGetTable,
  ThreatIntelligencePayloadGetMetadata,
  ThreatIntelligencePayloadGetTIDashboard,
  ThreatIntelligencePayloadGetMalwareDashboard,
  ThreatIntelligencePayloadGetIPDashboard,
} from "../../types/threat-intelligence";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const ThreatIntelligenceInitialState: threatIntelligenceState = {
  threatTable: INITIAL_REDUCER_DATA,
  threatMetadata: INITIAL_REDUCER_DATA,
  threatTIDashboard: INITIAL_REDUCER_DATA,
  threatMalwareDashboard: INITIAL_REDUCER_DATA,
  threatIPDashboard: INITIAL_REDUCER_DATA,
  getThreatMetadata: () => { },
  getThreatTIDashboard: () => { },
  getThreatMalwareDashboard: () => { },
  getThreatIPDashboard: () => { },
  getThreatTable: () => { },
  editThreatConfidenceField: async () => await false,
  setThreatTableParams: async () => await false,
};

export const ThreatIntelligenceReducer = (
  state: threatIntelligenceState,
  action: threatIntelligenceActions<threatIntelligenceActionTypes>
): threatIntelligenceState => {
  switch (action.type) {
    case "SET_THREAT_TABLE":
      return {
        ...state,
        threatTable: {
          ...state.threatTable,
          data: (action.payload as ThreatIntelligencePayloadGetTable).threatTable,
        },
      };
    case "SET_THREAT_METADATA":
      return {
        ...state,
        threatMetadata: {
          ...state.threatMetadata,
          data: (action.payload as ThreatIntelligencePayloadGetMetadata).threatMetadata,
        },
      };
    case "SET_THREAT_TI_DASHBOARD":
      return {
        ...state,
        threatTIDashboard: {
          ...state.threatTIDashboard,
          data: (action.payload as ThreatIntelligencePayloadGetTIDashboard).tiDashboard,
        },
      };
    case "SET_THREAT_MALWARE_DASHBOARD":
      return {
        ...state,
        threatMalwareDashboard: {
          ...state.threatMalwareDashboard,
          data: (action.payload as ThreatIntelligencePayloadGetMalwareDashboard).malwareDashboard,
        },
      };
    case "SET_THREAT_IP_DASHBOARD":
      return {
        ...state,
        threatIPDashboard: {
          ...state.threatIPDashboard,
          data: (action.payload as ThreatIntelligencePayloadGetIPDashboard).ipDashboard,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof threatIntelligenceState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof threatIntelligenceState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof threatIntelligenceState>).state;
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
