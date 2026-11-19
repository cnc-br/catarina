"use client";

import { useEffect, useState } from "react";
import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { BASE_URL } from "@/lib/utils";
import { Setor } from "neocatecumenal";
import ListSetor from "@/components/custom/dashboard/setores/list-setor";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";

export default function SetorPage() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSetores = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/ambrosio/setor`);
        const data = await res.json();
        setSetores(data.data);
      } catch (error) {
        console.error("Erro ao listar setores", error);
      } finally {
        setLoading(false);
      }
    };

    getSetores();
  }, []);

  const listar = () => {
    if (setores) {
      return <ListSetor setores={setores} />;
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
        title={`Setores - ${setores ? setores.length : 0}`}
        subTitle="do Brasil"
        buttons={[
          {
            buttonText: "Cadastrar",
            buttonUrl: "/dashboard/setores/novo",
            buttonShow: true,
          },
        ]}
      />

      {loading ? (
        <SkeletonLoading mensagem="Carregando setores ..." />
      ) : (
        listar()
      )}
    </div>
  );
}
