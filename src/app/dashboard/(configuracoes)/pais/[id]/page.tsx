"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import PaisForm from "@/components/custom/dashboard/pais/form-pais";
import LabelData from "@/components/custom/dashboard/pessoa/label-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IPais } from "@/interfaces/IPais";
import { BASE_URL } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarPaisPage() {
  const params = useParams();
  const router = useRouter();
  const paisId = params.id;
  const routeRedirect = "/dashboard/pais";

  const [pais, setPais] = useState<IPais>();
  const [editar, setEditar] = useState<boolean>(false);
  const [redirectNotFound, setRedirectNotFound] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      async function getPais() {
        const res = await fetch(
          `${BASE_URL}/api/ambrosio/configuracoes/pais/${paisId}`,
        );

        if (res.status === 404) {
          setRedirectNotFound(true);
        }

        return res.json();
      }

      try {
        const [resPais] = await Promise.all([getPais()]);
        setPais(resPais);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [paisId]);

  if (redirectNotFound) {
    router.push(routeRedirect);
  }

  if (!pais) {
    return (
      <div>
        <h2>Carregando ...</h2>
      </div>
    );
  }

  return (
    <div>
      <PageSubtitle
        title={`Editar ${pais.nome}`}
        subTitle={pais.regiao}
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: routeRedirect,
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      {!editar && (
        <div className="flex justify-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{pais.nome}</CardTitle>
              <CardDescription>Dados principais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <LabelData titulo="Região" descricao={`${pais.regiao}`} />
              <LabelData titulo="Subregião" descricao={`${pais.subRegiao}`} />
              <LabelData
                titulo="Região Intermediaria"
                descricao={`${pais.regiaoIntermediaria ? pais.regiaoIntermediaria : ""}`}
              />
              <LabelData titulo="Lingua" descricao={`${pais.lingua}`} />
              <LabelData titulo="Capital" descricao={`${pais.capital}`} />
            </CardContent>
            <CardFooter>
              <Button disabled onClick={() => setEditar(!editar)}>
                Editar dados
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {editar && <PaisForm urlBase={BASE_URL} pais={pais} />}
    </div>
  );
}
