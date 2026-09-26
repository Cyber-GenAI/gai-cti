import {
  userState,
  userActionTypes,
  userActions,
  UserPayloadGetUserStatus,
  UserPayloadGetUsers,
  UserPayloadGetUserForm,
  UserPayloadGetUser
} from "../../types/user";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const UsersInitialState: userState = {
  isAdmin: INITIAL_REDUCER_DATA,
  user: INITIAL_REDUCER_DATA,
  users: INITIAL_REDUCER_DATA,
  userForm: INITIAL_REDUCER_DATA,
  getUsers: () => {},
  getUser: () => {},
  getUserForm: () => {},
  getUserStatus: async () => await false,
  createUser: async () => await false,
  deleteUser: async () => await false,
  changeUserPassword: async () => await false,
};

export const UsersReducer = (
  state: userState,
  action: userActions<userActionTypes>
): userState => {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: {
          ...state.users,
          data: (action.payload as UserPayloadGetUsers).users,
        },
      };
    case "SET_USER":
      return {
        ...state,
        user: {
          ...state.user,
          data: (action.payload as UserPayloadGetUser).user,
        },
      };
    case "SET_USER_FORM":
      return {
        ...state,
        userForm: {
          ...state.userForm,
          data: (action.payload as UserPayloadGetUserForm).userForm,
        },
      }
    case "SET_USER_STATUS":
      return {
        ...state,
        isAdmin: {
          ...state.isAdmin,
          data: (action.payload as UserPayloadGetUserStatus).isAdmin,
        },
      }
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof userState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof userState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof userState>).state;
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
