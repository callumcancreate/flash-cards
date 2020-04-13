import React, { createContext, useState, useEffect } from 'react';
import api from '../../apis/serverApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // TODO: useeffect to set initial state
  // TODO: Login functions
  useEffect(() => {
    (async () => {
      const csrf = JSON.parse(localStorage.getItem('csrf'));
      if (!csrf) return;
      const {
        data: { user: profile }
      } = await api.secure.get('/users/me');
      setUser(profile);
    })();
  }, []);

  const login = ({ user: data, csrf }) => {
    localStorage.setItem('csrf', JSON.stringify(csrf));
    setUser(data);
  };
  const logout = () => {
    localStorage.removeItem('csrf');
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
