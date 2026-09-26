import {
  feedState,
  feedActionTypes,
  feedActions,
  FeedsPayloadSetFeedTable,
  FeedsPayloadSetFeedDetail,
  FeedsPayloadSetFeedMarkdown,
  FeedsPayloadSetFeedConfigurationConnectors,
  FeedsPayloadSetFeedConfigurationFields,
  FeedsPayloadSetFeedDashboard,
  FeedsPayloadSetFeedOrganizationMap,
  FeedsPayloadSetFeedSecondTable,
  FeedsPayloadSetFeedDashboardIocCounterOverTime,
} from "../../types/feeds";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const FeedsInitialState: feedState = {
  feedsTable: INITIAL_REDUCER_DATA,
  feedsSecondTable: INITIAL_REDUCER_DATA,
  feedDetail: INITIAL_REDUCER_DATA,
  feedConfigurationConnectors: INITIAL_REDUCER_DATA,
  feedConfigurationFields: INITIAL_REDUCER_DATA,
  feedMarkdown: INITIAL_REDUCER_DATA,
  feedOrganizationsMap: INITIAL_REDUCER_DATA,
  feedDashboard: INITIAL_REDUCER_DATA,
  feedDashboardIocCounterOverTime: INITIAL_REDUCER_DATA,
  getFeedTable: () => { },
  getFeedDetail: () => { },
  getFeedSecondTable: () => { },
  getFeedOrganizationsMap: () => { },
  getFeedDashboard: () => { },
  getFeedDashboardIocCounterOverTime: () => { },
  getFeedConfigurationHelp: () => { },
  getFeedConfigurationFields: () => { },
  getFeedConfigurationConnectors: () => { },
  editFeedConfidenceField: async () => await false,
  editFeedReliabilityField: async () => await false,
  submitFeedConfigurationFields: async () => await false,
  cleanUpConnectors: async () => await false,
};

export const FeedsReducer = (
  state: feedState,
  action: feedActions<feedActionTypes>
): feedState => {
  switch (action.type) {
    case "SET_FEED_TABLE":
      return {
        ...state,
        feedsTable: {
          ...state.feedsTable,
          data: (action.payload as FeedsPayloadSetFeedTable).feedsTable,
        },
      };
    case "SET_FEED_SECOND_TABLE":
      return {
        ...state,
        feedsSecondTable: {
          ...state.feedsSecondTable,
          data: (action.payload as FeedsPayloadSetFeedSecondTable).feedsSecondTable,
        },
      };
    case "SET_FEED_DASHBOARD":
      return {
        ...state,
        feedDashboard: {
          ...state.feedDashboard,
          data: (action.payload as FeedsPayloadSetFeedDashboard).feedDashboard,
        },
      };
    case "SET_FEED_DASHBOARD_IOC_COUNTER_OVERTIME":
      return {
        ...state,
        feedDashboardIocCounterOverTime: {
          ...state.feedDashboardIocCounterOverTime,
          data: (action.payload as FeedsPayloadSetFeedDashboardIocCounterOverTime).feedDashboardIocCounterOverTime,
        },
      };
    case "SET_FEED_DETAIL":
      return {
        ...state,
        feedDetail: {
          ...state.feedDetail,
          data: (action.payload as FeedsPayloadSetFeedDetail).feedDetail,
        },
      };
    case "SET_FEED_CONFIGURATION_CONNECTORS":
      return {
        ...state,
        feedConfigurationConnectors: {
          ...state.feedConfigurationConnectors,
          data: (action.payload as FeedsPayloadSetFeedConfigurationConnectors).feedConfigurationConnectors,
        },
      };
    case "SET_FEED_CONFIGURATION_FIELDS":
      return {
        ...state,
        feedConfigurationFields: {
          ...state.feedConfigurationFields,
          data: (action.payload as FeedsPayloadSetFeedConfigurationFields).feedConfigurationFields,
        },
      };
    case "SET_FEED_ORGANIZATION_MAP":
      return {
        ...state,
        feedOrganizationsMap: {
          ...state.feedOrganizationsMap,
          data: (action.payload as FeedsPayloadSetFeedOrganizationMap).feedOrganizationsMap,
        },
      };
    case "SET_FEED_MARKDOWN":
      return {
        ...state,
        feedMarkdown: {
          ...state.feedMarkdown,
          data: (action.payload as FeedsPayloadSetFeedMarkdown).feedMarkdown,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof feedState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof feedState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof feedState>).state;
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
