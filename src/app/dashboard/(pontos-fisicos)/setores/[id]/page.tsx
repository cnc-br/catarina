"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import SetorForm from "@/components/custom/dashboard/setores/form-setor";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { useToast } from "@/components/ui/use-toast";
import { BASE_URL } from "@/lib/utils";
import { Setor } from "neocatecumenal";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarSetorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const setorId = String(params.id);
  const [setor, setSetor] = useState<Setor>();
  const [carregandoSetor, setCarregandoSetor] = useState(true);

  useEffect(() => {
    let ativo = true;

    const carregarSetor = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/ambrosio/setor/${setorId}`);
        const data = await res.json().catch(() => null);

        if (!ativo) {
          return;
        }

        if (res.status === 404) {
          toast({
            title: "Setor não encontrado",
            variant: "destructive",
            description: "O setor informado não existe.",
          });
          router.push("/dashboard/setores");
          return;
        }

        if (res.status === 401 || res.status === 403) {
          toast({
            title: "Sem permissão",
            variant: "destructive",
            description: "Você não tem permissão para acessar esse setor.",
          });
          router.push("/dashboard/setores");
          return;
        }

        if (!res.ok) {
          toast({
            title: "Erro ao carregar setor",
            variant: "destructive",
            description: data?.message ?? "Tente novamente.",
          });
          router.push("/dashboard/setores");
          return;
        }

        setSetor(data);
      } catch (error) {
        if (!ativo) {
          return;
        }
        console.error(error);
        toast({
          title: "Erro de conexão",
          variant: "destructive",
          description:
            "Não foi possível conectar ao servidor. Tente novamente.",
        });
        router.push("/dashboard/setores");
      } finally {
        if (ativo) {
          setCarregandoSetor(false);
        }
      }
    };

    carregarSetor();

    return () => {
      ativo = false;
    };
  }, [setorId, router, toast]);

  if (carregandoSetor) {
    return <SkeletonLoading mensagem="Carregando setor ..." />;
  }

  if (!setor) {
    return <SkeletonLoading mensagem="Carregando setor ..." />;
  }

  return (
    <div>
      <PageSubtitle
        title={`Setor: ${setor.descricao}`}
        subTitle={setor.regiao?.descricao}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/setores",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      <SetorForm urlBase={BASE_URL} setor={setor} />
    </div>
  );
}
