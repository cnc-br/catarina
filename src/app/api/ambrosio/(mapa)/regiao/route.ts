import { normalizarMensagem } from "@/lib/api/ambrosio";
import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const url = `${AmbrosioBaseUrl}/regiao`;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      {
        message: "Você não tem permissão para acessar regiões",
      },
      {
        status: 401,
      },
    );
  }

  const data = await res.json();
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const data = await req.json().catch(() => null);

  if (
    !data ||
    typeof data.descricao !== "string" ||
    data.descricao.trim().length === 0 ||
    data.macroRegiaoId === undefined ||
    data.macroRegiaoId === null ||
    data.macroRegiaoId === ""
  ) {
    return Response.json(
      {
        message: "Descricao e macro regiao sao obrigatorias",
      },
      {
        status: 400,
      },
    );
  }

  const regiao = {
    descricao: data.descricao,
    macroRegiao: {
      id: Number(data.macroRegiaoId),
    },
    ativo: data.ativo === undefined ? true : data.ativo,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(regiao),
  });

  const resData = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      {
        message: "Você não tem permissão para cadastrar região",
      },
      {
        status: res.status,
      },
    );
  }

  if (res.status === 201) {
    return Response.json(resData, {
      status: 201,
    });
  }

  return Response.json(
    {
      message: normalizarMensagem(
        resData?.message,
        "Não foi possível cadastrar a região",
      ),
    },
    {
      status: res.status,
    },
  );
}
