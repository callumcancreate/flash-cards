import React, { useEffect, useState } from 'react';
import Router from './Router';
import { AuthProvider } from './Auth';
import './App.scss';

// import 'remove-focus-outline';
// import "./App-dev.scss";

const App: React.FC = () => {
  const [isFocusOn, setFocus] = useState(false);

  // Effect to allow focus outline by keyboard but not mouse
  useEffect(() => {
    // Cancel effect if in server env
    if (!document) return null;

    function updateFocus(e) {
      switch (e.type) {
        case 'keydown':
          setFocus(true);
          break;
        case 'mousedown':
          setFocus(false);
          break;
        default:
        // no default
      }
    }
    // return null;
    document.addEventListener('keydown', updateFocus);
    document.addEventListener('mousedown', updateFocus);

    return () => {
      document.removeEventListener('keydown', updateFocus);
      document.removeEventListener('mousedown', updateFocus);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-focus', !isFocusOn);
  }, [isFocusOn]);
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App;
