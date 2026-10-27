import { AmbrosioBaseUrl } from "@/lib/utils";
import { Pessoa } from "neocatecumenal";
import { cookies } from "next/headers";

const url = `${AmbrosioBaseUrl}/pessoa`;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    return Response.json(
      {
        message: "Pessoa não encontrada",
      },
      {
        status: 404,
      },
    );
  }

  if (res.status === 401) {
    return Response.json(
      {
        message: "Não autorizado",
      },
      {
        status: 401,
      },
    );
  }

  const response = await res.json();
  const data = response.data;

  // Retornar apenas os dados serializáveis
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    id: data.id,
    externalId: data.externalId,
    nome: data.nome,
    conhecidoPor: data.conhecidoPor,
    cpf: data.cpf,
    sexo: data.sexo,
    nacionalidade: data.nacionalidade,
    estadoCivil: data.estadoCivil,
    dataNascimento: data.dataNascimento
      ? new Date(data.dataNascimento).toISOString()
      : null,
    foto: data.foto,
    ativo: data.ativo,
    escolaridade: data.escolaridade,
    situacaoReligiosa: {
      id: data.situacaoReligiosa?.id,
      descricao: data.situacaoReligiosa?.descricao,
      sexoUnico: data.situacaoReligiosa?.sexoUnico,
    },
    carismas: data.carismas || [],
    enderecos: data.enderecos || [],
    contatos: data.contatos || [],
    comunidade: data.comunidade,
  };

  // Adicionar cônjuge se existir
  if (data.conjugue) {
    payload.conjugue = {
      id: data.conjugue.id,
      nome: data.conjugue.nome,
      externalId: data.conjugue.externalId,
    };
  }

  return Response.json(payload);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const data = await req.json();

  const pessoa: Partial<Pessoa> = {
    nome: data.nome,
    conhecidoPor: data.conhecidoPor,
    cpf: data.cpf,
    estadoCivil: data.estadoCivil,
    situacaoReligiosa: {
      id: parseInt(data.situacaoReligiosa),
      descricao: "situacaoReligiosa",
    },
    sexo: data.sexo,
    nacionalidade: data.nacionalidade,
  };

  // Só inclui escolaridade se os dados estiverem presentes
  if (data.escolaridade !== "0") {
    pessoa.escolaridade = data.escolaridade;
  }

  // Adicionar cônjuge se existir
  if (data.conjugue) {
    pessoa.conjugue = {
      id: data.conjugue.id,
      nome: data.conjugue.nome,
      externalId: data.conjugue.externalId,
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${url}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pessoa),
  });

  const resData = await res.json();

  if (res.status === 200) {
    return Response.json(resData, {
      status: 200,
    });
  } else {
    return Response.json(
      {
        message: resData.message || "Erro ao atualizar pessoa. Avisar time do TI",
      },
      {
        status: res.status,
      },
    );
  }
}
