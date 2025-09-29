import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "/src/utils/axiosInstance";
import { API_PATHS } from "/src/utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(false); // New state to trigger refetch

  // New function to allow other components to trigger a refetch
  const refetchUser = useCallback(() => {
    setLoading(true); // Set loading to true to show loading state
    setRefetchTrigger(prev => !prev);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("token");
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.error("User not authenticated", error);
        clearUser(); // Clear user data if token is invalid
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [refetchTrigger]); // useEffect now depends on the trigger state

  const updateUser = useCallback((userData) => {
    setUser(userData);
    if (userData && userData.token) {
        localStorage.setItem("token", userData.token);
    }
    setLoading(false);
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      updateUser,
      clearUser,
      refetchUser, // Expose the new function to components
    }),
    [user, loading, updateUser, clearUser, refetchUser]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

