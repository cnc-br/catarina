import { normalizarMensagem } from "@/lib/api/ambrosio";
import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const url = `${AmbrosioBaseUrl}/macro-regiao`;

export async function GET() {
  const res = await fetch(url);

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
    data.descricao.trim().length === 0
  ) {
    return Response.json(
      {
        message: "Descricao e obrigatoria",
      },
      {
        status: 400,
      },
    );
  }

  const macroRegiao = {
    descricao: data.descricao,
    ativo: data.ativo === undefined ? true : data.ativo,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(macroRegiao),
  });

  const resData = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      {
        message: "Você não tem permissão para cadastrar macro região",
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
        "Não foi possível cadastrar a macro região",
      ),
    },
    {
      status: res.status,
    },
  );
}
