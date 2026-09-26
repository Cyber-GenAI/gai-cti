import {
  utilitiesState,
  utilitiesActionTypes,
  utilitiesActions,
  UtilitiesPayloadGetESToken,
} from "../../types/utilities";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const UtilitiesInitialState: utilitiesState = {
  es_token: INITIAL_REDUCER_DATA,
  getESToken: async () => await '',
  getSystemAvailable: async () => await false,
};

export const UtilitiesReducer = (
  state: utilitiesState,
  action: utilitiesActions<utilitiesActionTypes>
): utilitiesState => {
  switch (action.type) {
    case "SET_ES_TOKEN":
      return {
        ...state,
        es_token: {
          ...state.es_token,
          data: (action.payload as UtilitiesPayloadGetESToken).es_token,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof utilitiesState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof utilitiesState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof utilitiesState>).state;
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
