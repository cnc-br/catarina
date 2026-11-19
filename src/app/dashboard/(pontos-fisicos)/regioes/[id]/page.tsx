"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import RegiaoForm from "@/components/custom/dashboard/regiao/form-regiao";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { useToast } from "@/components/ui/use-toast";
import { BASE_URL } from "@/lib/utils";
import { Regiao } from "neocatecumenal";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarRegiaoPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const regiaoId = String(params.id);
  const [regiao, setRegiao] = useState<Regiao>();
  const [carregandoRegiao, setCarregandoRegiao] = useState(true);

  useEffect(() => {
    let ativo = true;

    const carregarRegiao = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/ambrosio/regiao/${regiaoId}`);
        const data = await res.json().catch(() => null);

        if (!ativo) {
          return;
        }

        if (res.status === 404) {
          toast({
            title: "Região não encontrada",
            variant: "destructive",
            description: "A região informada não existe.",
          });
          router.push("/dashboard/regioes");
          return;
        }

        if (res.status === 401 || res.status === 403) {
          toast({
            title: "Sem permissão",
            variant: "destructive",
            description: "Você não tem permissão para acessar essa região.",
          });
          router.push("/dashboard/regioes");
          return;
        }

        if (!res.ok) {
          toast({
            title: "Erro ao carregar região",
            variant: "destructive",
            description: data?.message ?? "Tente novamente.",
          });
          router.push("/dashboard/regioes");
          return;
        }

        setRegiao(data);
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
        router.push("/dashboard/regioes");
      } finally {
        if (ativo) {
          setCarregandoRegiao(false);
        }
      }
    };

    carregarRegiao();

    return () => {
      ativo = false;
    };
  }, [regiaoId, router, toast]);

  if (carregandoRegiao) {
    return <SkeletonLoading mensagem="Carregando região ..." />;
  }

  if (!regiao) {
    return <SkeletonLoading mensagem="Carregando região ..." />;
  }

  return (
    <div>
      <PageSubtitle
        title={`Região: ${regiao.descricao}`}
        subTitle={regiao.macroRegiao?.descricao}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/regioes",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      <RegiaoForm urlBase={BASE_URL} regiao={regiao} />
    </div>
  );
}
