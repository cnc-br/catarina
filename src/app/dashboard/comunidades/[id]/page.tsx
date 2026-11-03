"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { use, useState } from "react";
import { SkeletonLoading } from "@/components/custom/ui/SkeletonLoading";
import { BASE_URL } from "@/lib/utils";
import { ComunidadeEtapa } from "neocatecumenal";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PassarComunidadeDeEtapa } from "@/components/custom/dashboard/comunidade/dialog-passar-etapa";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ComunidadeForm from "@/components/custom/dashboard/comunidade/form-comunidade";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, UsersIcon } from "lucide-react";
import { useComunidadeById } from "@/hooks/useComunidadeById";

export default function EditarComunidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { id } = use(params);
  const { comunidade, fetchComunidade } = useComunidadeById({ id });
  const formatDate = (date?: Date) =>
    date
      ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date)
      : " - ";

  if (!comunidade)
    return <SkeletonLoading mensagem="Carregando comunidade ..." />;

  const renderEtapasRows = () => {
    // Aqui esta ordenando por data de criação, para garantir que as etapas sejam exibidas na ordem correta, mesmo que tenham sido criadas fora de ordem ou editadas
    // posteriormente. Assim, a linha mais antiga (primeira etapa) aparecerá primeiro, e a mais recente (etapa atual) aparecerá por último.
    const etapasOrdenadas = [...comunidade.comunidadeEtapas].sort(
      (a: ComunidadeEtapa, b: ComunidadeEtapa) => {
        const aCreatedAt = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bCreatedAt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aCreatedAt - bCreatedAt;
      },
    );

    return etapasOrdenadas.map((ce: ComunidadeEtapa) => (
      <TableRow key={ce.id}>
        <TableCell className="font-medium">{ce.etapa.descricao}</TableCell>
        <TableCell className="text-right">
          {formatDate(ce.dataInicio)}
        </TableCell>
        <TableCell>Não informado</TableCell>
        <TableCell className="text-right">
          <PassarComunidadeDeEtapa
            buttonDescription="Editar"
            comunidadeId={id}
            comunidadeEtapaId={ce.id}
            etapaAtual={ce.etapa}
            etapa={ce}
            onSuccess={fetchComunidade}
          />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div>
      <PageSubtitle
        title={`Comunidade ${comunidade.numeroDaComunidade} - ${comunidade.etapaAtual?.descricao || "Etapa: não foi cadastrada."}`}
        subTitle={`da paróquia ${comunidade.paroquia.descricao} - Qtd: ${comunidade.quantidadeMembros} irmãos`}
        buttons={[
          {
            buttonText: `Voltar para paroquia ${comunidade.paroquia.descricao}`,
            buttonUrl: `/dashboard/paroquias/${comunidade.paroquia.id}`,
            buttonShow: true,
            buttonVariant: "default",
          },
          {
            buttonText: "Voltar para comunidades",
            buttonUrl: "/dashboard/comunidades",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      <div className="my-3 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UsersIcon />
              <div>Comunidade {comunidade.numeroDaComunidade}</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2 mb-2">
              <div>
                Diocese:{" "}
                <strong>{comunidade.paroquia.diocese.descricao}</strong>
              </div>
              <div>
                Paróquia <strong>{comunidade.paroquia.descricao}</strong>
              </div>
              <div>
                Quantidade de irmãos:{" "}
                <Badge>{comunidade.quantidadeMembros}</Badge>
              </div>
            </div>
            <Button onClick={() => setIsEditing(true)}> Editar </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <InfoIcon />
              <div>Descrição / Observação</div>
            </CardTitle>
          </CardHeader>
          <CardContent>{comunidade.observacao || " - "}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 items-start">
        {isEditing ? (
          <div>
            <ComunidadeForm
              comunidade={comunidade}
              urlBase={BASE_URL}
              onSubmitSuccess={async () => {
                setIsEditing(false);
                await fetchComunidade();
              }}
            />
          </div>
        ) : (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Etapas / Catequistas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>
                    Historico das estapas da comunidade.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Etapa</TableHead>
                      <TableHead className="text-right">Data Etapa</TableHead>
                      <TableHead>Catequistas</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderEtapasRows()}</TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <PassarComunidadeDeEtapa
                  buttonDescription="Nova etapa"
                  comunidadeId={id}
                  etapaAtual={comunidade.etapaAtual}
                  onSuccess={fetchComunidade}
                />
              </CardFooter>
            </Card>
          </div>
        )}

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Carismas da comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="italic text-slate-500">
                Em breve carismas da comunidade
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
