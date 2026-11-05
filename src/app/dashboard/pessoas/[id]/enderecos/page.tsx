"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import EnderecoForm from "@/components/custom/dashboard/pessoa/form-endereco";
import { BASE_URL } from "@/lib/utils";
import { Pessoa } from "neocatecumenal";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PessoaEnderecoPage() {
  const params = useParams();
  const pessoaId = params.id;

  const [pessoa, setPessoa] = useState<Pessoa>();

  useEffect(() => {
    const fetchData = async () => {
      async function getPessoa() {
        const res = await fetch(`${BASE_URL}/api/ambrosio/pessoa/${pessoaId}`);
        return res.json();
      }

      try {
        const [resPessoa] = await Promise.all([getPessoa()]);
        setPessoa(resPessoa);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [pessoaId]);

  if (!pessoa) {
    return (
      <div>
        <h2>Carregando ...</h2>
      </div>
    );
  }

  return (
    <div>
      <PageSubtitle
        title={`Adicionar endereço de ${pessoa.nome}`}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: `/dashboard/pessoas/${pessoa.id}`,
            buttonShow: true,
          },
        ]}
      />

      <EnderecoForm pessoa={pessoa} urlBase={BASE_URL} />
    </div>
  );
}
