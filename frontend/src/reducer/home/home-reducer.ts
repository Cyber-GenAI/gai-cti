import {
  homeState,
  HomePayloadGetDashboard,
  homeActionTypes,
  homeActions,
} from "../../types/home";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const HomeInitialState: homeState = {
  dashboard: INITIAL_REDUCER_DATA,
  getDashboard: () => { }
};

export const HomeReducer = (
  state: homeState,
  action: homeActions<homeActionTypes>
): homeState => {
  switch (action.type) {
    case "SET_DASHBOARD":
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          data: (action.payload as HomePayloadGetDashboard).dashboard,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof homeState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof homeState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof homeState>).state;
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
