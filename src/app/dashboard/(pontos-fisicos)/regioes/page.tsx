"use client";

import { useEffect, useState } from "react";
import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { BASE_URL } from "@/lib/utils";
import { Regiao } from "neocatecumenal";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import ListRegiao from "@/components/custom/dashboard/regiao/list-regiao";

export default function RegiaoPage() {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRegioes = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/ambrosio/regiao`);
        const data = await res.json();
        setRegioes(data.data);
      } catch (error) {
        console.error("Erro ao listar regiões", error);
      } finally {
        setLoading(false);
      }
    };

    getRegioes();
  }, []);

  const listar = () => {
    if (regioes) {
      return <ListRegiao regioes={regioes} />;
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
        title={`Regiões - ${regioes ? regioes.length : 0}`}
        subTitle="do Brasil"
        buttons={[
          {
            buttonText: "Cadastrar",
            buttonUrl: "/dashboard/regioes/novo",
            buttonShow: true,
          },
        ]}
      />

      {loading ? (
        <SkeletonLoading mensagem="Carregando regiões ..." />
      ) : (
        listar()
      )}
    </div>
  );
}
