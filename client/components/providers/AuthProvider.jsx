"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  getStoredUser,
  storeAuthSession
} from "@/lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const savedToken = getAuthToken();
      const savedRefreshToken = getRefreshToken();
      const savedUser = getStoredUser();

      if (!savedToken && !savedRefreshToken) {
        setInitialized(true);
        return;
      }

      try {
        let activeToken = savedToken;
        let activeRefreshToken = savedRefreshToken;

        if (!activeToken && activeRefreshToken) {
          const refreshedSession = await apiRequest("/auth/refresh", {
            method: "POST",
            body: {
              refreshToken: activeRefreshToken
            }
          });

          storeAuthSession(refreshedSession);
          activeToken = refreshedSession.token;
          activeRefreshToken = refreshedSession.refreshToken;
          setToken(refreshedSession.token);
          setRefreshToken(refreshedSession.refreshToken);
          setUser(refreshedSession.user);
        }

        const response = await apiRequest("/auth/me", {
          token: activeToken
        });

        storeAuthSession({
          token: activeToken,
          refreshToken: activeRefreshToken,
          user: response.user || savedUser
        });
        setToken(activeToken);
        setRefreshToken(activeRefreshToken);
        setUser(response.user || savedUser);
      } catch (error) {
        if (savedRefreshToken) {
          try {
            const refreshedSession = await apiRequest("/auth/refresh", {
              method: "POST",
              body: {
                refreshToken: savedRefreshToken
              }
            });

            storeAuthSession(refreshedSession);
            setToken(refreshedSession.token);
            setRefreshToken(refreshedSession.refreshToken);
            setUser(refreshedSession.user);
          } catch (refreshError) {
            clearAuthSession();
          }
        } else {
          clearAuthSession();
        }
      } finally {
        setInitialized(true);
      }
    };

    boot();
  }, []);

  const login = (session) => {
    storeAuthSession(session);
    setToken(session.token);
    setRefreshToken(session.refreshToken || null);
    setUser(session.user);
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await apiRequest("/auth/logout", {
          method: "POST",
          body: {
            refreshToken
          }
        });
      }
    } catch (error) {
      // Clear the local session even if the network request fails.
    } finally {
      clearAuthSession();
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      refreshToken,
      user,
      initialized,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [initialized, refreshToken, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
