import { useEffect, useState } from "react";
import type { KnowledgeComponent } from "../../../shared/types/kc";
import { kcApi } from "../api/kcApi";

export function useKCs() {
  const [kcs, setKCs] = useState<KnowledgeComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void kcApi.getKCs().then((response) => {
      if (!active) {
        return;
      }

      setKCs(response.kcs);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { kcs, isLoading };
}
