import { useState, useCallback, useEffect, useRef } from "react";
import { useHttpClient, API_BASE } from "./http-hook";
import { toast } from "react-toastify";

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);
  const [userId, setUserId] = useState(false);
  const { sendRequest } = useHttpClient();
  const logoutTimer = useRef(null);

  const login = useCallback((uid, expirationDate) => {
    setToken(true); // Auth state is based on HttpOnly cookie presence
    setUserId(uid);

    const expiration =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);

    setTokenExpirationDate(expiration);

    // Store only non-sensitive user data
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        expiration: expiration.toISOString(),
      }),
    );
  }, []);

  const logout = useCallback(async () => {
    setToken(false);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem("userData");

    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }

    try {
      await sendRequest(`${API_BASE}/users/logout`, "POST");
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, [sendRequest]);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();

      if (remainingTime <= 0) {
        logout();
        return;
      }

      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }

      logoutTimer.current = setTimeout(logout, remainingTime);
    } else if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
  }, [token, tokenExpirationDate, logout]);

  useEffect(() => {
    try {
      const storedData = JSON.parse(localStorage.getItem("userData"));

      if (
        storedData?.userId &&
        storedData?.expiration &&
        new Date(storedData.expiration) > new Date()
      ) {
        login(storedData.userId, new Date(storedData.expiration));
      }
    } catch (err) {
      localStorage.removeItem("userData");
    }
  }, [login]);

  useEffect(() => {
    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
    };
  }, []);

  return { token, login, logout, userId };
};
