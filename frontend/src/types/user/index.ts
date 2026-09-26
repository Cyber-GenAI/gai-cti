import { genericTable } from "../../components";
import { InputField } from "../../components/Form/types";
import { genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"

export type user = {
  lname: string,
  fname: string,
  username: string,
  hash_password: string,
  last_login: string,
  creation_date: string,
}

export type userCreate = Omit<user, "last_login" | "creation_date" | "hash_password"> & {
  password: string
};

export type userTable = genericTable<string | string[] | number>
export type userForm = InputField[] 

export type userState = {
  isAdmin: genericContext<boolean>;
  user: genericContext<user>;
  users: genericContext<userTable>;
  userForm: genericContext<userForm>;
  getUsers: () => void; 
  getUserForm: () => void;
  getUserStatus: () => Promise<boolean>;
  getUser: () => void;
  createUser: (user: userCreate) => Promise<boolean>;
  deleteUser: (userName: string) => Promise<boolean>;
  changeUserPassword: (password: string, userName?: string) => Promise<boolean>;
}

export type UserPayloadGetUserStatus = {
  isAdmin: boolean
}

export type UserPayloadGetUsers = {
  users: userTable
}

export type UserPayloadGetUser = {
  user: user
}

export type UserPayloadGetUserForm = {
  userForm: userForm
}

export type userActionTypes = "SET_USERS" | "SET_USER" | "SET_USER_STATUS" | "SET_USER_FORM"

export type userActions<T> = {
    type: T | "SET_ISLOADING" | "CLEAR_KEY"
    payload: UserPayloadGetUserStatus
    | UserPayloadGetUsers
    | UserPayloadGetUser
    | UserPayloadGetUserForm
    | globalPayloadSetIsLoading<keyof userState>
    | globalPayloadClearData<keyof userState>
}