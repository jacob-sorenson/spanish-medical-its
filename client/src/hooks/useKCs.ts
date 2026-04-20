import { useEffect, useState } from "react";
import type { KnowledgeComponent } from "../../../shared/types/kc";
import { kcApi } from "../api/kcApi";

export function useKCs() {
  const [kcs, setKCs] = useState<KnowledgeComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKCs = async (isActive = () => true) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await kcApi.getKCs();

      if (!isActive()) {
        return;
      }

      setKCs(response.kcs);
    } catch (loadError) {
      if (!isActive()) {
        return;
      }

      setKCs([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load terms.",
      );
    } finally {
      if (isActive()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    void loadKCs(() => active);

    return () => {
      active = false;
    };
  }, []);

  return {
    kcs,
    isLoading,
    error,
    reloadKCs: () => loadKCs(),
  };
}
