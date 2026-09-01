/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
const LAST_ACTIVITY_KEY = "lastActivityAt";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (data) => {
    localStorage.setItem("token", data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

    setUser(data.user);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.clear();

    setUser(null);
    setToken(null);

    window.location.href = "/";
  };

  useEffect(() => {
    if (!token) return undefined;

    const updateLastActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const checkInactivity = () => {
      const storedToken = localStorage.getItem("token");
      const lastActivityAt = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

      if (!storedToken) {
        logout();
        return;
      }

      if (!lastActivityAt || Date.now() - lastActivityAt >= INACTIVITY_LIMIT_MS) {
        logout();
      }
    };

    const activityEvents = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];

    updateLastActivity();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, updateLastActivity, {
        passive: true,
      });
    });

    const interval = setInterval(checkInactivity, 15000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, updateLastActivity);
      });
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
