import { AmbrosioBaseUrl } from "@/lib/utils";
import { PessoaContato } from "neocatecumenal";
import { cookies } from "next/headers";

const TIPOS_TELEFONE = ["CELULAR", "RESIDENCIAL", "COMERCIAL"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const data = await req.json();

  if (typeof data.tipoTelefone !== "string" || !TIPOS_TELEFONE.includes(data.tipoTelefone)) {
    return Response.json(
      {
        message:
          "tipoTelefone inválido. Valores permitidos: CELULAR, RESIDENCIAL, COMERCIAL",
      },
      {
        status: 400,
      },
    );
  }

  if (typeof data.telefone !== "string" || data.telefone.trim() === "") {
    return Response.json(
      {
        message: "telefone é obrigatório",
      },
      {
        status: 400,
      },
    );
  }

  if (
    data.email !== undefined &&
    data.email !== null &&
    data.email !== "" &&
    (typeof data.email !== "string" || !EMAIL_REGEX.test(data.email))
  ) {
    return Response.json(
      {
        message: "email inválido",
      },
      {
        status: 400,
      },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const contato: Partial<PessoaContato> = {
    tipoTelefone: data.tipoTelefone,
    telefone: data.telefone,
    email: data.email || undefined,
    observacao: data.observacao || undefined,
    contatoPrincipal: data.contatoPrincipal ?? false,
  };

  const res = await fetch(`${AmbrosioBaseUrl}/pessoa/${id}/contato`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contato),
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

  if (res.ok) {
    const resData = await res.json().catch(() => null);
    return Response.json(
      resData ?? { message: "Contato cadastrado com sucesso" },
      {
        status: res.status,
      },
    );
  }

  const resData = await res.json().catch(() => null);
  return Response.json(
    {
      message:
        resData?.message || "Erro ao cadastrar contato. Avisar time do TI",
    },
    {
      status: res.status,
    },
  );
}
