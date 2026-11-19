import { normalizarMensagem } from "@/lib/api/ambrosio";
import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const url = `${AmbrosioBaseUrl}/regiao`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${url}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    return Response.json(
      {
        message: "Região não encontrada",
      },
      {
        status: 404,
      },
    );
  }

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      {
        message: "Você não tem permissão para acessar essa região",
      },
      {
        status: res.status,
      },
    );
  }

  const data = await res.json().catch(() => null);
  return Response.json(data?.data ?? data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const data = await req.json().catch(() => null);

  if (!data) {
    return Response.json(
      {
        message: "Corpo da requisição inválido",
      },
      {
        status: 400,
      },
    );
  }

  const regiao: Record<string, unknown> = {};

  if (data.descricao !== undefined) {
    regiao.descricao = data.descricao;
  }

  if (data.macroRegiaoId !== undefined) {
    regiao.macroRegiao = {
      id: Number(data.macroRegiaoId),
    };
  } else if (data.macroRegiao?.id !== undefined) {
    regiao.macroRegiao = {
      id: Number(data.macroRegiao.id),
    };
  }

  if (data.ativo !== undefined) {
    regiao.ativo = data.ativo;
  }

  const res = await fetch(`${url}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(regiao),
  });

  const resData = await res.json().catch(() => null);

  if (res.status === 404) {
    return Response.json(
      {
        message: "Região não encontrada",
      },
      {
        status: 404,
      },
    );
  }

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      {
        message: "Você não tem permissão para editar região",
      },
      {
        status: res.status,
      },
    );
  }

  if (res.status === 200) {
    return Response.json(resData, {
      status: 200,
    });
  }

  return Response.json(
    {
      message: normalizarMensagem(
        resData?.message,
        "Não foi possível editar a região",
      ),
    },
    {
      status: res.status,
    },
  );
}
