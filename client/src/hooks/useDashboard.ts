import { useEffect, useState } from "react";
import type { GetDashboardResponse } from "../types/api";
import { dashboardApi } from "../api/dashboardApi";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<GetDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void dashboardApi.getDashboard().then((response) => {
      if (!active) {
        return;
      }

      setDashboard(response);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { dashboard, isLoading };
}
