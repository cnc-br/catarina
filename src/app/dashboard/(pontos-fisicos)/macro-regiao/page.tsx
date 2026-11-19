"use client";

import { useEffect, useState } from "react";
import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { BASE_URL } from "@/lib/utils";
import { MacroRegiao } from "neocatecumenal";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import ListMacroRegiao from "@/components/custom/dashboard/macro-regioes/list-macro-regiao";

export default function MacroRegiaoPage() {
  const [macroRegioes, setMacroRegioes] = useState<MacroRegiao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMacroRegioes = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/ambrosio/macro-regiao`);
        const data = await res.json();
        setMacroRegioes(data.data);
      } catch (error) {
        console.error("Erro ao listar macro regiões", error);
      } finally {
        setLoading(false);
      }
    };

    getMacroRegioes();
  }, []);

  const listar = () => {
    if (macroRegioes) {
      return <ListMacroRegiao macroRegioes={macroRegioes} />;
    } else {
      return (
        <div className="border p-4 text-center">
          <p className="text-gray-600">
            Esta página está pendente de implementação.
          </p>
        </div>
      );
    }
  };

  return (
    <div>
      <PageSubtitle
        title={`Macro Regiões - ${macroRegioes ? macroRegioes.length : 0}`}
        subTitle="do Brasil"
        buttons={[
          {
            buttonText: "Cadastrar",
            buttonUrl: "/dashboard/macro-regiao/novo",
            buttonShow: true,
          },
        ]}
      />

      {loading ? (
        <SkeletonLoading mensagem="Carregando macro regiões ..." />
      ) : (
        listar()
      )}
    </div>
  );
}
