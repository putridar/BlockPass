import React, { useState, useEffect } from 'react';
import * as authClient from '../utils/auth-client';

const AuthContext = React.createContext({});

function AuthProvider(props) {
  const [data, setData] = useState({
    status: 'pending',
    user: null,
  });

  useEffect(() => {
    
    authClient
    .loginWithToken().then((resp) => setData({ status: 'success', user : resp }))
    .catch((err) => {
      authClient.logout();
      setData({ ...data, status: 'success' });
    });

  }, []);

  // 🚨 this is the important bit.
  // Normally your provider components render the context provider with a value.
  // But we post-pone rendering any of the children until after we've determined
  // whether or not we have a user token and if we do, then we render a spinner
  // while we go retrieve that user's information.
  if (data.status === 'pending') {
    return 'Loading...';
  }

  const login = async ( walletAddress, password ) => {
    const user = await authClient.loginWithWallet(walletAddress, password);
    console.log(user);
    setData({...data, user : user});
  }; // make a login request
  
  const logout = () => {
    authClient.logout();
    setData({ user: null });
  }; // clear the token in window.localStorage and the user data
  
  return (
    <AuthContext.Provider
      value={{ login, logout, data }}
      {...props}
    />
  );
}

const useAuth = () => React.useContext(AuthContext);
const useUser = () => useAuth().data.user;

export { AuthProvider, useAuth, useUser };