import React, { createContext, useState, useEffect } from 'react';
import api from '../../apis/serverApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  // TODO: useeffect to set initial state
  // TODO: Login functions

  useEffect(() => {
    if (!isLoading)
      document.querySelector('#load-overlay').classList.add('hidden');
  }, [isLoading]);

  useEffect(() => {
    const csrf = JSON.parse(localStorage.getItem('csrf'));
    if (!csrf) return setLoading(false);
    api.secure
      .get('/users/me')
      .then((res) => {
        const profile = res.data.user;
        setUser(profile);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  }, []);

  const login = ({ user: data, csrf }) => {
    localStorage.setItem('csrf', JSON.stringify(csrf));
    setUser(data);
  };
  const logout = async () => {
    await api.secure.get('/users/auth/logout');
    localStorage.removeItem('csrf');
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
