export interface User {
  id: number;
  username: string;
  isadmin?: boolean;
}

/** Shape stored in the `userdata` cookie via app/util/UserData.tsx. */
export interface UserData {
  id: number;
  username: string;
  token: string;
  isadmin?: boolean;
  rememberUser?: boolean;
}
