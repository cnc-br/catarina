"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import { use, useState } from "react";
import Link from "next/link";
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
import { ordenarEtapasComunidade } from "@/lib/ordenarEtapasComunidade";

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
    const etapasOrdenadas = ordenarEtapasComunidade(
      comunidade.comunidadeEtapas,
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
              {comunidade.carismas && comunidade.carismas.length > 0 ? (
                <div className="flex flex-col space-y-4">
                  {comunidade.carismas.map((carisma) => (
                    <div key={carisma.id}>
                      <div className="text-base font-semibold">
                        {carisma.descricao}
                      </div>
                      <ul className="mt-1 list-disc pl-5">
                        {carisma.pessoas.map((pessoa) => (
                          <li key={pessoa.id}>
                            {pessoa.conjugue ? (
                              <>
                                <Link
                                  href={`/dashboard/pessoas/${pessoa.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {pessoa.nome}
                                </Link>
                                {" e "}
                                <Link
                                  href={`/dashboard/pessoas/${pessoa.conjugue.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {pessoa.conjugue.nome}
                                </Link>
                              </>
                            ) : (
                              <Link
                                href={`/dashboard/pessoas/${pessoa.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {pessoa.nome}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="italic text-slate-500">
                  Nenhum carisma cadastrado para esta comunidade
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
