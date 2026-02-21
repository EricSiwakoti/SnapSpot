import { useState, useCallback, useEffect, useRef } from "react";
import { useHttpClient, API_BASE } from "./http-hook";
import { toast } from "react-toastify";

const logoutTimer = useRef();

export const useAuth = () => {
  const [token, setToken] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(false);
  const { sendRequest } = useHttpClient();

  const login = useCallback((uid, expirationDate) => {
    setToken(true); // Token existence is implied by HttpOnly cookie
    setUserId(uid);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    // Only store userId (non-sensitive), NOT the token
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        expiration: tokenExpirationDate.toISOString(),
      }),
    );
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    localStorage.removeItem("userData");
    // Call backend logout to clear HttpOnly cookie
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
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.userId &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(storedData.userId, new Date(storedData.expiration));
    }
  }, [login]);

  return { token, login, logout, userId };
};
