import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getConfiguracoes } from "../services/configuracoesService";

export const useConfiguracoes = () => {
  const { currentUser } = useAuth();
  const [config, setConfig] = useState<{
    capa: string;
    corLayout: string;
    nomeLoja: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const configData = await getConfiguracoes(currentUser.uid);
        setConfig({
          capa: configData.aparencia.capa || "",
          corLayout: configData.aparencia.corLayout || "#8B4513",
          nomeLoja: configData.geral.nomeLoja || "",
        });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        setConfig({
          capa: "",
          corLayout: "#8B4513",
          nomeLoja: "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [currentUser]);

  return { config, loading };
};
