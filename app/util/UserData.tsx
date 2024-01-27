'use client'
import { useState } from 'react';
import Cookies from "js-cookie";

export default function UserData() {
  const getUserData = () => {
    const userDataString = Cookies.get('userdata');
    if(userDataString)
        return userDataString
    else
        return null
  };

  const getUsername = () => {
    const userData = Cookies.get('userdata');
    if(!userData)
      return null
    const username = JSON.parse(userData).username;
    if(username)
        return username
    else
        return null
  };

  const getUserId = () => {
    const userData = Cookies.get('userdata');
    if(!userData)
      return null
    const id = JSON.parse(userData).id;
    if(id)
        return id
    else
        return null
  };

  const getUsertoken = () => {
    const userData = Cookies.get('userdata');
    if(!userData)
      return null
    const token = JSON.parse(userData).token;
    if(token)
        return token
    else
        return null
  };

  const getUserAdmin = () => {
    const userData = Cookies.get('userdata');
    if(!userData)
      return null
    const admin = JSON.parse(userData).isadmin;
    if(admin)
        return admin
    else
        return null
  };

  const removeUserData = () => {
    const userData = Cookies.get('userdata');
    if(!userData)
      return null
    
      Cookies.remove('userdata');
      window.location.reload();
      return null;
  };

  const [user, setUserData] = useState<any>(getUserData());
  const [userName] = useState(getUsername());
  const [userToken] = useState(getUsertoken());
  const [userId] = useState(getUserId());
  const [isAdmin] = useState(getUserAdmin());

  const saveUserData = (userData: any) => {
    Cookies.set('userdata', JSON.stringify(userData), userData.rememberUser ? { expires: 90 }: {});
    setUserData(userData);
  };

  return {
    setUserData: saveUserData,
    user,
    userName,
    userId,
    userToken,
    isAdmin,
    removeUserData
  }
}