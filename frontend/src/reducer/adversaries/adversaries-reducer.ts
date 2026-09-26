import {
  adversariesState,
  adversariesActionTypes,
  adversariesActions,
  AdversariesPayloadGetAdversaries,
  AdversariesPayloadGetAdversaryData,
  AdversariesPayloadGetAdversariesMitre,
  AdversariesPayloadGetAdversarySchedule,
  adversaryMitre,
  AdversariesPayloadGetAdversariesDashboard,
  AdversariesPayloadGetAdversariesDetail,
} from "../../types/adversaries";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const AdversariesInitialState: adversariesState = {
  adversaries: INITIAL_REDUCER_DATA,
  adversary: INITIAL_REDUCER_DATA,
  adversarySchedule: INITIAL_REDUCER_DATA,
  adversariesDashboard: INITIAL_REDUCER_DATA,
  adversariesDetail: INITIAL_REDUCER_DATA,
  mitres: INITIAL_REDUCER_DATA,
  getAdversariesMitre: () => { },
  getAdversaryData: () => { },
  getAdversariesDetail: () => { },
  getAdversarySchedule: () => { },
  getAdversaries: () => { },
  getAdversariesDashboard: () => { },
  runAdversarySchedule: async () => await false,
};

export const AdversariesReducer = (
  state: adversariesState,
  action: adversariesActions<adversariesActionTypes>
): adversariesState => {
  switch (action.type) {
    case "SET_ADVERSARIES":
      return {
        ...state,
        adversaries: {
          ...state.adversaries,
          data: (action.payload as AdversariesPayloadGetAdversaries).adversaries,
        },
      };
    case "SET_ADVERSARIES_DASHBOARD":
      return {
        ...state,
        adversariesDashboard: {
          ...state.adversariesDashboard,
          data: (action.payload as AdversariesPayloadGetAdversariesDashboard).adversariesDashboard,
        },
      };
    case "SET_ADVERSARY_DATA":
      return {
        ...state,
        adversary: {
          ...state.adversary,
          data: (action.payload as AdversariesPayloadGetAdversaryData).adversary,
        },
      };
    case "SET_ADVERSARIES_DETAIL":
      return {
        ...state,
        adversariesDetail: {
          ...state.adversariesDetail,
          data: (action.payload as AdversariesPayloadGetAdversariesDetail).adversariesDetail,
        },
      };
    case "SET_ADVERSARIES_MITRE": {
      {
        const mitres = (action.payload as AdversariesPayloadGetAdversariesMitre).mitres
        const data: adversaryMitre = {};
        Object.keys(mitres).map((technique) => data[technique] = mitres[technique])

        return {
          ...state,
          mitres: {
            ...state.mitres,
            data: {
              ...state.mitres.data,
              ...data
            }
          }
        }
      }
    }
    case "SET_ADVERSARY_SCHEDULE":
      return {
        ...state,
        adversarySchedule: {
          ...state.adversarySchedule,
          data: (action.payload as AdversariesPayloadGetAdversarySchedule).adversarySchedule,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof adversariesState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof adversariesState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof adversariesState>).state;
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
