import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  user,
  userCreate,
  userForm,
  userState,
  userTable,
} from "../../types/user";
import {
  UsersReducer,
  UsersInitialState,
} from "../../reducer/user/users-reducer";
import {
  AR_GET_USER_STATUS,
  AR_GET_USER_TABLE,
  AR_GET_USER_FORM,
  AR_CREATE_USER,
  AR_DELETE_USER,
  AR_CHANGE_USER_PASSWORD,
  AR_CHANGE_CURRENT_USER_PASSWORD,
  AR_GET_USER_INFO,
} from "../../api/routes/user";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";

const UserContext = createContext<userState | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(UsersReducer, UsersInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof userState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof userState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    [clearKey]
  );

  const getUserStatus = useCallback(async () => {
    setIsLoading({ key: "isAdmin", state: true });
    try {
      const status = await request<boolean>({
        url: AR_GET_USER_STATUS,
        method: "GET",
      });

      dispatch({
        type: "SET_USER_STATUS",
        payload: { isAdmin: status },
      });

      return true;
    } catch {
      dispatch({
        type: "SET_USER_STATUS",
        payload: { isAdmin: false },
      });
      return false;
    } finally {
      setIsLoading({ key: "isAdmin", state: false });
    }
  }, [setIsLoading]);

  const getUserForm = useCallback(async () => {
    setIsLoading({ key: "userForm", state: true });

    const data = await request<userForm>({
      url: AR_GET_USER_FORM,
      method: "GET",
    });

    dispatch({
      type: "SET_USER_FORM",
      payload: { userForm: data },
    });

    setIsLoading({ key: "userForm", state: false });
  }, [setIsLoading]);

  const getUsers = useCallback(async () => {
    setIsLoading({ key: "users", state: true });

    const data = await request<userTable>({
      url: AR_GET_USER_TABLE,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_USERS",
      payload: { users: data },
    });

    setIsLoading({ key: "users", state: false });
  }, [setIsLoading]);

  const getUser = useCallback(async () => {
    setIsLoading({ key: "user", state: true });

    const data = await request<user>({
      url: AR_GET_USER_INFO,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_USER",
      payload: { user: data },
    });

    setIsLoading({ key: "user", state: false });
  }, [setIsLoading]);

  const createUser = useCallback(async (user: userCreate) => {
    try {
      await request<null>({
        url: AR_CREATE_USER,
        method: "PUT",
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
        },
        data: {
          ...user,
          hash_password: btoa(user.password)
        }
      });

      return true
    } catch {
      return false
    }
  }, []);

  const deleteUser = useCallback(async (userName: string) => {
    try {
      await request<null>({
        url: AR_DELETE_USER(userName),
        method: "DELETE",
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
        },
      });

      return true
    } catch {
      return false
    }
  }, []);

  const changeUserPassword = useCallback(async (password: string, userName?: string) => {
    try {
      await request<null>({
        url: userName ? AR_CHANGE_USER_PASSWORD(userName) : AR_CHANGE_CURRENT_USER_PASSWORD,
        method: "PATCH",
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
        data: { password: password }
      });

      return true
    } catch {
      return false
    }
  }, []);

  const value = useMemo<userState>(
    () => ({
      ...state,
      getUserStatus,
      getUserForm,
      getUsers,
      getUser,
      createUser,
      deleteUser,
      changeUserPassword,

    }),
    [changeUserPassword, createUser, deleteUser, getUser, getUserForm, getUserStatus, getUsers, state]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): userState => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
