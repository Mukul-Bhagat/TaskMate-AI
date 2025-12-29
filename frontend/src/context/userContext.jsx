import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeOrg, setActiveOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(false);

  const refetchUser = useCallback(() => {
    setLoading(true);
    setRefetchTrigger(prev => !prev);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    if (userData && userData.token) {
      localStorage.setItem("token", userData.token);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    setActiveOrg(null);
    localStorage.removeItem("token");
    localStorage.removeItem("activeOrgId");
  }, []);

  // Switch Organization Logic
  const switchOrganization = useCallback((orgId) => {
    if (!user || !user.memberships) return;

    const targetOrg = user.memberships.find(m => m.organizationId._id === orgId || m.organizationId === orgId);

    if (targetOrg) {
      // Backend stores organizationId as an object (populated) or string. Handle both.
      const idToSave = typeof targetOrg.organizationId === 'object'
        ? targetOrg.organizationId._id
        : targetOrg.organizationId;

      setActiveOrg(targetOrg);
      localStorage.setItem('activeOrgId', idToSave);

      // Optional: Trigger a window reload or specific refetch to update all data views
      // window.location.reload(); 
      // OR simply rely on the updated axios interceptor for subsequent calls
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = localStorage.getItem("token");
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        const userData = response.data;
        setUser(userData);

        // -- Active Org Logic --
        if (userData.memberships && userData.memberships.length > 0) {
          const storedOrgId = localStorage.getItem('activeOrgId');

          let initialOrg = null;
          if (storedOrgId) {
            initialOrg = userData.memberships.find(m =>
              (m.organizationId._id || m.organizationId) === storedOrgId
            );
          }

          // Default to first org if stored one is invalid/missing
          if (!initialOrg) {
            initialOrg = userData.memberships[0];
            const idToSave = initialOrg.organizationId._id || initialOrg.organizationId;
            localStorage.setItem('activeOrgId', idToSave);
          }

          setActiveOrg(initialOrg);
        } else {
          setActiveOrg(null);
        }

      } catch (error) {
        console.error("User not authenticated", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [refetchTrigger, clearUser]);

  const contextValue = useMemo(
    () => ({
      user,
      activeOrg,
      loading,
      updateUser,
      clearUser,
      refetchUser,
      switchOrganization
    }),
    [user, activeOrg, loading, updateUser, clearUser, refetchUser, switchOrganization]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
