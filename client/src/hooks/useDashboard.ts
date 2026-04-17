import { useEffect, useState } from "react";
import type { GetDashboardResponse } from "../types/api";
import { dashboardApi } from "../api/dashboardApi";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<GetDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (isActive = () => true) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dashboardApi.getDashboardData();
      if (isActive()) {
        setDashboard(response);
      }
    } catch (loadError) {
      if (isActive()) {
        setDashboard(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load dashboard data.",
        );
      }
    } finally {
      if (isActive()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;
    void loadDashboard(() => active);

    return () => {
      active = false;
    };
  }, []);

  return {
    dashboard,
    isLoading,
    error,
    reloadDashboard: () => loadDashboard(),
  };
}
