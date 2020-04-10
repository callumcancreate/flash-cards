import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // TODO: useeffect to set initial state

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
